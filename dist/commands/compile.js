"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileCommand = void 0;
const builder_1 = require("../core/builder");
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
async function compileCommand(options) {
    const logger = new logger_1.Logger("Compile");
    try {
        let config = await (0, config_1.loadConfig)(options.config);
        // 编译模式配置
        config = {
            ...config,
            mode: "production",
            watch: false,
            serve: false,
            tsconfig: config.tsconfig || "tsconfig.json",
        };
        logger.info("Starting compilation (without declaration files)...");
        await config.plugins.applyHook("beforeCompile");
        const builder = new builder_1.XBuilder(config);
        // Rollup 配置 - 编译但不生成声明文件
        const rollupOptions = {
            input: config.input,
            output: config.output || {
                dir: "dist",
                format: "esm",
            },
            plugins: [
                ...[config.rollupOptions?.plugins].flat(),
                {
                    name: "ts-compile-only",
                    async transform(code, id) {
                        if (id.endsWith(".ts") || id.endsWith(".tsx")) {
                            // @ts-ignore
                            const ts = await Promise.resolve().then(() => __importStar(require("typescript")));
                            return ts.transpileModule(code, {
                                compilerOptions: {
                                    target: ts.ScriptTarget.ESNext,
                                    module: ts.ModuleKind.ESNext,
                                    jsx: ts.JsxEmit.React,
                                    esModuleInterop: true,
                                },
                            }).outputText;
                        }
                    },
                },
            ],
            ...(config.rollupOptions || {}),
        };
        const success = await builder.runBuild(rollupOptions, rollupOptions.output);
        await config.plugins.applyHook("afterCompile", success);
        if (success) {
            logger.success("Compilation completed successfully");
            process.exit(0);
        }
        else {
            logger.error("Compilation failed");
            process.exit(1);
        }
    }
    catch (error) {
        logger.error("Error during compilation:", error);
        process.exit(1);
    }
}
exports.compileCommand = compileCommand;
