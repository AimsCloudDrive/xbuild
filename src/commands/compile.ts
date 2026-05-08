import { rolldown } from "rolldown";
import { loadConfig } from "../utils/config";
import { logger } from "../utils/logger";

export async function compileCommand(options: { config?: string }) {
  try {
    const config = await loadConfig(options.config);
    logger.info("Starting compilation...");

    const outputOptions = config.output || { dir: "dist" };

    const build = await rolldown({
      input: config.input,
      external: config.external,
      plugins: [],
    });

    await build.write({
      dir: (outputOptions as { dir?: string }).dir || "dist",
      format: (outputOptions as { format?: string }).format || "esm",
      sourcemap: false,
    });

    await build.close();

    logger.success("Compilation completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during compilation:", error);
    process.exit(1);
  }
}
