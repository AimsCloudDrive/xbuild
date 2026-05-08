import { defineConfig } from "./src/core/types.js";

const selfBuildPlugin = {
  name: "self-build",
  hooks: {
    name: "self-build-hooks",
    beforeBuild: async () => {
      console.log("[Self-Build] Starting build process...");
    },
    afterBuild: async (success) => {
      console.log(`[Self-Build] Build ${success ? "succeeded" : "failed"}`);
    },
  },
  rolldownPlugin: () => ({
    name: "self-build-resolver",
    resolveId(id) {
      if (
        id.startsWith("./plugins/") ||
        id.startsWith("./commands/")
      ) {
        return false;
      }
      return null;
    },
  }),
};

export default defineConfig({
  input: "src/cli.ts",
  output: {
    file: "bin/cli.js",
    format: "esm",
  },
  plugins: [selfBuildPlugin],
  external: [],
});
