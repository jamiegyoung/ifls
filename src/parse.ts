import fs from "fs";
import Debug from "debug";
import { OpenAiInstance } from "./openAi";
const debug = Debug("ifls:parse");
import glob from "glob";

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
          resCode: match.func + (await openAi.call(match.code, 500)),
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
      fs.mkdirSync(location.slice(0, outDir.lastIndexOf("/")), {
        recursive: true,
      });
      fs.writeFileSync(location, code);
    }
  });

  function makeDir(dir: string) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  }
};
