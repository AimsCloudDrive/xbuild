#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { rolldown } from "rolldown";
import * as ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = {
  info: (message, ...args) =>
    console.log(`${chalk.blue("[INFO]")} ${chalk.gray(message)}`, ...args),
  warn: (message, ...args) =>
    console.log(`${chalk.yellow("[WARN]")} ${chalk.yellow(message)}`, ...args),
  error: (message, ...args) =>
    console.log(`${chalk.red("[ERROR]")} ${chalk.red(message)}`, ...args),
  success: (message, ...args) =>
    console.log(`${chalk.green("[SUCCESS]")} ${chalk.green(message)}`, ...args),
};

class TypeScriptCompiler {
  async checkTypes() {
    logger.info("Running TypeScript type check...");

    const configPath = ts.findConfigFile(
      process.cwd(),
      ts.sys.fileExists,
      "tsconfig.json"
    );

    if (!configPath) {
      logger.warn("No tsconfig.json found, skipping type check");
      return true;
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      process.cwd()
    );

    const program = ts.createProgram({
      rootNames: parsedConfig.fileNames,
      options: parsedConfig.options,
    });

    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
      const formatHost = {
        getCanonicalFileName: (p) => p,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      };

      const message = ts.formatDiagnostics(diagnostics, formatHost);
      logger.error("TypeScript type check failed:\n" + message);
      return false;
    }

    logger.success("TypeScript type check passed");
    return true;
  }
}

class Builder {
  constructor(config) {
    this.config = config;
  }

  async build() {
    process.env.NODE_ENV = "production";

    try {
      const build = await rolldown({
        input: this.config.input,
        external: this.config.external,
        plugins: [],
      });

      const outputOptions = this.normalizeOutput(this.config.output);

      for (const output of outputOptions) {
        await build.write(output);
      }

      await build.close();

      logger.success("Build completed successfully");
      return true;
    } catch (error) {
      delete process.env.NODE_ENV;
      logger.error("Build failed", error);
      return false;
    }
  }

  async watch() {
    logger.info("Starting development server...");

    const watcher = await rolldown({
      input: this.config.input,
      external: this.config.external,
      plugins: [],
      watch: {
        include: ["src/**"],
        exclude: "node_modules/**",
      },
    });

    watcher.watch();

    logger.success("Watch mode started...");
  }

  normalizeOutput(output) {
    if (!output) {
      return [
        {
          dir: "dist",
          format: "esm",
          sourcemap: false,
        },
      ];
    }

    const outputs = Array.isArray(output) ? output : [output];

    return outputs.map((o) => ({
      dir: o.dir || "dist",
      file: o.file,
      format: o.format || "esm",
      sourcemap: o.sourcemap ?? false,
    }));
  }
}

async function loadConfig(userConfigPath) {
  const configPath = findConfigFile(userConfigPath);

  if (!configPath) {
    logger.warn("No config file found, using default configuration");
    return getDefaultConfig();
  }

  try {
    logger.info(`Loading configuration from ${configPath}`);

    const userConfigModule = await import(configPath);
    const userConfig = userConfigModule.default || userConfigModule;

    const finalConfig = typeof userConfig === "function"
      ? userConfig({ mode: process.env.NODE_ENV || "production" })
      : userConfig;

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

function findConfigFile(userPath) {
  const possiblePaths = [
    userPath,
    "xbuild.config.ts",
    "xbuild.config.js",
    "build.config.ts",
  ].filter(Boolean);

  for (const configPath of possiblePaths) {
    const absolutePath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
    const withTsExt = absolutePath.endsWith(".ts") ? absolutePath : `${absolutePath}.ts`;
    if (fs.existsSync(withTsExt)) {
      return withTsExt;
    }
  }
  return null;
}

function getDefaultConfig() {
  return {
    input: "src/index.ts",
    output: {
      dir: "dist",
    },
    tsconfig: "tsconfig.json",
    plugins: [],
  };
}

program
  .name("xbuild")
  .description("High-performance build tool powered by Rolldown")
  .version("1.0.0");

program
  .command("check")
  .description("Run TypeScript type checking")
  .option("-c, --config <path>", "Path to config file")
  .action(async (options) => {
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
  });

program
  .command("dev")
  .description("Start development server with watch mode")
  .option("-c, --config <path>", "Path to config file")
  .option("-p, --port <number>", "Port number", "3000")
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const builder = new Builder(config);
      await builder.watch();
      logger.success(`Development server running at http://localhost:${options.port}`);
    } catch (error) {
      logger.error("Error starting development server:", error);
      process.exit(1);
    }
  });

program
  .command("compile")
  .description("Compile TypeScript to JavaScript")
  .option("-c, --config <path>", "Path to config file")
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      logger.info("Starting compilation...");

      const build = await rolldown({
        input: config.input,
        external: config.external,
        plugins: [],
      });

      const outputOptions = config.output || { dir: "dist" };

      await build.write({
        dir: outputOptions.dir || "dist",
        format: outputOptions.format || "esm",
        sourcemap: false,
      });

      await build.close();

      logger.success("Compilation completed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("Error during compilation:", error);
      process.exit(1);
    }
  });

program
  .command("build")
  .description("Full build process with type checking and bundling")
  .option("-c, --config <path>", "Path to config file")
  .action(async (options) => {
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
  });

program.parse();
