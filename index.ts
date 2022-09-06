import Debug from "debug";
import fs from "fs";
import { Args } from "./src/args";
import { parseDir } from "./src/parse";
import { OpenAiInstance } from "./src/openAi";
import { ConfigV1 } from "./src/types";
import path from "path";
const debug = Debug("ifls:index");

const [, , ...givenArgs] = process.argv;

const args = new Args(givenArgs);
debug("Args:", args);

if (!fs.existsSync(`${args.configDir}/iflsconfig.json`)) {
  debug("Config file not found");
}

const configPath = path.join(args.configDir || "./", "iflsconfig.json");

const configJson = (() =>
  fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : {})() as ConfigV1;

const config: ConfigV1 = {
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

const openAi = new OpenAiInstance(apiKey);

parseDir(
  openAi,
  config.srcDir,
  config.outDir,
  config.exclude,
  args.ignoreCache,
  args.dontCache
);
