import { connectToVsCode, nodeDebuggerContract } from "vscode-rpc";
import { GlobalTokenStore } from "vscode-rpc/dist/FileTokenStore";
import { AttachContext, Result } from "./attachContext";

let targetId = "main" + Math.floor(Math.random() * 10000000);

export async function notifyVsCode(context: AttachContext): Promise<Result> {
	try {
		const client = await connectToVsCode({
			appName: "Easy Attach",
			tokenStore: new GlobalTokenStore("easy-attach"),
			logger: {
				trace: entry => context.log(`trace: ${entry.text}`),
				debug: entry => context.log(`debug: ${entry.text}`),
				warn: entry => context.log(`warn: ${entry.text}`),
			},
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
		return {
			successful: true,
		};
	} catch (error) {
		return {
			successful: false,
			errorMessage:
				"Could not contact VS Code RPC Server. Did you install the RPC Server extension?",
			error,
		};
	}
}
