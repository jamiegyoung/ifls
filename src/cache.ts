import fs from "fs";
import path from "path";
import Debug from "debug";

const debug = Debug("ifls:cache");

export default class Cache {
  name: any;
  cacheDir: any;
  cache: { [key: string]: string } = {};
  previousCache: { [key: string]: string } = {};

  constructor(name: string, cacheDir?: fs.PathLike) {
    this.name = name;
    debug(`Instantiating cache ${name}`);
    if (!cacheDir) {
      this.cacheDir = "./";
      return;
    }

    this.cacheDir = cacheDir;
    debug(`Using cacheDir ${cacheDir}`);
    this.readSavedCache();
  }

  private getCacheFilePath() {
    return path.join(this.cacheDir, `${this.name}.json`);
  }

  readSavedCache() {
    const cachePath = this.getCacheFilePath();
    if (!fs.existsSync(cachePath)) {
      debug(`Cache file ${cachePath} not found when reading saved cache`);
      return;
    }
    debug(`Reading cache file ${cachePath}`);
    const cacheJson = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    this.previousCache = cacheJson;
  }

  makeCacheFile() {
    if (!fs.existsSync(this.cacheDir)) {
      debug(`Cache directory ${this.cacheDir} not found, recursively creating`);
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    const cacheFilePath = this.getCacheFilePath();
    if (!fs.existsSync(cacheFilePath)) {
      debug(`Creating cache file ${cacheFilePath}`);
      fs.writeFileSync(cacheFilePath, "{}");
    }
  }

  setKey(key: string, value: string) {
    debug(`Setting cache key ${key} to ${value}`);
    this.cache[key] = value;
    debug(`Cache is now ${JSON.stringify(this.cache)}`);
  }

  getKey(key: string) {
    debug(`Getting cache key ${key}`);
    if (this.previousCache[key]) {
      debug(`Found previous cache for ${key}`);
      this.cache[key] = this.previousCache[key];
      delete this.previousCache[key];
    }
    return this.cache[key];
  }

  save() {
    const cacheFilePath = this.getCacheFilePath();
    if (!fs.existsSync(cacheFilePath)) {
      debug(`Cache file ${cacheFilePath} not found when saving cache`);
      this.makeCacheFile();
    }
    debug(`Saving cache file ${cacheFilePath}`);
    fs.writeFileSync(cacheFilePath, JSON.stringify(this.cache));
  }
}
