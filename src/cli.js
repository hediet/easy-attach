#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const pkg = require('../package.json');
const clipboardy = require('clipboardy');

const moduleStr = JSON.stringify(path.join(__dirname, "../debugger"));
const codeToTriggerDebugger = `require(${moduleStr})();`;

console.log(`Easy Attach Version ${pkg.version}.`);
console.log();
console.log("Use this code to trigger a breakpoint:");
console.log(chalk.blue(codeToTriggerDebugger));
console.log("(Pasted into your clipboard)");
console.log();

clipboardy.writeSync(codeToTriggerDebugger);
