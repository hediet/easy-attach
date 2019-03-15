import child_process = require("child_process");
import { launchAndWaitForBackgroundProcessSync } from "./background-worker";

export interface EasyAttachArgs {
	label: string;
	continue: boolean;
}

let first = true;
module.exports.debugProcessAndWait = function(args?: EasyAttachArgs): boolean {
	if (!first) {
		return false;
	}
	first = false;

	const label = args ? args.label : undefined;
	const { debugPort } = initializeDebugPort();
	launchAndWaitForBackgroundProcessSync(debugPort, label);

	// Wait a bit so that the dev tools can connect properly.
	waitSomeCycles();

	if (args && args.continue) {
		return false;
	}

	return true;
};

let debugPort: number | undefined = undefined;

function initializeDebugPort(): { debugPort: number } {
	// use a random port for debugPort to prevent port clashes.
	if (!debugPort) {
		debugPort = getRandomPortSync();
		process.debugPort = debugPort;
		(process as any)._debugProcess(process.pid);
	}
	return { debugPort };
}

function getRandomPortSync(): number {
	// we must use execSync as get-port is async.
	const portStr = child_process.execSync(
		`node -e "require('get-port')().then(p => console.log(p))"`,
		// Set cwd so that node_modules can be found.
		{ cwd: __dirname, encoding: "utf8" }
	);
	return parseInt(portStr);
}

function waitSomeCycles() {
	let i = 0;
	while (i < 1000000) i++;
}
