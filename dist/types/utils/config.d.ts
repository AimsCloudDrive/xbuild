import { XBuildConfig } from "../core/types";
import { PluginManager } from "../core/plugin";
export declare function loadConfig(userConfigPath?: string): Promise<Omit<XBuildConfig, "plugins"> & {
    plugins: PluginManager;
}>;
