const http = require("http");
const chromeLauncher = require("chrome-launcher");
const fetch = require('node-fetch');

function getHtml(debugUrl) {
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

async function launchServer() {
    const data = await fetch("http://localhost:9229/json/list");
    const json = await data.json();
    // we cannot open this url directly, so open a window instead
    // prompting to copy that url into to address bar
    const chromeDebugUrl = json[0].devtoolsFrontendUrl;

    const server = http.createServer((request, response) => {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(getHtml(chromeDebugUrl));
    }).listen(null, async function (err, res) {
        const addr =  "http://localhost:" + this.address().port;
        
        const width = 500;
        const height = 300;
        // todo
        //const windowX = screenWidth / 2 - width / 2;
        //const windowY = screenHeight / 2 - height / 2;
        // `--window-position=${windowX},${windowY}`

        const chrome = await chromeLauncher.launch({
            startingUrl: addr,
            chromeFlags: ["--app=" + addr, `--window-size=${width},${height}`]
        });
          
        chrome.process.on("exit", () => {
            // close server so that the nodejs process exists.
            server.close();
        });
    });
}

launchServer();
