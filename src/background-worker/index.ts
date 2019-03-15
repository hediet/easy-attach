import { join } from "path";
import { spawnSync } from "child_process";

export function launchAndWaitForBackgroundProcessSync(
	debugPort: number,
	label: string | undefined
) {
	const entry = join(__dirname, "./entry.js");
	spawnSync(
		"node",
		[`${entry}`, debugPort.toString(), label ? JSON.stringify(label) : ""],
		{ stdio: "inherit", shell: true, windowsHide: true }
	);
}
