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
const parseDir = (openAi, src, outDir) => {
    const files = fs_1.default.readdirSync(src);
    if (fs_1.default.existsSync(outDir)) {
        fs_1.default.rmSync(outDir, { recursive: true });
    }
    fs_1.default.mkdirSync(outDir);
    files
        .filter((file) => fs_1.default.statSync(`${src}/${file}`).isDirectory())
        .forEach((dir) => {
        debug(`Recursing into ${dir}`);
        (0, exports.parseDir)(openAi, `${src}/${dir}`, `${outDir}/${dir}`);
    });
    files
        .filter((file) => file.endsWith(".ifls"))
        .forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        debug(`Parsing ${file}`);
        let code = fs_1.default.readFileSync(`${src}/${file}`, "utf8");
        const regex = /ifls (.+?)\n/g;
        const matches = [...code.matchAll(regex)].map(([, code]) => code);
        if (matches) {
            debug("Match:", matches);
            const completions = yield Promise.all(matches.map((match) => __awaiter(void 0, void 0, void 0, function* () {
                return match + (yield openAi.call(match, 500));
            })));
            debug("Completions:", completions);
            matches.forEach((match) => {
                const completion = completions.shift();
                if (completion) {
                    code = code.replace(`ifls ${match}`, completion);
                }
            });
            debug("Code:", code);
            fs_1.default.writeFileSync(`${outDir}/${file.substring(0, file.length - 5)}.js`, code);
        }
    }));
};
exports.parseDir = parseDir;
