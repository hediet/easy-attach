import { notifyVsCode } from "./notifyVsCode";
import { showUI } from "./showUI";
import { AttachContext, Result, Resource } from "./attachContext";
import { EventSource } from "@hediet/std/events";
import { Disposable } from "@hediet/std/disposable";
import { wait } from "@hediet/std/timer";
import { launchProxyServer } from "../debugger-proxy";
import { BackgroundWorkerArgs } from ".";

const argsObj = JSON.parse(process.argv[2]) as BackgroundWorkerArgs;

launchProxyServer({
	debugPort: argsObj.debugPort,
	eagerExit: argsObj.eagerExitDebugProxy,
	debugProxyPortConfig: argsObj.debugProxyPortConfig,
}).then(data => {
	launch(data.port, data.onClientConnected, data.signalExit);
});

async function launch(
	proxyPort: number,
	onClientConnected: EventSource,
	exited: () => void
) {
	const disposables = new Array<Resource | Disposable>();
	async function exit(debuggerConnected: boolean) {
		for (const d of disposables) {
			if ("disposeAsync" in d) {
				await d.disposeAsync(debuggerConnected);
			} else {
				d.dispose();
			}
		}
		exited();
		process.exit();
	}

	onClientConnected.one(() => {
		exit(true);
	});

	disposables.push(await attachDebugger(argsObj.shouldContinue));

	const context: AttachContext = {
		debuggerPort: argsObj.debugPort,
		proxyPort,
		disposables,
		exit: () => exit(false),
		label: argsObj.label,
		log: (message: string) => {
			if (process.env.DEBUG_EASY_ATTACH || argsObj.log) {
				console.log(message);
			}
		},
	};

	const promises = new Array<Promise<Result>>();
	promises.push(notifyVsCode(context));
	if (argsObj.showUi) {
		promises.push(showUI(context));
	}

	const results = await Promise.all(promises);
	if (results.every(r => !r.successful)) {
		for (const result of results) {
			if (result.successful) {
				continue;
			}
			console.error("easy-attach: " + result.errorMessage);
		}
	}
}

async function attachDebugger(shouldContinue: boolean): Promise<Resource> {
	try {
		const CDP = require("chrome-remote-interface");
		const client = await CDP({
			port: argsObj.debugPort,
			local: true,
		});
		const { Debugger, Runtime } = client;
		let first = true;
		client.on("event", async (message: any) => {
			if (first && message.method === "Debugger.paused") {
				first = false;
				try {
					await Debugger.stepOut();
				} catch (e) {
					console.error("Error at Debugger.stepOut", e);
				}
			}
		});
		await Debugger.enable();
		await Runtime.runIfWaitingForDebugger();

		return {
			async disposeAsync(clientConnected: boolean): Promise<void> {
				if (shouldContinue && clientConnected) {
					await wait(500);
					await Debugger.resume();
				}
				await Debugger.disable();
				await client.close();
			},
		};
	} catch (e) {
		console.error("err", e);
		return {
			async disposeAsync(): Promise<void> {},
		};
	}
}
