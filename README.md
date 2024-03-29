# Easy Attach

[![](https://img.shields.io/twitter/follow/hediet_dev.svg?style=social)](https://twitter.com/intent/follow?screen_name=hediet_dev)

A helper tool that makes launching the debugger to step through node applications where the entry point is unclear (e.g. webpack configurations) extremely easy.

Like `Debugger.Break()` from C#. Everything the `debugger;` statement should be.

## Why `debugger;` doesn't do it

`debugger;` does nothing if no debugger is attached.

This means you have to either launch the process in debug mode from the start (which is complicated if you don't control how the process is launched) or be quick to attach it before the line you want to break at is executed.

With this project you can just paste one line and it will launch a debugger of your choice (VSCode or Chrome) while suspending the running process, regardless of how it was started.

## Requirements

-   You need Chrome or VS Code with [the RPC Server extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-rpc-server) to be installed.

Developed on Windows, tested on Windows and Linux.

## Installation

`easy-attach` should best be installed globally:

```
yarn global add easy-attach
```

Or if you use npm:

```
npm install --global easy-attach
```

## Demo

![demo](docs/demo.gif)

## Usage

Run `easy-attach` to see instructions:

![cli](docs/cli.png)

Then, in the script you want to debug, insert the code from the instructions:

```js
function obscureFunction(args) {
	// this require call launches the debugger and waits
	require("C:\\Users\\henni\\AppData\\Local\\Yarn\\Data\\global\\node_modules\\easy-attach\\debugger")();
	anotherObscureFunction(args.data);
}
```

When the `require("[...]\\debugger")()` is called, a chrome window is launched with further instructions.
By pasting the displayed link into chrome you can debug your node js application!
This even works in node repl!

You can also pass a label to the call so that you don't mix up various breakpoints:

```js
require("...\\easy-attach\\debugger")({ label: "Server" });
```

If you don't want the debugger to halt, you can pass a `continue` flag:

```js
require("...\\easy-attach\\debugger")({ continue: true });
```

## Connect with JetBrains (Webstorm / IntelliJ IDEA / etc...)

Required plugins: **JavaScript and TypeScript, JavaScript Debugger, Node.js**

You can connect to the node js application by following these steps:

- Add a `require("[...]\\debugger")({ debugProxyPort: PORT })` with some random port, e.g. 54834
- Create an `Attach to Node.js/Chrome - Run/Debug Configuration`
- Paste the port into the `Port` section
- Make sure `Reconnect automatically` is checked, so whenever you restart the TypeScript Service, it can reconnect automatically
- Wait for the statement to open a new chrome window
- Click on the debug button to start debugging your application

## Flags

You can specify flags by passing an object:

```js
require("...\\easy-attach\\debugger")({ ...flags });
```

These flags are supported:

```ts
export interface EasyAttachArgs {
	/**
	 * Sets a label for the debug target.
	 * Defaults to `undefined`..
	 */
	label?: string;
	/**
	 * If enabled, it does not break after attaching the debugger.
	 * Defaults to `false`.
	 */
	continue?: boolean;
	/**
	 * Specifies the port to use for the debug port.
	 * Use `preconfigured` when the debugger was already launched.
	 * Defaults to `random`;
	 */
	debugPort?: DebugPortConfig;
	/**
	 * Specifies the port to use for the debug proxy.
	 * This is usefull if you want to forward this port.
	 * Defaults to `random`;
	 */
	debugProxyPort?: PortConfig;
	/**
	 * Use this option when the debug proxy does not recognize connection attempts and does not close automatically. Defaults to `false`.
	 */
	eagerExitDebugProxy?: boolean;
	/**
	 * Print logs from background worker. Defaults to `false`.
	 */
	logBackgroundWorker?: boolean;
	/**
	 * Use this option to control whether the UI is shown.
	 * If only the VS Code Extension is used, disabling the UI speeds up the auto attach feature.
	 * Defaults to `true`.
	 */
	showUI?: boolean;
}

export type PortConfig = "random" | number | number[];
export type DebugPortConfig = PortConfig | "preconfigured";
```

## Design Notes

Actually, going from `debugger;` to C#'s `Debugger.Break()` was unexpectedly easy (in terms of a node js developer).

This sequence diagram roughly describes what is needed for that little upgrade:

![sequence-diagram](docs/exported/main/Main.png)

### background-worker

The background-worker process is required as we don't want to return from the `require` call before a debugger successfully attached, otherwise we would miss the `debugger;` breakpoint.
Thus, we cannot use the event loop of the debugee and have to spawn a new process and wait for it to exit synchronously.

### debugger-proxy

The debugger-proxy is used to inform the background-worker that a debugger has attached.
There seems to be no other way.
Care has to be taken that is exits neither too early nor never.

## Used Dependencies

Utility functions:

-   [@hediet/std](https://www.npmjs.com/package/@hediet/std)

For typed communicating between background-worker and debugger-proxy:

-   [@hediet/typed-json-rpc](https://www.npmjs.com/package/@hediet/typed-json-rpc)
-   [@hediet/typed-json-rpc-streams](https://www.npmjs.com/package/@hediet/typed-json-rpc-streams)

For proxying node debug:

-   [http-proxy](https://www.npmjs.com/package/http-proxy)
-   [@types/http-proxy](https://www.npmjs.com/package/@types/http-proxy)
-   [simples](https://www.npmjs.com/package/simples)

For the CLI:

-   [chalk](https://www.npmjs.com/package/chalk)
-   [clipboardy](https://www.npmjs.com/package/clipboardy)

To get the chrome debug url and launch chrome:

-   [node-fetch](https://www.npmjs.com/package/node-fetch)
-   [chrome-launcher](https://www.npmjs.com/package/chrome-launcher)

To notify vscode:

-   [vscode-rpc](https://www.npmjs.com/package/vscode-rpc)

To find free ports:

-   [get-port](https://www.npmjs.com/package/get-port)

## Known Problems

-   Sometimes, when launchend, the background-worker appears for a short moment as black terminal window. I don't know why.

# Changelog

-   2.0.0
    -   Migrated from `_debugProcess` to `inspector.open`. This solves some race conditions.
    -   Removed debug entry points.
    -   Uses debug API to automatically step out or continue.
