import { Disposable } from "@hediet/std/disposable";

export interface Resource {
	disposeAsync(debuggerConnected: boolean): Promise<void>;
}

export interface AttachContext {
	debuggerPort: number;
	proxyPort: number;
	disposables: (Disposable | Resource)[];
	label: string | undefined;
	exit: () => void;
	log: (message: string) => void;
}

export type Result =
	| {
			successful: true;
	  }
	| {
			successful: false;
			errorMessage: string;
			error?: any;
	  };
