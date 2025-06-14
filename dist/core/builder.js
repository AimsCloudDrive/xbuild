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
exports.XBuilder = void 0;
const rollup_1 = require("rollup");
const logger_1 = require("../utils/logger");
const plugin_1 = require("./plugin");
class XBuilder {
    config;
    plugins;
    logger = new logger_1.Logger("Builder");
    constructor(config) {
        this.config = config;
        this.plugins = new plugin_1.PluginManager(config.plugins || []);
    }
    async runBuild(rollupOptions, outputOptions) {
        process.env.NODE_ENV = "production";
        try {
            await this.plugins.applyHook("beforeBuild");
            const bundle = await (0, rollup_1.rollup)({
                ...rollupOptions,
                plugins: [
                    ...[rollupOptions.plugins].flat(),
                    ...this.plugins.getRollupPlugins(),
                ],
            });
            outputOptions = [outputOptions].flat();
            for (let i = 0; i < outputOptions.length; i++) {
                const element = outputOptions[i];
                const j = i;
                outputOptions[j] = bundle.write(element);
            }
            await Promise.all(outputOptions);
            await bundle.close();
            this.logger.success("Build completed successfully");
            await this.plugins.applyHook("afterBuild", true);
            return true;
        }
        catch (error) {
            delete process.env.NODE_ENV;
            this.logger.error("Build failed", error);
            await this.plugins.applyHook("afterBuild", false, error);
            return false;
        }
    }
    async runDev(rollupOptions, outputOptions) {
        const { watch } = await Promise.resolve().then(() => __importStar(require("rollup")));
        const watcher = watch({
            ...rollupOptions,
            output: outputOptions,
            plugins: [
                ...[rollupOptions.plugins].flat(),
                ...this.plugins.getRollupPlugins(),
                ...this.plugins.getDevPlugins(),
            ],
        });
        watcher.on("event", (event) => {
            switch (event.code) {
                case "START":
                    this.logger.info("Checking for changes...");
                    break;
                case "BUNDLE_START":
                    this.logger.info(`Bundling ${event.input}...`);
                    break;
                case "BUNDLE_END":
                    this.logger.success(`Bundle written to ${event.output}`);
                    break;
                case "ERROR":
                    this.logger.error("Build error", event.error);
                    break;
            }
        });
        return watcher;
    }
}
exports.XBuilder = XBuilder;
