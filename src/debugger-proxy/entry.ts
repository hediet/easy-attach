import { AddressInfo } from "net";
import { debuggerProxyContract } from "./contract";
import httpProxy = require("http-proxy");
import WsParser = require("simples/lib/parsers/ws");
import { TypedChannel } from "@hediet/typed-json-rpc";
import { NodeJsMessageStream } from "@hediet/typed-json-rpc-streams";
import { ResettableTimeout } from "@hediet/std/timer";

const args = process.argv.slice(2);
const debuggerPort = parseInt(args[0]);

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

const server = httpProxy.createServer({
	target: `http://localhost:${debuggerPort}`,
	ws: true,
});

server.on("proxyReqWs", (proxyReq, req, socket, options) => {
	const parser = new WsParser(0, false);
	socket.pipe(parser);

	parser.on("frame", (frame: { data: any }) => {
		const content = frame.data.toString("utf8") as string;
		if (content.indexOf("Runtime.runIfWaitingForDebugger") !== -1) {
			clientConnected = true;
			client.clientConnected({});
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

server.listen(0);

const info = (server as any)._server.address() as AddressInfo;
client.serverStarted({ port: info.port });
