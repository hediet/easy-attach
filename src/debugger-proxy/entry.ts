import { AddressInfo } from "net";
import { debuggerProxyContract } from "./contract";
import httpProxy = require("http-proxy");
import WsParser = require("simples/lib/parsers/ws");
import { NodeJsMessageStream } from "@hediet/typed-json-rpc-streams";
import { ResettableTimeout } from "@hediet/std/timer";
import { DebuggerProxyArgs } from ".";
import getPort = require("get-port");

const argsObj = JSON.parse(process.argv[2]) as DebuggerProxyArgs;

let clientConnected = false;
const timeout = new ResettableTimeout(5000);
timeout.onTimeout.then(() => {
	// if the "parent" process was killed, but no debugger attached, exit
	if (!clientConnected) {
		process.exit();
	}
});

const { client } = debuggerProxyContract.registerServerToStream(
	NodeJsMessageStream.connectToThisProcess(),
	undefined,
	{
		keepAlive: () => {
			timeout.reset();
		},
	}
);

function handleClientConnected() {
	if (!clientConnected) {
		clientConnected = true;
		client.clientConnected({});
	}
}

const server = httpProxy.createServer({
	target: `http://localhost:${argsObj.debugPort}`,
	ws: true,
});

server.on("proxyReqWs", (proxyReq, req, socket, options) => {
	if (argsObj.eagerExit) {
		handleClientConnected();
	}

	const parser = new WsParser(0, false);
	socket.pipe(parser);

	parser.on("frame", (frame: { data: any }) => {
		const content = frame.data.toString("utf8") as string;
		if (content.indexOf("Runtime.runIfWaitingForDebugger") !== -1) {
			handleClientConnected();
		}
	});

	socket.on("close", () => {
		process.exit();
	});
});

/*
// ensure that vscode uses `node2`
// use this code to debug weird scenarios:

server._server.on("connection", socket => {
	console.error("connection");
	socket.on("data", data => {
		console.error("<", data.toString("utf8"));
	});
});
*/

async function run() {
	let port: number;
	if (argsObj.debugProxyPortConfig === "random") {
		port = 0;
	} else {
		port = await getPort({ port: argsObj.debugProxyPortConfig });
	}

	server.listen(port);

	const info = (server as any)._server.address() as AddressInfo;
	client.serverStarted({ port: info.port });
}

run();
