import { rolldown } from "rolldown";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

async function buildSelf() {
  console.log("Starting self-build...");

  const cliSource = path.join(projectRoot, "src", "cli.ts");
  const binDir = path.join(projectRoot, "bin");
  const binCliPath = path.join(binDir, "xbuild.js");

  if (!fs.existsSync(cliSource)) {
    console.error("CLI source not found:", cliSource);
    process.exit(1);
  }

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const rolldownBuild = await rolldown({
    input: cliSource,
    treeshake: false,
    codeSplitting: false,
    external: (id) => {
      if (id.startsWith("node:") || id === "typescript") {
        return true;
      }
      return false;
    },
  });

  const { output } = await rolldownBuild.generate({
    format: "esm",
  });

  for (const chunk of output) {
    if (chunk.type === "chunk") {
      let code = chunk.code;
      if (!code.startsWith("#!")) {
        code = "#!/usr/bin/env node\n" + code;
      }
      fs.writeFileSync(binCliPath, code);
      console.log("Generated:", binCliPath);
      console.log("Chunk size:", chunk.code.length, "bytes");
    }
  }

  await rolldownBuild.close();

  fs.chmodSync(binCliPath, 0o755);
  console.log("Self-build completed!");
}

buildSelf().catch((err) => {
  console.error("Self-build failed:", err);
  process.exit(1);
});
