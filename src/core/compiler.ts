import * as ts from "typescript";
import { logger } from "../utils/logger.js";

export class TypeScriptCompiler {
  async checkTypes(): Promise<boolean> {
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
      const formatHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path) => path,
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

  async emitDeclarations(): Promise<boolean> {
    logger.info("Generating type declarations...");

    const configPath = ts.findConfigFile(
      process.cwd(),
      ts.sys.fileExists,
      "tsconfig.json"
    );

    if (!configPath) {
      logger.warn("No tsconfig.json found, skipping declaration emit");
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
      options: {
        ...parsedConfig.options,
        declaration: true,
        emitDeclarationOnly: true,
        noEmit: false,
        outDir: parsedConfig.options.outDir || "dist",
      },
    });

    const emitResult = program.emit();
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    if (diagnostics.length > 0) {
      const formatHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      };

      const message = ts.formatDiagnostics(diagnostics, formatHost);
      logger.error("Declaration generation failed:\n" + message);
      return false;
    }

    logger.success("Type declarations generated");
    return true;
  }
}
