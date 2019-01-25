const child_process = require("child_process");
const path = require("path");

module.exports.debugProcessAndWait = function() {
    // use a random port for debugPort to prevent port clashes.
    // we must use execSync as get-port is async.
    const portStr = child_process.execSync(`node -e "require('get-port')().then(p => console.log(p))"`);
    const debugPort = parseInt(portStr);

    process.debugPort = debugPort;
    process._debugProcess(process.pid);

    const uiScript = path.join(__dirname, "./ui.js");
    child_process.execSync(`node ${uiScript} ${debugPort}`, { stdio: "inherit" });

    let i = 0;
    // wait a bit so that the dev tools can connect properly
    while (i < 1000000) i++;
}
