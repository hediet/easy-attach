import { contract, types as t, requestContract, notificationContract } from "@hediet/typed-json-rpc";
import {  TypedWebSocketClientChannel } from "@hediet/typed-json-rpc-websocket";

import { AttachContext } from "./attachContext";

const targetIdType = t.string;
const vscodeContract = contract({
    server: {
		nodeDebugTargetBecameAvailable: notificationContract({ params: { port: t.Integer, targetId: targetIdType } }),
		nodeDebugTargetBecameUnavailable: notificationContract({ params: { targetId: targetIdType } }),
    },
    client: {
        attachingToNodeDebugTarget: notificationContract({ params: { targetId: targetIdType } }),
        attachedToNodeDebugTarget: notificationContract({ params: { targetId: targetIdType } }),
    }
});

const logger = undefined; //new ConsoleRpcLogger();

let targetId = "main" + Math.floor(Math.random() * 100000);

export async function notifyVsCode(context: AttachContext): Promise<void> {
    try {
        let channel = await TypedWebSocketClientChannel.connectTo({ address: "ws://localhost:56024" }, logger);
        const server = vscodeContract.getServerInterface(channel, {
            attachingToNodeDebugTarget: (args) => {
                if (args.targetId !== targetId) { return; }
                // wait a bit so that the debugger can attach properly.
                setTimeout(() => {
                    context.exit();
                }, 2000);
            }
        });
        channel.startListen();

        server.nodeDebugTargetBecameAvailable({ port: context.debuggerPort, targetId });

        context.disposables.push(() => {
            server.nodeDebugTargetBecameUnavailable({ targetId });
        });
    }
    catch (exception) {
        console.log("could not contact vscode: ", exception);
    }
}
