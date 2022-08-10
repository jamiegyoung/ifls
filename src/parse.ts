import fs from "fs";
import Debug from "debug";
import { OpenAiInstance } from "./openAi";
const debug = Debug("ifls:parse");

export const parseDir = (
  openAi: OpenAiInstance,
  src: string,
  outDir: string
) => {
  const files = fs.readdirSync(src);
  if (!fs.existsSync(outDir)) {
    throw new Error(`Output directory ${outDir} does not exist`);
  }
  files
    .filter((file) => file.endsWith(".ifls"))
    .forEach(async (file) => {
      debug(`Parsing ${file}`);
      let code = fs.readFileSync(`${src}/${file}`, "utf8");
      const regex = /ifls (.+?)\n/g;
      const matches = [...code.matchAll(regex)].map(([, code]) => code);

      if (matches) {
        debug("Match:", matches);
        const completions = await Promise.all(
          matches.map(async (match) => {
            return match + (await openAi.call(match, 500));
          })
        );
        debug("Completions:", completions);
        matches.forEach((match) => {
          const completion = completions.shift();
          if (completion) {
            code = code.replace(`ifls ${match}`, completion);
          }
        });
        debug("Code:", code);
        fs.writeFileSync(
          `${outDir}/${file.substring(0, file.length - 5)}.js`,
          code
        );
      }
    });
};
