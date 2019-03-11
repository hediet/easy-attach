import { connectToVsCode, nodeDebuggerContract } from "vscode-rpc";
import { GlobalTokenStore } from "vscode-rpc/dist/FileTokenStore";
import { AttachContext } from "./attachContext";

let targetId = "main" + Math.floor(Math.random() * 10000000);

export async function notifyVsCode(context: AttachContext): Promise<void> {
	try {
		const client = await connectToVsCode({
			appName: "Easy Attach",
			tokenStore: new GlobalTokenStore("easy-attach"),
		});
		const server = nodeDebuggerContract.getServer(client.channel, {});

		server.nodeDebugTargetBecameAvailable({
			port: context.proxyPort,
			name: context.label || null,
			targetId,
		});

		context.disposables.push(() => {
			server.nodeDebugTargetBecameUnavailable({ targetId });
			client.dispose();
		});
	} catch (exception) {
		console.log("could not contact vscode: ", exception);
	}
}
