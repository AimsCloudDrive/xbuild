"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// src/utils/logger.ts
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    prefix;
    constructor(prefix) {
        this.prefix = prefix;
    }
    log(level, message, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        let prefix = `[${timestamp}] ${this.prefix}:`;
        switch (level) {
            case "info":
                prefix = chalk_1.default.blue(prefix);
                message = chalk_1.default.gray(message);
                break;
            case "warn":
                prefix = chalk_1.default.yellow(prefix);
                message = chalk_1.default.yellow(message);
                break;
            case "error":
                prefix = chalk_1.default.red(prefix);
                message = chalk_1.default.red(message);
                break;
            case "success":
                prefix = chalk_1.default.green(prefix);
                message = chalk_1.default.green(message);
                break;
        }
        console.log(`${prefix} ${message}`, ...args);
    }
    info(message, ...args) {
        this.log("info", message, ...args);
    }
    warn(message, ...args) {
        this.log("warn", message, ...args);
    }
    error(message, ...args) {
        this.log("error", message, ...args);
    }
    success(message, ...args) {
        this.log("success", message, ...args);
    }
    progress(message, current, total) {
        const percent = Math.round((current / total) * 100);
        const progressBar = `[${"=".repeat(percent / 5)}${" ".repeat(20 - percent / 5)}]`;
        this.info(`${message} ${progressBar} ${percent}% (${current}/${total})`);
    }
}
exports.Logger = Logger;
