import http = require("http");
import chromeLauncher = require("chrome-launcher");
import fetch from "node-fetch";
import { AddressInfo } from "ws";
import { Barrier } from "@hediet/std/synchronization";
import { AttachContext, Result } from "./attachContext";

export async function launchServer(context: AttachContext): Promise<Result> {
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
			.createServer((request, response) => {
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
	return `
<html>
	<head>
		<title>Easy Attach Breakpoint Triggered${label ? `: ${label}` : ""}</title>
	</head>
	<body
		style="
            background-color: rgb(240,240,240);
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            font-size: 14;
            height: 100%; width: 100%;
            display: flex;
            flex-direction: column;
            border: 0; margin: 0; padding: 10px;
            position: relative;
            box-sizing: border-box;
            "
	>
		<div style="flex: 1; display: flex;">
			<textarea id="link" style="flex: 1; width: 100%;">
${debugUrl}</textarea
			>
		</div>

		<div
			style="flex: 0 auto; display: flex; flex-direction: row-reverse; align-items: center; "
		>
			<button onclick="closeWindow()" style="width: 90px; height: 28px">
				Continue
			</button>
			<div style="width: 10px"></div>
			<button
				onclick="copy()"
				style="width: 90px; height: 28px; white-space: nowrap;"
			>
				Copy Link
			</button>
			<div style="margin: 10px; margin-right: auto;">
				Enter this link to the chrome address bar to start debugging.
			</div>
		</div>

		<script>
			link.select();
			function closeWindow() {
				window.close();
			}
			function copy() {
				link.select();
				document.execCommand("copy");
			}
		</script>
	</body>
</html>
    `;
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
