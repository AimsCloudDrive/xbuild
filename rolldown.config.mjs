export default {
  input: "./src/cli.ts",
  output: {
    format: "esm",
    dir: "dist",
    entryFileNames: "cli.js",
    inlineDynamicImports: true,
  },
  platform: "node",
  external: ["typescript"],
};
