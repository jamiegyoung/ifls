import { Args } from "./src/args";

describe("args", () => {
  it("should be able to parse args", () => {
    const args = new Args(["--config", "./lib", "./bin"]);
    expect(args.srcDir).toBe("./bin");
    expect(args.configDir).toBe("./lib");
  });

  it("should be able to parse args without config", () => {
    const args = new Args(["./bin"]);
    expect(args.srcDir).toBe("./bin");
    expect(args.configDir).toBe("./");
  });
});
