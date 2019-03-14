import { join } from "path";
import { execSync } from "child_process";

export function launchAndWaitForBackgroundProcessSync(
	debugPort: number,
	label: string | undefined
) {
	const entry = join(__dirname, "./entry.js");
	const extra =
		process.env.DEBUG_EASY_ATTACH === "true"
			? { stdio: "inherit" as const }
			: {};
	execSync(
		`node ${entry} ${debugPort} ${label ? JSON.stringify(label) : ""}`,
		{ ...extra, windowsHide: true, shell: undefined }
	);
}
