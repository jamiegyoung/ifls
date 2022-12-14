import { Args } from "./args";

describe("args", () => {
  it("should be able to parse args", () => {
    const args = new Args(["--config", "./lib", "./bin"]);
    expect(args.srcDir).toBe("./bin");
    expect(args.config).toBe("./lib");
  });

  it("should be able to parse args without config", () => {
    const args = new Args(["./bin"]);
    expect(args.srcDir).toBe("./bin");
    expect(args.config).toBe("./");
  });
});
