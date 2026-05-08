import type { RolldownPlugin } from "rolldown";

export type XBuildMode = "development" | "production";

export interface XBuildPluginHooks {
  name: string;
  beforeBuild?: () => Promise<void>;
  afterBuild?: (success: boolean, error?: unknown) => Promise<void>;
  beforeCheck?: () => Promise<void>;
  afterCheck?: (success: boolean) => Promise<void>;
  beforeWatch?: () => Promise<void>;
  afterWatch?: () => Promise<void>;
}

export interface XBuildPlugin {
  name: string;
  hooks?: XBuildPluginHooks;
  rolldownPlugin?: () => RolldownPlugin;
}

export interface XBuildOutputOptions {
  dir?: string;
  file?: string;
  format?: "esm" | "cjs" | "iife";
  sourcemap?: boolean | "inline" | "hidden";
  name?: string;
  globals?: Record<string, string>;
  banner?: string | Function;
  footer?: string | Function;
  entryFileNames?: string;
  chunkFileNames?: string;
  assetFileNames?: string;
}

export interface XBuildConfig {
  input: string | string[] | Record<string, string>;
  output?: XBuildOutputOptions | XBuildOutputOptions[];
  mode?: XBuildMode;
  tsconfig?: string;
  watch?: boolean;
  external?: string[] | RegExp | Function;
  plugins?: XBuildPlugin[];
}

export interface XBuildContext {
  config: XBuildConfig;
  plugins: XBuildPlugin[];
  mode: XBuildMode;
}

export type UserConfig =
  | Partial<XBuildConfig>
  | ((
      env: { mode: XBuildMode }
    ) => Partial<XBuildConfig>);

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
