import { loadConfig } from "../utils/config.js";
import { Builder } from "../core/builder.js";
import { logger } from "../utils/logger.js";

export async function buildCommand(options: { config?: string }) {
  try {
    const config = await loadConfig(options.config);

    logger.info("Starting build process...");

    const builder = new Builder(config);

    const success = await builder.build();

    if (success) {
      logger.success("Build completed successfully");
      process.exit(0);
    } else {
      logger.error("Build failed");
      process.exit(1);
    }
  } catch (error) {
    logger.error("Error during build:", error);
    process.exit(1);
  }
}
