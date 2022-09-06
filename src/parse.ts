import fs from "fs";
import Debug from "debug";
import { OpenAiInstance } from "./openAi";
const debug = Debug("ifls:parse");
import glob from "glob";
import path from "path";
import flatCache from "flat-cache";

export const parseDir = async (
  openAi: OpenAiInstance,
  srcDir: string,
  outDir: string,
  exclude: string[],
  ignoreCache: boolean,
  dontCache: boolean
) => {
  const cache = flatCache.load("ifls", path.resolve(`${srcDir}/.ifls.cache`));
  const files = await new Promise<string[]>((resolve, reject) => {
    glob(`${srcDir}/**/*.ifls`, { ignore: exclude }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

  debug("Files:", files);

  debug(`Parsing srcDir: ${srcDir}, outDir: ${outDir}`);
  makeDir(outDir);
  files.forEach(async (file) => {
    debug(`Parsing ${file}`);
    let code = fs.readFileSync(file, "utf8");
    const regex = /((?:\/\*.+?\*\/[\n\s]+?|\/\/.+?\n)*?ifls (.+?));/g;
    const matches: {
      fullCode: string;
      code: string;
      func: string;
    }[] = [...code.matchAll(regex)].map(([fullCode, code, func]) => ({
      fullCode,
      code: code.replace(/ifls\s*/g, ""),
      func,
    }));
    debug(`Found ${matches.length} matches`);
    if (matches) {
      const completions = await Promise.all(
        matches.map(async (match) => {
          if (!ignoreCache) {
            const cacheRes = cache.getKey(match.fullCode);
            if (cacheRes) {
              debug(`Found ${match.func} in cache`);
              return { ...match, resCode: match.func + cacheRes };
            }
          }
          const openAiRes = await openAi.call(match.code, 500);
          if (!dontCache) {
            debug(`Adding ${match.func} to cache`);
            cache.setKey(match.fullCode, openAiRes);
          }
          return {
            ...match,
            resCode: match.func + openAiRes,
          };
        })
      );
      while (completions.length > 0) {
        const completion = completions.shift();
        if (completion) {
          debug(`Replacing ${completion.fullCode} with ${completion.resCode}`);
          code = code.replace(completion.fullCode, completion.resCode);
        }
      }
      const location = `${file.substring(0, file.length - 5)}.js`.replace(
        srcDir,
        outDir + "/"
      );
      debug("Writing to:", location);
      makeDir(path.dirname(location));
      fs.writeFileSync(location, code);
      debug(`Wrote to ${location}`);
    }
  });

  if (!dontCache) {
    cache.save();
  }

  function makeDir(dir: string) {
    debug("Making dir at ", dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};
