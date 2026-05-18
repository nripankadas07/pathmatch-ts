import { compile, match } from "../src/match";

describe("match (high-level)", () => {
  describe("literal patterns", () => {
    it("matches identical strings", () => {
      expect(match("hello", "hello")).toBe(true);
    });

    it("rejects different strings", () => {
      expect(match("hello", "world")).toBe(false);
    });

    it("rejects non-string path", () => {
      expect(() => match("hello", 42 as unknown as string)).toThrow(
        TypeError,
      );
    });

    it("rejects non-string pattern", () => {
      expect(() =>
        match(42 as unknown as string, "hello"),
      ).toThrow(TypeError);
    });
  });

  describe("brace expansion", () => {
    it("matches one alternative", () => {
      expect(match("file.{js,ts}", "file.js")).toBe(true);
      expect(match("file.{js,ts}", "file.ts")).toBe(true);
    });

    it("rejects non-alternative", () => {
      expect(match("file.{js,ts}", "file.py")).toBe(false);
    });

    it("nested braces", () => {
      expect(match("file.{js,{ts,tsx}}", "file.tsx")).toBe(true);
    });
  });

  describe("nested directories", () => {
    it("globstar matches several levels", () => {
      expect(match("src/**/*.ts", "src/a.ts")).toBe(true);
      expect(match("src/**/*.ts", "src/a/b/c.ts")).toBe(true);
      expect(match("src/**/*.ts", "lib/a.ts")).toBe(false);
    });
  });

  describe("options propagation", () => {
    it("caseInsensitive propagates", () => {
      expect(match("README", "readme", { caseInsensitive: true })).toBe(true);
      expect(match("README", "readme")).toBe(false);
    });

    it("dot propagates", () => {
      expect(match("*.config", ".prettierrc.config", { dot: true })).toBe(
        true,
      );
      expect(match("*.config", ".prettierrc.config")).toBe(false);
    });
  });
});

describe("compile (reusable matcher)", () => {
  it("returns a matcher object with the pattern", () => {
    const matcher = compile("*.txt");
    expect(matcher.pattern).toBe("*.txt");
    expect(matcher.regexes.length).toBe(1);
  });

  it("matcher.test can be used many times", () => {
    const matcher = compile("*.{js,ts}");
    expect(matcher.test("a.js")).toBe(true);
    expect(matcher.test("a.ts")).toBe(true);
    expect(matcher.test("a.py")).toBe(false);
  });

  it("braces produce multiple regexes", () => {
    const matcher = compile("file.{js,ts,tsx}");
    expect(matcher.regexes.length).toBe(3);
  });

  it("rejects non-string pattern", () => {
    expect(() => compile(123 as unknown as string)).toThrow(TypeError);
  });
});
