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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
// src/utils/config.ts
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const types_1 = require("../core/types");
const plugin_1 = require("../core/plugin");
const logger_1 = require("./logger");
const logger = new logger_1.Logger("Config");
async function loadConfig(userConfigPath) {
    const configPath = findConfigFile(userConfigPath);
    if (!configPath) {
        logger.warn("No config file found, using default configuration");
        return getDefaultConfig();
    }
    try {
        logger.info(`Loading configuration from ${configPath}`);
        // 动态导入配置文件
        const userConfigModule = await Promise.resolve(`${configPath}`).then(s => __importStar(require(s)));
        const userConfig = userConfigModule.default || userConfigModule;
        // 处理函数式配置
        const resolvedConfig = typeof userConfig === "function"
            ? userConfig({
                mode: process.env.NODE_ENV ||
                    "production",
            })
            : userConfig;
        // 应用 defineConfig 处理
        const finalConfig = (0, types_1.defineConfig)(resolvedConfig);
        // 确保插件管理器初始化
        const pluginManager = new plugin_1.PluginManager(finalConfig.plugins || []);
        // 设置默认值
        return {
            mode: "production",
            tsconfig: "tsconfig.json",
            ...finalConfig,
            plugins: pluginManager,
        };
    }
    catch (error) {
        logger.error(`Failed to load config file: ${configPath}`, error);
        throw error;
    }
}
exports.loadConfig = loadConfig;
function findConfigFile(userPath) {
    const possiblePaths = [
        userPath,
        "xbuild.config.ts",
        "xbuild.config.js",
        "xbuild.config.mjs",
        "xbuild.config.cjs",
        "build.config.ts",
        path_1.default.join("config", "xbuild.config.ts"),
    ].filter(Boolean);
    for (const configPath of possiblePaths) {
        const absolutePath = path_1.default.resolve(process.cwd(), configPath);
        if (fs_1.default.existsSync(absolutePath)) {
            return absolutePath;
        }
        // 尝试添加扩展名
        const withTsExt = absolutePath.endsWith(".ts")
            ? absolutePath
            : `${absolutePath}.ts`;
        if (fs_1.default.existsSync(withTsExt)) {
            return withTsExt;
        }
        const withJsExt = absolutePath.endsWith(".js")
            ? absolutePath
            : `${absolutePath}.js`;
        if (fs_1.default.existsSync(withJsExt)) {
            return withJsExt;
        }
    }
    return null;
}
function getDefaultConfig() {
    return {
        input: "src/index.ts",
        output: {
            dir: "dist",
            format: "esm",
        },
        tsconfig: "tsconfig.json",
        plugins: new plugin_1.PluginManager([]),
    };
}
