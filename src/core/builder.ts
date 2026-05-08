import { rolldown, type InputOptions, type OutputOptions } from "rolldown";
import type { RolldownPlugin } from "rolldown";
import { PluginManager } from "./plugin.js";
import { logger } from "../utils/logger.js";
import type { XBuildConfig, XBuildOutputOptions } from "./types.js";

export class Builder {
  private config: XBuildConfig;
  private plugins: PluginManager;

  constructor(config: XBuildConfig) {
    this.config = config;
    this.plugins = new PluginManager(config.plugins || []);
  }

  async build(): Promise<boolean> {
    process.env.NODE_ENV = "production";

    try {
      await this.plugins.applyHook("beforeBuild");

      const outputOptions = this.normalizeOutput(this.config.output);

      const inputOptions: InputOptions = {
        input: this.config.input,
        external: this.config.external,
        plugins: this.getAllPlugins(),
      };

      const build = await rolldown(inputOptions);

      for (const output of outputOptions) {
        await build.write(output);
      }

      await build.close();

      logger.success("Build completed successfully");
      await this.plugins.applyHook("afterBuild", true);
      return true;
    } catch (error) {
      delete process.env.NODE_ENV;
      logger.error("Build failed", error);
      await this.plugins.applyHook("afterBuild", false, error);
      return false;
    }
  }

  async watch(): Promise<void> {
    await this.plugins.applyHook("beforeWatch");

    const outputOptions = this.normalizeOutput(this.config.output);

    const inputOptions: InputOptions = {
      input: this.config.input,
      external: this.config.external,
      plugins: this.getAllPlugins(),
      watch: {
        include: ["src/**"],
        exclude: "node_modules/**",
      },
    };

    const watcher = await rolldown(inputOptions);

    watcher.watch();

    watcher.onClose(() => {
      this.plugins.applyHook("afterWatch");
    });

    logger.success("Watch mode started...");
  }

  private getAllPlugins(): RolldownPlugin[] {
    return this.plugins.getRolldownPlugins();
  }

  private normalizeOutput(
    output?: XBuildOutputOptions | XBuildOutputOptions[]
  ): OutputOptions[] {
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
      name: o.name,
      globals: o.globals,
      banner: o.banner,
      footer: o.footer,
      entryFileNames: o.entryFileNames,
      chunkFileNames: o.chunkFileNames,
      assetFileNames: o.assetFileNames,
    }));
  }
}
