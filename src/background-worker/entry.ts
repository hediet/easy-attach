import { notifyVsCode } from "./notifyVsCode";
import { launchServer } from "./launchChrome";
import { AttachContext, Result } from "./attachContext";
import { EventSource } from "@hediet/std/events";
import { Disposable, dispose } from "@hediet/std/disposable";
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
	const disposables = new Array<Disposable>();
	function exit() {
		dispose(disposables);
		exited();
		process.exit();
	}

	onClientConnected.one(() => {
		exit();
	});

	const context: AttachContext = {
		debuggerPort: argsObj.debugPort,
		proxyPort,
		disposables,
		exit,
		label: argsObj.label,
		log: (message: string) => {
			if (process.env.DEBUG_EASY_ATTACH || argsObj.log) {
				console.log(message);
			}
		},
	};

	const promises = new Array<Promise<Result>>();
	promises.push(notifyVsCode(context));
	promises.push(launchServer(context));

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
