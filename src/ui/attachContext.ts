export interface AttachContext {
    debuggerPort: number;
    disposables: Array<() => void>;
    exit: () => void;
}
