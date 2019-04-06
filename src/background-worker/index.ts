import { join } from "path";
import { spawnSync } from "child_process";
import { PortConfig } from "../lib";

export interface BackgroundWorkerArgs {
	debugPort: number;
	label: string | undefined;
	eagerExitDebugProxy: boolean;
	log: boolean;
	debugProxyPortConfig: PortConfig;
	showUi: boolean;
}

export function launchAndWaitForBackgroundProcessSync(
	args: BackgroundWorkerArgs
) {
	const entry = join(__dirname, "./entry.js");
	spawnSync("node", [`${entry}`, JSON.stringify(args)], {
		stdio: "inherit",
		shell: false,
		windowsHide: true,
	});
}
