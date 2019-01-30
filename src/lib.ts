const child_process = require("child_process");
const path = require("path");

module.exports.debugProcessAndWait = function() {
    // use a random port for debugPort to prevent port clashes.
    // we must use execSync as get-port is async.
    // Set cwd so that node finds the get-port module.
    const portStr = child_process.execSync(`node -e "require('get-port')().then(p => console.log(p))"`, { cwd: __dirname });
    const debugPort = parseInt(portStr);

    process.debugPort = debugPort;
    process._debugProcess(process.pid);

    const uiScript = path.join(__dirname, "./ui/entry.js");
    // for debugging add { stdio: "inherit" }
    child_process.execSync(`node ${uiScript} ${debugPort}`);

    let i = 0;
    // wait a bit so that the dev tools can connect properly
    while (i < 1000000) i++;
}
