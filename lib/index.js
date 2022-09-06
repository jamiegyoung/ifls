"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_1 = __importDefault(require("fs"));
const args_1 = require("./src/args");
const parse_1 = require("./src/parse");
const openAi_1 = require("./src/openAi");
const path_1 = __importDefault(require("path"));
const debug = (0, debug_1.default)("ifls:index");
const [, , ...givenArgs] = process.argv;
const args = new args_1.Args(givenArgs);
debug("Args:", args);
const getDirOrFilePath = (givenPath = "./", name, fallbackLocalDir) => {
    if (givenPath) {
        const givenPathStats = fs_1.default.statSync(givenPath);
        const concactedPath = path_1.default.join(givenPath, name);
        if (givenPathStats.isDirectory() && fs_1.default.existsSync(concactedPath)) {
            return concactedPath;
        }
        if (givenPathStats.isFile() && fs_1.default.existsSync(givenPath)) {
            return givenPath;
        }
        // if the given path is neither a file nor directory, try and find it in the current working directory
        const localPath = path_1.default.join("./", name);
        if (fs_1.default.existsSync(localPath) && fallbackLocalDir) {
            return localPath;
        }
    }
};
const configPath = getDirOrFilePath(args.config, "iflsconfig.json", true);
const configJson = (() => configPath
    ? JSON.parse(fs_1.default.readFileSync(configPath, "utf8"))
    : {})();
const config = {
    version: configJson.version || "1.0",
    outDir: args.outDir || configJson.outDir || "./",
    srcDir: args.srcDir || configJson.srcDir || "./",
    openAIApiKey: args.apiKey || configJson.openAIApiKey || "",
    exclude: configJson.exclude || [],
};
debug("Config:", config);
const apiKey = config.openAIApiKey || process.env.OPEN_AI_API_KEY;
if (!apiKey) {
    throw new Error("No openAi api key found");
}
const openAi = new openAi_1.OpenAiInstance(apiKey);
(0, parse_1.parseDir)(openAi, config.srcDir, config.outDir, config.exclude, args.ignoreCache, args.dontCache);
