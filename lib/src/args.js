"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Args = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("ifls:args");
const argNames = {
    config: { names: ["--config", "-c"], type: "string" },
    apiKey: { names: ["--api-key", "-a", "-k"], type: "string" },
    outDir: { names: ["--out-dir", "-o"], type: "string" },
    ignoreCache: { names: ["--ignore-cache", "-i"], type: "boolean" },
    dontCache: { names: ["--dont-cache", "-d"], type: "boolean" },
};
class Args {
    constructor(args) {
        this.ignoreCache = false;
        this.dontCache = false;
        debug("Given args:", args);
        for (const [key, reqArg] of Object.entries(argNames)) {
            const index = args.findIndex((arg) => reqArg.names.includes(arg));
            debug(`${key}: ${index}`);
            if (index < 0)
                continue;
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
        if (!this.config) {
            this.config = "./";
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
