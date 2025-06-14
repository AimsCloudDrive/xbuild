// xbuild.self.config.ts
import { defineConfig } from "./src/core/types";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// @ts-ignore
import json from "@rollup/plugin-json";

// 自定义插件 - 确保在构建过程中不尝试加载未编译的插件
const selfBuildPlugin = {
  name: "self-build-plugin",
  hooks: {
    beforeBuild: async () => {
      console.log("Self-build plugin: Starting build process");
    },
    afterBuild: async (success) => {
      console.log(
        `Self-build plugin: Build ${success ? "succeeded" : "failed"}`
      );
    },
  },
  rollupPlugin: () => ({
    name: "rollup-self-build",
    resolveId(source) {
      // 确保在构建过程中不尝试加载未编译的插件
      if (source.startsWith("./plugins/") || source.startsWith("./commands/")) {
        return false;
      }
      return null;
    },
  }),
};

export default defineConfig({
  input: "src/cli.ts",
  output: {
    file: "dist/cli.js",
    format: "cjs",
  },
  tsconfig: "tsconfig.self.json",
  plugins: [
    selfBuildPlugin,
    typescript({
      tsconfig: "tsconfig.self.json",
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
    }),
    resolve({
      preferBuiltins: true,
      extensions: [".ts", ".js"],
    }),
    commonjs(),
    json(),
  ],
});
