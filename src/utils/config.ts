import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { XBuildConfig } from "../core/types.js";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadConfig(
  userConfigPath?: string
): Promise<XBuildConfig> {
  const configPath = findConfigFile(userConfigPath);

  if (!configPath) {
    logger.warn("No config file found, using default configuration");
    return getDefaultConfig();
  }

  try {
    logger.info(`Loading configuration from ${configPath}`);

    const userConfigModule = await import(configPath);
    const userConfig = userConfigModule.default || userConfigModule;

    const resolvedConfig =
      typeof userConfig === "function"
        ? userConfig({
            mode:
              (process.env.NODE_ENV as "development" | "production") ||
              "production",
          })
        : userConfig;

    const finalConfig = resolvedConfig as XBuildConfig;

    return {
      mode: "production",
      tsconfig: "tsconfig.json",
      ...finalConfig,
    };
  } catch (error) {
    logger.error(`Failed to load config file: ${configPath}`, error);
    throw error;
  }
}

function findConfigFile(userPath?: string): string | null {
  const possiblePaths = [
    userPath,
    "xbuild.config.ts",
    "xbuild.config.js",
    "xbuild.config.mjs",
    "build.config.ts",
    path.join("config", "xbuild.config.ts"),
  ].filter(Boolean) as string[];

  for (const configPath of possiblePaths) {
    const absolutePath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }

    const withTsExt =
      absolutePath.endsWith(".ts") ? absolutePath : `${absolutePath}.ts`;
    if (fs.existsSync(withTsExt)) {
      return withTsExt;
    }

    const withJsExt =
      absolutePath.endsWith(".js") ? absolutePath : `${absolutePath}.js`;
    if (fs.existsSync(withJsExt)) {
      return withJsExt;
    }
  }

  return null;
}

function getDefaultConfig(): XBuildConfig {
  return {
    input: "src/index.ts",
    output: {
      dir: "dist",
    },
    tsconfig: "tsconfig.json",
    plugins: [],
  };
}
