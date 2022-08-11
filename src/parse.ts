import fs from "fs";
import Debug from "debug";
import { OpenAiInstance } from "./openAi";
const debug = Debug("ifls:parse");
import glob from "glob";
import path from 'path';

export const parseDir = async (
  openAi: OpenAiInstance,
  src: string,
  outDir: string,
  exclude: string[]
) => {
  const files = await new Promise<string[]>((resolve, reject) => {
    glob(`${src}/**/*.ifls`, { ignore: exclude }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

  debug("Files:", files);

  debug(`Parsing src: ${src}, outDir: ${outDir}`);
  makeDir(outDir);
  /* */
  files.forEach(async (file) => {
    debug(`Parsing ${file}`);
    let code = fs.readFileSync(file, "utf8");
    const regex = /((?:\/\*.+?\*\/[\n\s]+?|\/\/.+?\n)*?ifls (.+?));/g;
    const matches = [...code.matchAll(regex)].map(([fullCode, code, func]) => ({
      fullCode,
      code: code.replace(/ifls\s*/g, ""),
      func,
    }));
    debug(`Found ${matches.length} matches`);
    if (matches) {
      const completions = await Promise.all(
        matches.map(async (match) => ({
          ...match,
          resCode: match.func + (await openAi.call(match.code, 100)),
        }))
      );
      while (completions.length > 0) {
        const completion = completions.shift();
        if (completion) {
          debug(`Replacing ${completion.fullCode} with ${completion.resCode}`);
          code = code.replace(completion.fullCode, completion.resCode);
        }
      }
      const location = `${file.substring(0, file.length - 5)}.js`.replace(
        src,
        outDir + "/"
      );
      debug("Writing to:", location);
      makeDir(path.dirname(location));
      fs.writeFileSync(location, code);
      debug(`Wrote to ${location}`);
    }
  });

  function makeDir(dir: string) {
    debug("Making dir at ", dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};
