import Debug from "debug";
const debug = Debug("ifls:args");

const argNames = {
  configDir: { names: ["--config", "-c"], type: "string" },
  apiKey: { names: ["--api-key", "-a", "-k"], type: "string" },
  outDir: { names: ["--out-dir", "-o"], type: "string" },
  ignoreCache: { names: ["--ignore-cache", "-i"], type: "boolean" },
};

export class Args {
  srcDir?: string;
  configDir?: string;
  outDir?: string;
  apiKey?: string;
  ignoreCache = false;
  [k: string]: any;

  constructor(args: string[]) {
    debug("Given args:", args);
    for (const [key, reqArg] of Object.entries(argNames)) {
      const index = args.findIndex((arg) => reqArg.names.includes(arg));
      debug(`${key}: ${index}`);
      if (index < 0) continue;
      switch (reqArg.type) {
        case "string":
          debug(`Setting ${key} to string ${args[index + 1]}`);
          this[key] = args[index + 1];
          args.splice(index, 2);
          break;
        case "boolean":
          debug(`Setting ${key} to boolean true`);
          this[key] = true;
          args.splice(index, 1);
          break;
        default:
          break;
      }
    }
    if (!this.configDir) {
      this.configDir = "./";
    }
    // The final argument should be the working directory
    debug("Left over args:", args);
    if (args.length > 1) {
      throw new Error("Too many arguments");
    }
    this.srcDir = args[0] || undefined;
    debug("Working dir:", this.srcDir);
    debug(`Args: ${JSON.stringify(this)}`);
  }
}
