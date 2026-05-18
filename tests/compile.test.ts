import { patternToRegex } from "../src/compile";
import { PatternError } from "../src/errors";

describe("patternToRegex", () => {
  describe("simple patterns", () => {
    it("matches literal text", () => {
      expect(patternToRegex("file.txt").test("file.txt")).toBe(true);
    });

    it("anchors at both ends", () => {
      expect(patternToRegex("file").test("file.txt")).toBe(false);
    });

    it("rejects non-string input", () => {
      expect(() =>
        patternToRegex(123 as unknown as string),
      ).toThrow(TypeError);
    });
  });

  describe("star", () => {
    it("matches any non-slash run", () => {
      expect(patternToRegex("*.txt").test("file.txt")).toBe(true);
    });

    it("does not cross slashes", () => {
      expect(patternToRegex("*.txt").test("dir/file.txt")).toBe(false);
    });

    it("hides leading dot by default", () => {
      expect(patternToRegex("*.txt").test(".hidden.txt")).toBe(false);
    });

    it("matches leading dot with dot: true", () => {
      expect(
        patternToRegex("*.txt", { dot: true }).test(".hidden.txt"),
      ).toBe(true);
    });

    it("allows explicit dot literal", () => {
      expect(patternToRegex(".env.*").test(".env.local")).toBe(true);
    });
  });

  describe("question mark", () => {
    it("matches exactly one character", () => {
      expect(patternToRegex("a?c").test("abc")).toBe(true);
      expect(patternToRegex("a?c").test("ac")).toBe(false);
    });

    it("does not match slash", () => {
      expect(patternToRegex("a?c").test("a/c")).toBe(false);
    });
  });

  describe("character classes", () => {
    it("matches a positive class", () => {
      expect(patternToRegex("[abc].txt").test("a.txt")).toBe(true);
      expect(patternToRegex("[abc].txt").test("d.txt")).toBe(false);
    });

    it("matches a range", () => {
      expect(patternToRegex("[a-z].txt").test("m.txt")).toBe(true);
      expect(patternToRegex("[a-z].txt").test("M.txt")).toBe(false);
    });

    it("negation with !", () => {
      expect(patternToRegex("[!abc].txt").test("d.txt")).toBe(true);
      expect(patternToRegex("[!abc].txt").test("a.txt")).toBe(false);
    });

    it("negation with ^", () => {
      expect(patternToRegex("[^abc].txt").test("d.txt")).toBe(true);
    });

    it("rejects unclosed bracket", () => {
      expect(() => patternToRegex("[abc.txt")).toThrow(PatternError);
    });

    it("rejects empty class", () => {
      expect(() => patternToRegex("[].txt")).toThrow(PatternError);
    });
  });

  describe("globstar", () => {
    it("matches zero or more directories", () => {
      const re = patternToRegex("a/**/b");
      expect(re.test("a/b")).toBe(true);
      expect(re.test("a/x/b")).toBe(true);
      expect(re.test("a/x/y/b")).toBe(true);
    });

    it("matches at the end", () => {
      const re = patternToRegex("docs/**");
      expect(re.test("docs/a")).toBe(true);
      expect(re.test("docs/a/b")).toBe(true);
      expect(re.test("docs")).toBe(false);
    });

    it("matches at the start", () => {
      const re = patternToRegex("**/file.txt");
      expect(re.test("file.txt")).toBe(true);
      expect(re.test("a/file.txt")).toBe(true);
      expect(re.test("a/b/file.txt")).toBe(true);
    });

    it("treats ** mid-segment like *", () => {
      // "a**b" — the ** is not at segment start, falls back to two stars
      const re = patternToRegex("a**b");
      expect(re.test("aXXb")).toBe(true);
      expect(re.test("a/b")).toBe(false);
    });

    it("treats ** followed by non-slash at segment start as star+star", () => {
      // "**a" — at segment start but third char isn't '/' so the globstar
      // form doesn't apply; the two stars compile as ordinary wildcards.
      const re = patternToRegex("**a");
      expect(re.test("xxa")).toBe(true);
      expect(re.test("a")).toBe(true);
      expect(re.test("x/a")).toBe(false);
    });
  });

  describe("escapes", () => {
    it("treats escaped special chars as literals", () => {
      expect(patternToRegex("\\*.txt").test("*.txt")).toBe(true);
      expect(patternToRegex("\\*.txt").test("file.txt")).toBe(false);
    });

    it("rejects trailing backslash", () => {
      expect(() => patternToRegex("abc\\")).toThrow(PatternError);
    });
  });

  describe("options", () => {
    it("case-insensitive matches mixed case", () => {
      const re = patternToRegex("FILE.TXT", { caseInsensitive: true });
      expect(re.test("file.txt")).toBe(true);
    });

    it("default is case-sensitive", () => {
      expect(patternToRegex("FILE.TXT").test("file.txt")).toBe(false);
    });
  });
});
