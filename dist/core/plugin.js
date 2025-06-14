"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
class PluginManager {
    constructor(plugins) {
        if (plugins instanceof PluginManager) {
            return plugins;
        }
        else {
            this.plugins = plugins;
        }
    }
    async applyHook(hookName, ...args) {
        for (const plugin of this.plugins) {
            const hook = plugin.hooks?.[hookName];
            if (typeof hook === "function") {
                try {
                    await hook(...args);
                }
                catch (error) {
                    console.error(`Plugin ${plugin.name} hook ${hookName} failed:`, error);
                }
            }
        }
    }
    getRollupPlugins() {
        return this.plugins
            .map((p) => p.rollupPlugin?.())
            .filter(Boolean);
    }
    getDevPlugins() {
        return this.plugins.map((p) => p.devServer?.()).filter(Boolean);
    }
}
exports.PluginManager = PluginManager;
