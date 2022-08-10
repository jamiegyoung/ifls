export interface Config {
  version: string;
}

export interface ConfigV1 extends Config {
  outDir: string;
  srcDir: string;
  openAIApiKey?: string;
  exclude: string[];
}
