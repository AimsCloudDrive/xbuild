"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devCommand = void 0;
const builder_1 = require("../core/builder");
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
async function devCommand(options) {
    const logger = new logger_1.Logger("Dev");
    try {
        let config = await (0, config_1.loadConfig)(options.config);
        // 合并开发模式特定配置
        config = {
            ...config,
            mode: "development",
            watch: true,
            serve: true,
            port: options.port ? parseInt(options.port, 10) : config.port || 3000,
        };
        logger.info("Starting development server...");
        const builder = new builder_1.XBuilder(config);
        // 开发模式 Rollup 配置
        const rollupOptions = {
            input: config.input,
            output: config.output || {
                dir: "dist",
                format: "esm",
                sourcemap: true,
            },
            plugins: [],
            watch: {
                include: ["src/**"],
                exclude: "node_modules/**",
            },
            ...(config.rollupOptions || {}),
        };
        await builder.runDev(rollupOptions, rollupOptions.output);
        logger.success(`Development server running at http://localhost:${config.port}`);
    }
    catch (error) {
        logger.error("Error starting development server:", error);
        process.exit(1);
    }
}
exports.devCommand = devCommand;
