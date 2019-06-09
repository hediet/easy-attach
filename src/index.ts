import { EasyAttachArgs } from "./lib";
import { join } from "path";

interface Api {
	/** Launches the debugger. */
	(args: EasyAttachArgs): void;
	getInfo(): Info;
}

interface Info {
	version: string;
	moduleStr: string;
	codeToTriggerDebugger: string;
}

function getInfo(): Info {
	const pkg = require("../package.json");
	const moduleStr = JSON.stringify(join(__dirname, "../"));
	const codeToTriggerDebugger = `require(${moduleStr})();`;

	return {
		version: pkg.version,
		moduleStr,
		codeToTriggerDebugger,
	};
}

function randomInt(min: number, max: number) {
	return min + Math.floor(Math.random() * (max + 1 - min));
}

const entries: Api[] = [
	require("../entries/entry1"),
	require("../entries/entry2"),
];
const randomIndex = randomInt(0, entries.length - 1);

// choose a random quote.
const entry = entries[randomIndex];
entry.getInfo = getInfo;
export = entry;
