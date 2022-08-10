import Debug from "debug";
const debug = Debug("ifls:args");

const argNames = {
  configDir: { names: ["--config", "-c"], default: "./" },
  apiKey: { names: ["--api-key", "-a", "-k"], default: "" },
  outDir: { names: ["--out-dir", "-o"], default: "./" },
};

export class Args {
  workingDir: string;
  configDir?: string;
  outDir?: string;
  apiKey?: string;
  [k: string]: any;

  constructor(args: string[]) {
    debug("Given args:", args);
    for (const [key, reqArg] of Object.entries(argNames)) {
      const index = args.findIndex((arg) => reqArg.names.includes(arg));
      if (index > -1) {
        this[key] = args[index + 1];
        args.splice(index, 2);
      } else {
        this[key] = reqArg.default;
      }
    }
    // The final argument should be the working directory
    debug("Left over args:", args);
    if (args.length > 1) {
      throw new Error("Too many arguments");
    }
    this.workingDir = args[0];
    debug("Working dir:", this.workingDir);
    debug(`Args: ${JSON.stringify(this)}`);
  }
}
