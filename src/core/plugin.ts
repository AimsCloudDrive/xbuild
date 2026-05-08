import type { RolldownPlugin } from "rolldown";
import type { XBuildPlugin } from "./types.js";

export class PluginManager {
  private plugins: XBuildPlugin[];

  constructor(plugins: XBuildPlugin[]) {
    this.plugins = plugins || [];
  }

  async applyHook<K extends "beforeBuild" | "afterBuild" | "beforeCheck" | "afterCheck" | "beforeWatch" | "afterWatch">(
    hookName: K,
    ...args: K extends "afterBuild" ? [boolean, unknown?] : [boolean]
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks?.[hookName];
      if (typeof hook === "function") {
        try {
          await (hook as (arg: unknown) => Promise<void>)(args[0]);
        } catch (error) {
          console.error(
            `Plugin ${plugin.name} hook ${hookName} failed:`,
            error
          );
        }
      }
    }
  }

  getRolldownPlugins(): RolldownPlugin[] {
    return this.plugins
      .map((p) => p.rolldownPlugin?.())
      .filter((p): p is RolldownPlugin => p !== undefined);
  }

  getPluginNames(): string[] {
    return this.plugins.map((p) => p.name);
  }
}
