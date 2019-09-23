import http = require("http");
import chromeLauncher = require("chrome-launcher");
import fetch from "node-fetch";
import { AddressInfo } from "ws";
import { Barrier } from "@hediet/std/synchronization";
import { AttachContext, Result } from "./attachContext";
import { readFileSync } from "fs";
import { join } from "path";

export async function showUI(context: AttachContext): Promise<Result> {
	let chromeDebugUrl: string;
	try {
		const data = await fetch(
			`http://localhost:${context.debuggerPort}/json/list`
		);
		const json = await data.json();

		chromeDebugUrl = json[0].devtoolsFrontendUrl as string;
		// We want to connect to the proxy debugger
		chromeDebugUrl = chromeDebugUrl.replace(
			context.debuggerPort.toString(),
			context.proxyPort.toString()
		);
	} catch (error) {
		return {
			successful: false,
			error,
			errorMessage: "Could not get debugger metadata.",
		};
	}

	let port: number | undefined = undefined;
	try {
		// we cannot open `chromeDebugUrl` directly, so open a window instead
		// prompting to copy that url into to address bar.
		// For that we need an http server.
		const serverListening = new Barrier();
		const server = http
			.createServer((_request, response) => {
				response.writeHead(200, { "Content-Type": "text/html" });
				response.end(getHtml(chromeDebugUrl, context.label));
			})
			.listen(null, async function(err: any, res: any) {
				serverListening.unlock();
			} as any);

		context.disposables.push({
			dispose: () => server.close(),
		});

		await serverListening.onUnlocked;
		port = (server.address() as AddressInfo).port;
	} catch (error) {
		return {
			successful: false,
			error,
			errorMessage: "Could not start http server for Chrome UI.",
		};
	}

	try {
		const url = `http://localhost:${port}`;
		await launchChrome(url, context);
		return {
			successful: true,
		};
	} catch (error) {
		return {
			successful: false,
			errorMessage: "Could not launch Chrome. Did you install Chrome?",
			error,
		};
	}
}

function getHtml(debugUrl: string, label: string | undefined) {
	const html = readFileSync(join(__dirname, "../../assets/ui.html"), {
		encoding: "utf-8",
	});
	const tpl = new SimpleTemplate<{ debugUrl: string; caption: string }>(html);
	const caption = `Easy Attach Breakpoint Triggered${
		label ? `: ${label}` : ""
	}`;
	return tpl.render({ debugUrl, caption });
}

class SimpleTemplate<T extends Record<string, string>> {
	constructor(private readonly str: string) {}

	render(data: T): string {
		return this.str.replace(/\$\{([a-zA-Z0-9]+)\}/g, (substr, grp1) => {
			return data[grp1];
		});
	}
}

async function launchChrome(url: string, context: AttachContext) {
	const width = 440;
	const height = 250;

	const chrome = await chromeLauncher.launch({
		startingUrl: url,
		chromeFlags: ["--app=" + url, `--window-size=${width},${height}`],
	});

	context.disposables.push({
		dispose: () => {
			if (!chrome.process.killed) {
				chrome.process.kill();
			}
		},
	});

	chrome.process.on("exit", () => {
		context.exit();
	});
}
