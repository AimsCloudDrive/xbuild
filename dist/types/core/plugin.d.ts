import { Plugin as RollupPlugin } from "rollup";
import { XBuildPluginHooks } from "./types";
export interface XBuildPlugin {
    name: string;
    hooks?: XBuildPluginHooks;
    rollupPlugin?: () => RollupPlugin;
    devServer?: () => any;
}
declare class PluginManager {
    private plugins;
    constructor(plugins: XBuildPlugin[] | PluginManager);
    applyHook<K extends keyof XBuildPluginHooks>(hookName: K, ...args: Parameters<NonNullable<XBuildPluginHooks[K]>>): Promise<void>;
    getRollupPlugins(): RollupPlugin[];
    getDevPlugins(): any[];
}
export { PluginManager };
