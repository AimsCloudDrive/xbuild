"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCommand = void 0;
const compiler_1 = require("../core/compiler");
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
async function checkCommand(options) {
    const logger = new logger_1.Logger("Check");
    try {
        const config = await (0, config_1.loadConfig)(options.config);
        logger.info("Starting type checking...");
        await config.plugins.applyHook("beforeCheck");
        const compiler = new compiler_1.TypeScriptCompiler(config);
        const success = await compiler.checkTypes();
        await config.plugins.applyHook("afterCheck", success);
        if (!success) {
            logger.error("Type checking failed");
            process.exit(1);
        }
        logger.success("Type checking completed successfully");
        process.exit(0);
    }
    catch (error) {
        logger.error("Error during type checking:", error);
        process.exit(1);
    }
}
exports.checkCommand = checkCommand;
