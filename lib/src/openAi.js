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
exports.OpenAiInstance = void 0;
const debug_1 = __importDefault(require("debug"));
const openai_api_1 = __importDefault(require("openai-api"));
const debug = (0, debug_1.default)("ifls:openAi");
class OpenAiInstance {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.api = new openai_api_1.default(apiKey);
    }
    call(code, length = 20) {
        return __awaiter(this, void 0, void 0, function* () {
            debug("making call for:", code);
            const res = yield this.api.complete({
                engine: "code-davinci-002",
                prompt: code,
                maxTokens: length,
                // How experimental the model is
                temperature: .4,
                // How many completions to return
                n: 1,
                stream: false,
                stop: "\n\n",
            });
            debug(`Response: ${res.data}`);
            debug(`Choices: ${res.data.choices[0].text}`);
            return res.data.choices[0].text;
        });
    }
}
exports.OpenAiInstance = OpenAiInstance;
