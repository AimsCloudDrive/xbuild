import { loadConfig } from "../utils/config.js";
import { Builder } from "../core/builder.js";
import { logger } from "../utils/logger.js";

export async function devCommand(options: {
  config?: string;
  port?: string;
}) {
  try {
    const config = await loadConfig(options.config);

    logger.info("Starting development server...");

    const builder = new Builder(config);

    await builder.watch();

    logger.success(
      `Development server running at http://localhost:${options.port || 3000}`
    );
  } catch (error) {
    logger.error("Error starting development server:", error);
    process.exit(1);
  }
}
