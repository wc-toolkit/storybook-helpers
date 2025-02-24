export class Logger {
  #debug: boolean;

  constructor(debug = false) {
    this.#debug = debug;
  }

  log(message: string, color = "\x1b[30m%s\x1b[0m") {
    if (!this.#debug) {
      return;
    }

    console.log(color, message);
  }

  red(message: string) {
    this.log(message, "\x1b[31m%s\x1b[0m");
  }

  green(message: string) {
    this.log(message, "\x1b[32m%s\x1b[0m");
  }

  yellow(message: string) {
    this.log(message, "\x1b[33m%s\x1b[0m");
  }

  blue(message: string) {
    this.log(message, "\x1b[34m%s\x1b[0m");
  }

  magenta(message: string) {
    this.log(message, "\x1b[35m%s\x1b[0m");
  }

  cyan(message: string) {
    this.log(message, "\x1b[36m%s\x1b[0m");
  }
}
