# Easy Attach

A helper tool that makes launching the debugger to step through obscure js scripts (e.g. webpack configurations) extremly easy.

Like `Debugger.Break()` from C#.

## Requirements

-   You need chrome or VS Code with [the RPC Server extension]() to be installed.

This package is developed and tested on windows but should work on linux as well.

## Installation

`easy-attach` should best be installed globally:

```
yarn global add easy-attach
```

Or if you use npm:

```
npm install --global easy-attach
```

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

When the `require("[...]\\debugger")()` is called, a chrome window is launched with further instructions:

![chrome window](docs/chrome-window.png)

Paste that url into chromes addressbar and debug the obscure script by closing the window:

![chrome window](docs/debug1.png)

From there you can step out and debug your script:

![chrome window](docs/debug2.png)

This even works in node repl!
