export interface AttachContext {
	debuggerPort: number;
	proxyPort: number;
	disposables: Array<() => void>;
	label: string | undefined;
	exit: () => void;
}
