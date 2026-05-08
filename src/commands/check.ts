import { loadConfig } from "../utils/config";
import { TypeScriptCompiler } from "../core/compiler";
import { logger } from "../utils/logger";

export async function checkCommand(options: { config?: string }) {
  try {
    const config = await loadConfig(options.config);
    logger.info("Starting type checking...");

    const compiler = new TypeScriptCompiler();
    const success = await compiler.checkTypes();

    if (success) {
      logger.success("Type checking completed successfully");
      process.exit(0);
    } else {
      logger.error("Type checking failed");
      process.exit(1);
    }
  } catch (error) {
    logger.error("Error during type checking:", error);
    process.exit(1);
  }
}
