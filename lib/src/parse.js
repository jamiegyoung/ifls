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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDir = void 0;
const fs_1 = __importDefault(require("fs"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("ifls:parse");
const glob_1 = __importDefault(require("glob"));
const parseDir = (openAi, src, outDir, exclude) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield new Promise((resolve, reject) => {
        (0, glob_1.default)(`${src}/**/*.ifls`, { ignore: exclude }, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files);
            }
        });
    });
    debug("Files:", files);
    debug(`Parsing src: ${src}, outDir: ${outDir}`);
    makeDir(outDir);
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        debug(`Parsing ${file}`);
        let code = fs_1.default.readFileSync(file, "utf8");
        const regex = /ifls (.+?)\n/g;
        const matches = [...code.matchAll(regex)].map(([, code]) => code);
        if (matches) {
            const completions = yield Promise.all(matches.map((match) => __awaiter(void 0, void 0, void 0, function* () {
                return match + (yield openAi.call(match, 500));
            })));
            matches.forEach((match) => {
                const completion = completions.shift();
                if (completion) {
                    code = code.replace(`ifls ${match}`, completion);
                }
            });
            const location = `${file.substring(0, file.length - 5)}.js`.replace(src, outDir);
            debug("Writing to:", location);
            fs_1.default.mkdirSync(location.slice(0, outDir.lastIndexOf("/")), {
                recursive: true,
            });
            fs_1.default.writeFileSync(location, code);
        }
    }));
    function makeDir(dir) {
        if (fs_1.default.existsSync(dir)) {
            fs_1.default.rmSync(dir, { recursive: true });
        }
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
exports.parseDir = parseDir;
