import { AttachContext } from "./attachContext";

import http = require("http");
import chromeLauncher = require("chrome-launcher");
import fetch from "node-fetch";
import { AddressInfo } from "ws";

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

export async function launchServer(context: AttachContext) {
	try {
		const data = await fetch(
			`http://localhost:${context.debuggerPort}/json/list`
		);
		const json = await data.json();

		let chromeDebugUrl = json[0].devtoolsFrontendUrl as string;
		// We want to connect to the proxy debugger
		chromeDebugUrl = chromeDebugUrl.replace(
			context.debuggerPort.toString(),
			context.proxyPort.toString()
		);

		// we cannot open `chromeDebugUrl` directly, so open a window instead
		// prompting to copy that url into to address bar.
		// For that we need an http server.
		const server = http
			.createServer((request, response) => {
				response.writeHead(200, { "Content-Type": "text/html" });
				response.end(getHtml(chromeDebugUrl, context.label));
			})
			.listen(null, async function(err: any, res: any) {
				const addr =
					"http://localhost:" +
					(server.address() as AddressInfo).port;

				const width = 440;
				const height = 250;
				// TODO
				//const windowX = screenWidth / 2 - width / 2;
				//const windowY = screenHeight / 2 - height / 2;
				// `--window-position=${windowX},${windowY}`

				const chrome = await chromeLauncher.launch({
					startingUrl: addr,
					chromeFlags: [
						"--app=" + addr,
						`--window-size=${width},${height}`,
					],
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
			} as any);

		context.disposables.push({
			dispose: () => server.close(),
		});
	} catch (exception) {
		console.log("could not launch chrome: ", exception);
	}
}
