"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Args = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("ifls:args");
const argNames = {
    configDir: { names: ["--config", "-c"] },
    apiKey: { names: ["--api-key", "-a", "-k"] },
    outDir: { names: ["--out-dir", "-o"] },
};
class Args {
    constructor(args) {
        debug("Given args:", args);
        for (const [key, reqArg] of Object.entries(argNames)) {
            const index = args.findIndex((arg) => reqArg.names.includes(arg));
            if (index > -1) {
                this[key] = args[index + 1];
                args.splice(index, 2);
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
exports.Args = Args;
