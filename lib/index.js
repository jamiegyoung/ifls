"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_1 = __importDefault(require("fs"));
const args_1 = require("./args");
const parse_1 = require("./src/parse");
const openAi_1 = require("./src/openAi");
const debug = (0, debug_1.default)("ifls:index");
const [, , ...givenArgs] = process.argv;
const args = new args_1.Args(givenArgs);
const config = args.configDir && fs_1.default.existsSync(args.configDir + "iflsconfig.json")
    ? JSON.parse(fs_1.default.readFileSync(`${args.configDir}iflsconfig.json`, "utf8"))
    : {
        version: "1.0",
        outDir: args.outDir || "./",
        srcDir: args.workingDir || "./",
        openAIApiKey: args.apiKey,
    };
debug("Config:", config);
const apiKey = config.openAIApiKey || process.env.OPEN_AI_API_KEY;
if (!apiKey) {
    throw new Error("No openAi api key found");
}
const openAi = new openAi_1.OpenAiInstance(apiKey);
(0, parse_1.parseDir)(openAi, config.srcDir, config.outDir);
