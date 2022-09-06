"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("ifls:cache");
class Cache {
    constructor(name, cacheDir) {
        this.cache = {};
        this.previousCache = {};
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
    getCacheFilePath() {
        return path_1.default.join(this.cacheDir, `${this.name}.json`);
    }
    readSavedCache() {
        const cachePath = this.getCacheFilePath();
        if (!fs_1.default.existsSync(cachePath)) {
            debug(`Cache file ${cachePath} not found when reading saved cache`);
            return;
        }
        debug(`Reading cache file ${cachePath}`);
        const cacheJson = JSON.parse(fs_1.default.readFileSync(cachePath, "utf8"));
        this.previousCache = cacheJson;
    }
    makeCacheFile() {
        if (!fs_1.default.existsSync(this.cacheDir)) {
            debug(`Cache directory ${this.cacheDir} not found, recursively creating`);
            fs_1.default.mkdirSync(this.cacheDir, { recursive: true });
        }
        const cacheFilePath = this.getCacheFilePath();
        if (!fs_1.default.existsSync(cacheFilePath)) {
            debug(`Creating cache file ${cacheFilePath}`);
            fs_1.default.writeFileSync(cacheFilePath, "{}");
        }
    }
    setKey(key, value) {
        debug(`Setting cache key ${key} to ${value}`);
        this.cache[key] = value;
        debug(`Cache is now ${JSON.stringify(this.cache)}`);
    }
    getKey(key) {
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
        if (!fs_1.default.existsSync(cacheFilePath)) {
            debug(`Cache file ${cacheFilePath} not found when saving cache`);
            this.makeCacheFile();
        }
        debug(`Saving cache file ${cacheFilePath}`);
        fs_1.default.writeFileSync(cacheFilePath, JSON.stringify(this.cache));
    }
}
exports.default = Cache;
