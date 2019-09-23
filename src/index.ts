import { EasyAttachArgs, debugProcessAndWait } from "./lib";
import { join } from "path";

interface Info {
	version: string;
	moduleStr: string;
	codeToTriggerDebugger: string;
}

/**
 * Launches the debugger.
 */
function main(args: EasyAttachArgs) {
	if (debugProcessAndWait(args)) {
		// "debugger" is here so that "step out" will navigate to the code to debug.
		debugger;
	}
}

main.getInfo = function getInfo(): Info {
	const pkg = require("../package.json");
	const moduleStr = JSON.stringify(join(__dirname, "../"));
	const codeToTriggerDebugger = `require(${moduleStr})();`;

	return {
		version: pkg.version,
		moduleStr,
		codeToTriggerDebugger,
	};
};

export = main;
