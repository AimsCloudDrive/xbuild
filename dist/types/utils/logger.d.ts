export declare class Logger {
    private prefix;
    constructor(prefix: string);
    private log;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    progress(message: string, current: number, total: number): void;
}
