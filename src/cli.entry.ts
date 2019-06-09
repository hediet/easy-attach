#!/usr/bin/env node
import { getInfo } from ".";
import chalk from "chalk";
import clipboardy = require("clipboardy");

const info = getInfo();
console.log(`Easy Attach Version ${info.version}.`);
console.log();
console.log("Use this code to trigger a breakpoint:");
console.log(chalk.blue(info.codeToTriggerDebugger));

try {
	clipboardy.writeSync(info.codeToTriggerDebugger);
	console.log("(Copied to clipboard)");
} catch (e) {
	console.error(chalk.red(`Could not copy to clipboard: ${e.toString()}`));
}

console.log();
