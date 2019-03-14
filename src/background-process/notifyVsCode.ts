import { connectToVsCode, nodeDebuggerContract } from "vscode-rpc";
import { GlobalTokenStore } from "vscode-rpc/dist/FileTokenStore";
import { AttachContext } from "./attachContext";
import { ConsoleRpcLogger } from "@hediet/typed-json-rpc";

let targetId = "main" + Math.floor(Math.random() * 10000000);

export async function notifyVsCode(context: AttachContext): Promise<void> {
	try {
		const client = await connectToVsCode({
			appName: "Easy Attach",
			tokenStore: new GlobalTokenStore("easy-attach"),
			logger: new ConsoleRpcLogger(),
		});
		const server = nodeDebuggerContract.getServer(client.channel, {
			onNodeDebugTargetIgnored: ({ targetId }) => {
				if (targetId === targetId) {
					context.exit();
				}
			},
		});

		server.addNodeDebugTarget({
			port: context.proxyPort,
			name: context.label || null,
			targetId,
		});

		context.disposables.push({
			dispose: () => {
				server.removeNodeDebugTarget({ targetId });
				client.close();
			},
		});
	} catch (exception) {
		console.log("could not contact vscode: ", exception);
	}
}
