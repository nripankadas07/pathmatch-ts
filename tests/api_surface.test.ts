import * as pathmatch from "../src/index";

describe("api surface", () => {
  it("exports the documented functions", () => {
    expect(typeof pathmatch.match).toBe("function");
    expect(typeof pathmatch.compile).toBe("function");
    expect(typeof pathmatch.expandBraces).toBe("function");
    expect(typeof pathmatch.escape).toBe("function");
    expect(typeof pathmatch.patternToRegex).toBe("function");
  });

  it("exports both error classes", () => {
    expect(typeof pathmatch.PathMatchError).toBe("function");
    expect(typeof pathmatch.PatternError).toBe("function");
  });

  it("PatternError extends PathMatchError extends Error", () => {
    const err = new pathmatch.PatternError("abc", "oops");
    expect(err).toBeInstanceOf(pathmatch.PathMatchError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("PatternError");
    expect(err.pattern).toBe("abc");
  });

  it("plain PathMatchError carries the right name", () => {
    const err = new pathmatch.PathMatchError("hi");
    expect(err.name).toBe("PathMatchError");
    expect(err.message).toBe("hi");
  });
});
