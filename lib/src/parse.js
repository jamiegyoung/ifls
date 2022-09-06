"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDir = void 0;
const fs_1 = __importDefault(require("fs"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("ifls:parse");
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const cache_1 = __importDefault(require("./cache"));
const parseDir = (openAi, srcDir, outDir, exclude, ignoreCache, dontCache) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const cache = new cache_1.default("ifls", path_1.default.resolve(`${srcDir}/.ifls.cache`));
    const files = yield new Promise((resolve, reject) => {
        (0, glob_1.default)(`${srcDir}/**/*.ifls`, { ignore: exclude }, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files);
            }
        });
    });
    debug("Files:", files);
    debug(`Parsing srcDir: ${srcDir}, outDir: ${outDir}`);
    makeDir(outDir);
    try {
        for (var files_1 = __asyncValues(files), files_1_1; files_1_1 = yield files_1.next(), !files_1_1.done;) {
            const file = files_1_1.value;
            debug(`Parsing ${file}`);
            let code = fs_1.default.readFileSync(file, "utf8");
            const regex = /((?:\/\*.+?\*\/[\n\s]+?|\/\/.+?\n)*?ifls (.+?));/g;
            const matches = [...code.matchAll(regex)].map(([fullCode, code, func]) => ({
                fullCode,
                code: code.replace(/ifls\s*/g, ""),
                func,
            }));
            debug(`Found ${matches.length} matches`);
            if (matches) {
                const completions = yield Promise.all(matches.map((match) => __awaiter(void 0, void 0, void 0, function* () {
                    if (!ignoreCache) {
                        const cacheRes = cache.getKey(match.fullCode);
                        if (cacheRes) {
                            debug(`Found ${match.func} in cache`);
                            return Object.assign(Object.assign({}, match), { resCode: match.func + cacheRes });
                        }
                    }
                    const openAiRes = yield (yield openAi.call(match.code, 500)).replace(/\n\+/g, "\n");
                    if (!dontCache) {
                        debug(`Adding ${match.func} to cache`);
                        cache.setKey(match.fullCode, openAiRes);
                    }
                    return Object.assign(Object.assign({}, match), { resCode: match.func + openAiRes });
                })));
                while (completions.length > 0) {
                    const completion = completions.shift();
                    if (completion) {
                        debug(`Replacing ${completion.fullCode} with ${completion.resCode}`);
                        code = code.replace(completion.fullCode, completion.resCode);
                    }
                }
                const location = `${file.substring(0, file.length - 5)}.js`.replace(srcDir, outDir + "/");
                debug("Writing to:", location);
                makeDir(path_1.default.dirname(location));
                fs_1.default.writeFileSync(location, code);
                debug(`Wrote to ${location}`);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (files_1_1 && !files_1_1.done && (_a = files_1.return)) yield _a.call(files_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (!dontCache) {
        cache.save();
    }
    function makeDir(dir) {
        debug("Making dir at ", dir);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
});
exports.parseDir = parseDir;
