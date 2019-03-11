import child_process = require("child_process");
import { join } from "path";

export interface EasyAttachArgs {
	label: string;
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

let first = true;

module.exports.debugProcessAndWait = function(args?: EasyAttachArgs) {
	if (!first) {
		return;
	}
	first = false;

	const label = args ? args.label : undefined;

	// use a random port for debugPort to prevent port clashes.
	const debugPort = getRandomPortSync();
	process.debugPort = debugPort;
	(process as any)._debugProcess(process.pid);

	const uiScript = join(__dirname, "./ui/entry.js");
	child_process.execSync(
		`node ${uiScript} ${debugPort} ${label ? JSON.stringify(label) : ""}`
		// uncomment when debugging:
		// { stdio: "inherit" }
	);

	let i = 0;
	// wait a bit so that the dev tools can connect properly
	// TODO test whether this is still required
	while (i < 1000000) i++;
};