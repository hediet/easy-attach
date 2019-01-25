const child_process = require("child_process");
const path = require("path");

module.exports = function() {
    debugProcessAndOpenChrome();
    // continue debugging here
    debugger;
};

function debugProcessAndOpenChrome() {
    process._debugProcess(process.pid);
    const p = path.join(__dirname, "./ui.js");
    child_process.execSync(`node ${p}`, { stdio: "inherit" });
    let i = 0;
    // wait a bit so that the dev tools can connect properly
    while (i < 1000000) i++;
}
