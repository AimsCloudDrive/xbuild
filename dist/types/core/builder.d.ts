import { OutputOptions, RollupOptions } from "rollup";
import { LoadedXbuildConfig } from "./types";
export declare class XBuilder {
    private config;
    private plugins;
    private logger;
    constructor(config: LoadedXbuildConfig);
    runBuild(rollupOptions: RollupOptions, outputOptions: OutputOptions | OutputOptions[]): Promise<boolean>;
    runDev(rollupOptions: RollupOptions, outputOptions: OutputOptions): Promise<import("rollup").RollupWatcher>;
}
