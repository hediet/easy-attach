import { AttachContext } from "./attachContext";

import http = require("http");
import chromeLauncher = require("chrome-launcher");
import fetch = require('node-fetch');

function getHtml(debugUrl: string) {
    return `
        <html>
            <head>
                <title>Easy Attach Breakpoint Triggered</title>
            </head>
            <body>
                <textarea id="link" style="width: 100%; height: 150px">${debugUrl}</textarea>
                <div style="margin: 10px">
                    Open this link in chrome address bar to start debugging, then close this window.
                </div>
                <div style="display: flex; flex-direction: row-reverse;">
                    <button onclick="closeWindow()">Close</button>
                </div>
                <script>
                    link.select();
                    function closeWindow() {
                        window.close();
                    }
                </script>
            </body>
        </html>
    `;
}

export async function launchServer(context: AttachContext) {
    try {
        const data = await fetch(`http://localhost:${context.debuggerPort}/json/list`);
        const json = await data.json();

        const chromeDebugUrl = json[0].devtoolsFrontendUrl;

        // we cannot open `chromeDebugUrl` directly, so open a window instead
        // prompting to copy that url into to address bar.
        // For that we need a server.
        const server = http.createServer((request, response) => {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end(getHtml(chromeDebugUrl));
        }).listen(null, async function (err, res) {
            const addr =  "http://localhost:" + server.address().port;

            const width = 500;
            const height = 300;
            // TODO
            //const windowX = screenWidth / 2 - width / 2;
            //const windowY = screenHeight / 2 - height / 2;
            // `--window-position=${windowX},${windowY}`

            const chrome = await chromeLauncher.launch({
                startingUrl: addr,
                chromeFlags: ["--app=" + addr, `--window-size=${width},${height}`]
            });

            context.disposables.push(() => {
                if (!chrome.process.killed) {
                    chrome.process.kill();
                }
            });

            chrome.process.on("exit", () => {
                context.exit();
            });
        });

        context.disposables.push(() => {
            server.close();
        });
    } catch (exception) {
        console.log("could not launch chrome: ", exception);
    }
}
