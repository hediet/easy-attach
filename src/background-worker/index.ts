import { join } from "path";
import { spawn } from "child_process";
import { PortConfig } from "../lib";

export interface BackgroundWorkerArgs {
	debugPort: number;
	label: string | undefined;
	eagerExitDebugProxy: boolean;
	log: boolean;
	debugProxyPortConfig: PortConfig;
	showUi: boolean;
	shouldContinue: boolean;
}

export function launchBackgroundProcess(args: BackgroundWorkerArgs) {
	const entry = join(__dirname, "./entry.js");
	spawn("node", [`${entry}`, JSON.stringify(args)], {
		stdio: "inherit",
		shell: false,
		windowsHide: true,
	});
}
