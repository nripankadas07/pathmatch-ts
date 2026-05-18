/**
 * String-escaping helpers used by the compiler and exposed publicly so
 * callers can build literal patterns by hand.
 */

const REGEX_META_CHARS = new Set("\\^$.*+?()[]{}|/");
const GLOB_META = /[\\*?[\]{}]/g;

/**
 * Escape a string so that {@link match} treats every character as a
 * literal. Useful when interpolating untrusted input into a pattern.
 */
export function escape(text: string): string {
  if (typeof text !== "string") {
    throw new TypeError(
      `escape() expects a string, got ${typeof text}`,
    );
  }
  return text.replace(GLOB_META, "\\$&");
}

/**
 * Internal helper: escape a single character so it is a literal in a
 * regular expression.
 */
export function escapeRegexChar(char: string): string {
  if (REGEX_META_CHARS.has(char)) {
    return `\\${char}`;
  }
  return char;
}
