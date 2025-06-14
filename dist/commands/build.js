"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommand = void 0;
const builder_1 = require("../core/builder");
const compiler_1 = require("../core/compiler");
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
async function buildCommand(options) {
    const logger = new logger_1.Logger("Build");
    try {
        let config = await (0, config_1.loadConfig)(options.config);
        // 构建模式配置
        config = {
            ...config,
            mode: "production",
            watch: false,
            serve: false,
            tsconfig: config.tsconfig || "tsconfig.json",
        };
        logger.info("Starting full build process...");
        // 步骤1: 类型检查
        await config.plugins.applyHook("beforeCheck");
        const compiler = new compiler_1.TypeScriptCompiler(config);
        const typeCheckSuccess = await compiler.checkTypes();
        await config.plugins.applyHook("afterCheck", typeCheckSuccess);
        if (!typeCheckSuccess) {
            logger.error("Build failed: Type checking errors found");
            process.exit(1);
        }
        // 步骤2: 生成类型声明文件
        await config.plugins.applyHook("beforeDeclaration");
        const declarationSuccess = await compiler.emitDeclarations();
        await config.plugins.applyHook("afterDeclaration", declarationSuccess);
        if (!declarationSuccess) {
            logger.error("Build failed: Declaration file generation failed");
            process.exit(1);
        }
        // 步骤3: 打包构建
        const builder = new builder_1.XBuilder(config);
        const rollupOptions = {
            input: config.input,
            output: config.output || {
                dir: "dist",
                format: "esm",
            },
            plugins: config.rollupOptions?.plugins || [],
            ...(config.rollupOptions || {}),
        };
        await config.plugins.applyHook("beforeBuild");
        const buildSuccess = await builder.runBuild(rollupOptions, rollupOptions.output);
        await config.plugins.applyHook("afterBuild", buildSuccess);
        if (buildSuccess) {
            logger.success("Full build completed successfully");
            process.exit(0);
        }
        else {
            logger.error("Build failed during bundling");
            process.exit(1);
        }
    }
    catch (error) {
        logger.error("Error during build process:", error);
        process.exit(1);
    }
}
exports.buildCommand = buildCommand;
