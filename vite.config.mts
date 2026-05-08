import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: "./src/cli.ts",
      formats: ["es"],
      fileName: () => "xbuild.js",
    },
    rollupOptions: {
      external: ["typescript"],
      output: {
        codeSplitting: false,
        banner: "#!/usr/bin/env node",
      },
    },
    minify: false,
    sourcemap: false,
    copyPublicDir: false,
  },
});
