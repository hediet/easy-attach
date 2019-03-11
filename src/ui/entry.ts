import { notifyVsCode } from "./notifyVsCode";
import { launchServer } from "./launchChrome";
import { AttachContext } from "./attachContext";
import { spawn } from "child_process";
import { join } from "path";
import { StatusInfo } from "../launcher-interface";
import { EventEmitter, EventSource } from "@hediet/std/events";

function launchProxyServer(
	port: number
): Promise<{ port: number; onClientConnected: EventSource }> {
	const onClientConnected = new EventEmitter();
	return new Promise(resolve => {
		const proc = spawn(
			"node",
			[join(__dirname, "../debugger-proxy.entry"), port.toString()],
			{
				detached: true,
			}
		);

		proc.on("error", e => {
			console.error("error", e);
		});
		proc.on("close", e => {
			console.error("closed", e);
		});
		proc.stdout!.on("data", chunk => {
			const json = chunk.toString("utf8");
			const data = JSON.parse(json) as StatusInfo;

			if (data.kind === "ServedStarted") {
				resolve({
					port: data.port,
					onClientConnected: onClientConnected.asEvent(),
				});
			} else if (data.kind === "ClientConnected") {
				onClientConnected.emit(undefined, undefined);
			}
		});
		proc.stderr!.on("data", chunk => {
			console.error(chunk.toString("utf8"));
		});
	});
}

const args = process.argv.slice(2);
const debuggerPort = parseInt(args[0]);
const label = args.length > 1 ? args[1] : undefined;

launchProxyServer(debuggerPort).then(data => {
	launch(data.port, data.onClientConnected);
});

function launch(proxyPort: number, onClientConnected: EventSource) {
	const disposables = new Array<() => void>();
	function exit() {
		for (const d of disposables) {
			d();
		}
		process.exit();
	}

	onClientConnected.one(() => {
		exit();
	});

	const context: AttachContext = {
		debuggerPort,
		proxyPort,
		disposables,
		exit,
		label,
	};

	notifyVsCode(context);
	launchServer(context);
}
