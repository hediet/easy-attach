import { AddressInfo } from "net";
import { StatusInfo } from "./launcher-interface";
import httpProxy = require("http-proxy");
import WsParser = require("simples/lib/parsers/ws");

const args = process.argv.slice(2);
const debuggerPort = parseInt(args[0]);

function sendStatusInfo(message: StatusInfo) {
	console.log(JSON.stringify(message));
}

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
			sendStatusInfo({ kind: "ClientConnected" });
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
sendStatusInfo({ kind: "ServedStarted", port: info.port });
