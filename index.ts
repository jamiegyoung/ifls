import Debug from "debug";
import fs, { PathLike } from "fs";
import { Args } from "./src/args";
import { parseDir } from "./src/parse";
import { OpenAiInstance } from "./src/openAi";
import { ConfigV1 } from "./src/types";
import path from "path";
const debug = Debug("ifls:index");

const [, , ...givenArgs] = process.argv;

const args = new Args(givenArgs);
debug("Args:", args);

const getDirOrFilePath = (
  givenPath = "./",
  name: string,
  fallbackLocalDir: boolean
): string | undefined => {
  if (givenPath) {
    const givenPathStats = fs.statSync(givenPath);
    const concactedPath = path.join(givenPath, name);
    if (givenPathStats.isDirectory() && fs.existsSync(concactedPath)) {
      return concactedPath;
    }
    if (givenPathStats.isFile() && fs.existsSync(givenPath)) {
      return givenPath;
    }
    // if the given path is neither a file nor directory, try and find it in the current working directory
    const localPath = path.join("./", name);
    if (fs.existsSync(localPath) && fallbackLocalDir) {
      return localPath;
    }
  }
};

const configPath = getDirOrFilePath(args.config, "iflsconfig.json", true);

const configJson = (() =>
  configPath
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
