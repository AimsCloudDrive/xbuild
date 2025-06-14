import { LoadedXbuildConfig } from "./types";
export declare class TypeScriptCompiler {
    private config;
    private logger;
    constructor(config: LoadedXbuildConfig);
    checkTypes(): Promise<boolean>;
    emitDeclarations(): Promise<boolean>;
    private getTsConfig;
}
