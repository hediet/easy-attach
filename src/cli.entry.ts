#!/usr/bin/env node

import { join } from "path";
import chalk from "chalk";
import clipboardy = require("clipboardy");

const pkg = require("../package.json");
const moduleStr = JSON.stringify(join(__dirname, "../"));
const codeToTriggerDebugger = `require(${moduleStr})();`;

console.log(`Easy Attach Version ${pkg.version}.`);
console.log();
console.log("Use this code to trigger a breakpoint:");
console.log(chalk.blue(codeToTriggerDebugger));
console.log("(Pasted into your clipboard)");
console.log();

clipboardy.writeSync(codeToTriggerDebugger);
