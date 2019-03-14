import { contract, notificationContract } from "@hediet/typed-json-rpc";
import { number, type } from "io-ts";

export const debuggerProxyContract = contract({
	server: {
		keepAlive: notificationContract({}),
	},
	client: {
		serverStarted: notificationContract({ params: type({ port: number }) }),
		clientConnected: notificationContract({}),
	},
});
