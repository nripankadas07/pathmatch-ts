import { expandBraces } from "../src/braces";
import { PatternError } from "../src/errors";

describe("expandBraces", () => {
  describe("no expansion", () => {
    it("returns the input when no braces", () => {
      expect(expandBraces("plain.txt")).toEqual(["plain.txt"]);
    });

    it("returns one entry for empty string", () => {
      expect(expandBraces("")).toEqual([""]);
    });
  });

  describe("flat groups", () => {
    it("expands a single group", () => {
      expect(expandBraces("file.{js,ts}")).toEqual([
        "file.js",
        "file.ts",
      ]);
    });

    it("expands a group at the start", () => {
      expect(expandBraces("{a,b}c")).toEqual(["ac", "bc"]);
    });

    it("expands two adjacent groups", () => {
      expect(expandBraces("{a,b}{1,2}")).toEqual([
        "a1",
        "a2",
        "b1",
        "b2",
      ]);
    });

    it("handles three alternatives", () => {
      expect(expandBraces("x.{a,b,c}")).toEqual(["x.a", "x.b", "x.c"]);
    });
  });

  describe("nested groups", () => {
    it("expands a one-level nesting", () => {
      expect(expandBraces("{a,{b,c}}")).toEqual(["a", "b", "c"]);
    });

    it("expands prefix + nested", () => {
      expect(expandBraces("x{1,{2,3}}y")).toEqual([
        "x1y",
        "x2y",
        "x3y",
      ]);
    });
  });

  describe("escapes", () => {
    it("treats escaped braces as literals", () => {
      const result = expandBraces("a\\{b,c\\}");
      expect(result).toEqual(["a\\{b,c\\}"]);
    });

    it("escapes survive the expansion", () => {
      expect(expandBraces("{a,\\,}")).toEqual(["a", "\\,"]);
    });
  });

  describe("errors", () => {
    it("rejects unmatched opening brace", () => {
      expect(() => expandBraces("{a,b")).toThrow(PatternError);
    });

    it("rejects unmatched closing brace at top level", () => {
      expect(() => expandBraces("a}b")).toThrow(PatternError);
    });

    it("rejects non-string input", () => {
      expect(() => expandBraces(123 as unknown as string)).toThrow(TypeError);
    });

    it("rejects excessive nesting", () => {
      const open = "{".repeat(20);
      const close = "}".repeat(20);
      expect(() => expandBraces(`${open}a${close}`)).toThrow(PatternError);
    });
  });
});
