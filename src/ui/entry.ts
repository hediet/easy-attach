import { notifyVsCode } from "./notifyVsCode";
import { launchServer } from "./launchChrome";

const args = process.argv.slice(2);
const debuggerPort = parseInt(args[0]);

const disposables = new Array<() => void>();
function exit() {
    for (const d of disposables) {
        d();
    }
    process.exit();
}

notifyVsCode({ debuggerPort, disposables, exit });
launchServer({ debuggerPort, disposables, exit });
