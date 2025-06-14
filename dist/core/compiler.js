"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptCompiler = void 0;
// @ts-nocheck
const typescript_1 = __importDefault(require("typescript"));
const logger_1 = require("../utils/logger");
class TypeScriptCompiler {
    config;
    logger = new logger_1.Logger("TypeScript");
    constructor(config) {
        this.config = config;
    }
    async checkTypes() {
        this.logger.info("Running TypeScript type check...");
        const tsConfig = this.getTsConfig();
        const program = typescript_1.default.createProgram({
            rootNames: tsConfig.fileNames,
            options: tsConfig.options,
        });
        const diagnostics = typescript_1.default.getPreEmitDiagnostics(program);
        if (diagnostics.length > 0) {
            const formatHost = {
                getCanonicalFileName: (path) => path,
                getCurrentDirectory: typescript_1.default.sys.getCurrentDirectory,
                getNewLine: () => typescript_1.default.sys.newLine,
            };
            const message = typescript_1.default.formatDiagnostics(diagnostics, formatHost);
            this.logger.error("TypeScript type check failed:\n" + message);
            return false;
        }
        this.logger.success("TypeScript type check passed");
        return true;
    }
    async emitDeclarations() {
        this.logger.info("Generating type declarations...");
        const tsConfig = this.getTsConfig();
        const program = typescript_1.default.createProgram({
            rootNames: tsConfig.fileNames,
            options: {
                ...tsConfig.options,
                declaration: true,
                emitDeclarationOnly: true,
                noEmit: false,
            },
        });
        const emitResult = program.emit();
        const diagnostics = typescript_1.default
            .getPreEmitDiagnostics(program)
            .concat(emitResult.diagnostics);
        if (diagnostics.length > 0) {
            const formatHost = {
                getCanonicalFileName: (path) => path,
                getCurrentDirectory: typescript_1.default.sys.getCurrentDirectory,
                getNewLine: () => typescript_1.default.sys.newLine,
            };
            const message = typescript_1.default.formatDiagnostics(diagnostics, formatHost);
            this.logger.error("Declaration generation failed:\n" + message);
            return false;
        }
        this.logger.success("Type declarations generated");
        return true;
    }
    getTsConfig() {
        const configPath = typescript_1.default.findConfigFile(process.cwd(), typescript_1.default.sys.fileExists, this.config.tsconfig || "tsconfig.json");
        if (!configPath) {
            throw new Error("tsconfig.json not found");
        }
        const configFile = typescript_1.default.readConfigFile(configPath, typescript_1.default.sys.readFile);
        return typescript_1.default.parseJsonConfigFileContent(configFile.config, typescript_1.default.sys, process.cwd());
    }
}
exports.TypeScriptCompiler = TypeScriptCompiler;
