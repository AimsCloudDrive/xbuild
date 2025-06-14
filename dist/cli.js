#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const check_1 = require("./commands/check");
const dev_1 = require("./commands/dev");
const compile_1 = require("./commands/compile");
const build_1 = require("./commands/build");
commander_1.program
    .name("xbuild")
    .description("Extensible Rollup-based TypeScript build tool")
    .version("0.1.0");
commander_1.program
    .command("check")
    .description("Run TypeScript type checking")
    .option("-c, --config <path>", "Path to config file")
    .action(async (options) => {
    await (0, check_1.checkCommand)(options);
});
commander_1.program
    .command("dev")
    .description("Start development server")
    .option("-c, --config <path>", "Path to config file")
    .option("-p, --port <number>", "Port number", "3000")
    .action(async (options) => {
    await (0, dev_1.devCommand)(options);
});
commander_1.program
    .command("compile")
    .description("Compile TypeScript without generating .d.ts files")
    .option("-c, --config <path>", "Path to config file")
    .action(async (options) => {
    await (0, compile_1.compileCommand)(options);
});
commander_1.program
    .command("build")
    .description("Full build process with type checking and declaration files")
    .option("-c, --config <path>", "Path to config file")
    .action(async (options) => {
    await (0, build_1.buildCommand)(options);
});
commander_1.program.parse(process.argv).on("exit", (...args) => {
    console.log(...args);
});
