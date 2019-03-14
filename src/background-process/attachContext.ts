import { Disposable } from "@hediet/std/disposable";

export interface AttachContext {
	debuggerPort: number;
	proxyPort: number;
	disposables: Disposable[];
	label: string | undefined;
	exit: () => void;
}
