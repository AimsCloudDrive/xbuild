import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "success";

export class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toLocaleTimeString();
    const prefixStr = `[${timestamp}] ${this.prefix}:`;

    let styledPrefix: string;
    let styledMessage: string;

    switch (level) {
      case "info":
        styledPrefix = chalk.blue(prefixStr);
        styledMessage = chalk.gray(message);
        break;
      case "warn":
        styledPrefix = chalk.yellow(prefixStr);
        styledMessage = chalk.yellow(message);
        break;
      case "error":
        styledPrefix = chalk.red(prefixStr);
        styledMessage = chalk.red(message);
        break;
      case "success":
        styledPrefix = chalk.green(prefixStr);
        styledMessage = chalk.green(message);
        break;
    }

    console.log(`${styledPrefix} ${styledMessage}`, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log("error", message, ...args);
  }

  success(message: string, ...args: unknown[]) {
    this.log("success", message, ...args);
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) =>
    console.log(`${chalk.blue("[INFO]")} ${chalk.gray(message)}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    console.log(`${chalk.yellow("[WARN]")} ${chalk.yellow(message)}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.log(`${chalk.red("[ERROR]")} ${chalk.red(message)}`, ...args),
  success: (message: string, ...args: unknown[]) =>
    console.log(`${chalk.green("[SUCCESS]")} ${chalk.green(message)}`, ...args),
};
