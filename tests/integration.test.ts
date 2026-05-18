import { compile, escape, match } from "../src/index";

describe("integration", () => {
  it("filters a list of file paths", () => {
    const files = [
      "src/index.ts",
      "src/utils/helpers.ts",
      "src/utils/helpers.spec.ts",
      "src/main.js",
      "dist/index.js",
      "node_modules/lib/index.js",
    ];
    const matcher = compile("src/**/*.ts");
    const matched = files.filter((file) => matcher.test(file));
    expect(matched).toEqual([
      "src/index.ts",
      "src/utils/helpers.ts",
      "src/utils/helpers.spec.ts",
    ]);
  });

  it("combines braces and globstar", () => {
    const matcher = compile("**/*.{md,txt}");
    expect(matcher.test("README.md")).toBe(true);
    expect(matcher.test("docs/a/b.md")).toBe(true);
    expect(matcher.test("notes.txt")).toBe(true);
    expect(matcher.test("code.ts")).toBe(false);
  });

  it("escape() produces a literal pattern", () => {
    const literal = "file[1].txt";
    const pattern = escape(literal);
    expect(match(pattern, literal)).toBe(true);
    // The bare literal would otherwise be treated as a class
    expect(() => match(literal, literal)).not.toThrow();
  });

  it("dot files are hidden by default", () => {
    expect(match("**/*.json", "a/b/.config.json")).toBe(false);
    expect(match("**/*.json", "a/b/c.json")).toBe(true);
  });

  it("dot: true reveals hidden files", () => {
    expect(match("**/*.json", "a/b/.config.json", { dot: true })).toBe(true);
  });

  it("caseInsensitive option works through compile", () => {
    const matcher = compile("**/README.md", { caseInsensitive: true });
    expect(matcher.test("docs/readme.md")).toBe(true);
    expect(matcher.test("docs/README.MD")).toBe(true);
  });

  it("escape() throws on non-string", () => {
    expect(() => escape(null as unknown as string)).toThrow(TypeError);
  });
});
