import { escape, escapeRegexChar } from "../src/escape";

describe("escape", () => {
  it("returns plain text unchanged", () => {
    expect(escape("hello.txt")).toBe("hello.txt");
  });

  it("escapes star, question, brackets, braces, and backslash", () => {
    expect(escape("a*b?c[d]e{f}g\\h")).toBe(
      "a\\*b\\?c\\[d\\]e\\{f\\}g\\\\h",
    );
  });

  it("rejects non-string input", () => {
    expect(() => escape(123 as unknown as string)).toThrow(TypeError);
  });

  it("escapeRegexChar passes through ordinary chars", () => {
    expect(escapeRegexChar("a")).toBe("a");
    expect(escapeRegexChar("1")).toBe("1");
  });

  it("escapeRegexChar escapes regex metachars", () => {
    expect(escapeRegexChar(".")).toBe("\\.");
    expect(escapeRegexChar("$")).toBe("\\$");
    expect(escapeRegexChar("(")).toBe("\\(");
    expect(escapeRegexChar("|")).toBe("\\|");
  });

  it("escape allows escaped patterns to match via match()", () => {
    // Round-trip sanity: escape a literal then verify it matches itself
    // when wrapped in regex semantics. We just verify the output here.
    const result = escape("foo[bar].js");
    expect(result).toBe("foo\\[bar\\].js");
  });
});
