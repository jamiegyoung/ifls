import Debug from "debug";
import OpenAI from "openai-api";
const debug = Debug("ifls:openAi");

export class OpenAiInstance {
  api: OpenAI;

  constructor(public apiKey: string) {
    this.api = new OpenAI(apiKey);
  }

  async call(code: string, length: number) {
    debug("making call for:", code);
    const res = await this.api.complete({
      engine: "code-davinci-002",
      prompt: code,
      maxTokens: length,
      // How experimental the model is (not very)
      temperature: 0,
      // How many completions to return
      n: 1,
      stream: false,
      stop: "\n\n",
    });
    debug(`Choices: ${res.data.choices[0].text}`);
    return res.data.choices[0].text;
  }
}
