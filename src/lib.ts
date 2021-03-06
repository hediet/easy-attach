import child_process = require("child_process");
import { launchBackgroundProcess } from "./background-worker";
import * as inspector from "inspector";

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

let first = true;
export function debugProcessAndWait(args?: EasyAttachArgs): boolean {
	if (!first) {
		return false;
	}
	first = false;

	let label = undefined;
	let debugPortConfig: DebugPortConfig = "random";
	let debugProxyPortConfig: PortConfig = "random";
	let eagerExitDebugProxy = false;
	let log = false;
	let showUi = true;
	let shouldContinue = false;

	if (args) {
		label = args.label;
		debugPortConfig = args.debugPort || "random";
		if (args.eagerExitDebugProxy !== undefined) {
			eagerExitDebugProxy = args.eagerExitDebugProxy;
		}
		if (args.logBackgroundWorker !== undefined) {
			log = args.logBackgroundWorker;
		}

		if (args.debugProxyPort !== undefined) {
			debugProxyPortConfig = args.debugProxyPort;
		}

		if (args.showUI !== undefined) {
			showUi = args.showUI;
		}
		if (args.continue !== undefined) {
			shouldContinue = args.continue;
		}
	}

	const { debugPort } = initializeDebugPort(debugPortConfig);

	launchBackgroundProcess({
		debugPort,
		label,
		log,
		eagerExitDebugProxy,
		debugProxyPortConfig,
		showUi,
		shouldContinue,
	});
	// Wait for debugger to connect.
	inspector.open(undefined, undefined, true);

	return true;
}

let debugPort: number | undefined = undefined;

function initializeDebugPort(
	portConfig: DebugPortConfig
): { debugPort: number } {
	// use a random port for debugPort to prevent port clashes.
	if (!debugPort) {
		if (portConfig === "preconfigured") {
			debugPort = process.debugPort;
		} else {
			if (portConfig === "random") {
				debugPort = getRandomPortSync();
			} else if (typeof portConfig === "number") {
				debugPort = portConfig;
			} else {
				debugPort = getRandomPortSync(portConfig);
			}
			process.debugPort = debugPort;
		}
	}
	return { debugPort };
}

function getRandomPortSync(allowedPorts?: number[]): number {
	let options = "";
	if (allowedPorts !== undefined) {
		options = `{ port: [${allowedPorts
			.map(p => (+p).toString())
			.join(",")}] }`;
	}
	// we must use execSync as get-port is async.
	const portStr = child_process.execSync(
		`node -e "require('get-port')(${options}).then(p => console.log(p))"`,
		// Set cwd so that node_modules can be found.
		{ cwd: __dirname, encoding: "utf8" }
	);
	const port = parseInt(portStr);
	// It could be that `port` is not from `allowedPorts` as they are only preferences.
	return port;
}
