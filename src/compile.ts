/**
 * Glob → regular expression compiler.
 *
 * Recognised tokens (with the segment-level dot rule applied at the start
 * of each path component when {@link PathMatchOptions.dot} is `false`):
 *
 * - `*`   – any run of characters except `/`
 * - `?`   – exactly one non-`/` character
 * - `**`  – zero or more `/`-delimited segments (when a whole segment)
 * - `[…]` – character class, with `!`/`^` for negation and `a-z` ranges
 * - `\x`  – literal `x` (escape)
 *
 * Unknown / unbalanced constructs raise {@link PatternError}.
 */
import { PatternError } from "./errors";
import { escapeRegexChar } from "./escape";
import type { PathMatchOptions } from "./types";

interface CompileState {
  readonly pattern: string;
  index: number;
  out: string;
  atSegmentStart: boolean;
}

/**
 * Compile a single (already brace-expanded) pattern into a regular
 * expression that the matcher anchors with `^…$`.
 */
export function patternToRegex(
  pattern: string,
  options: PathMatchOptions = {},
): RegExp {
  if (typeof pattern !== "string") {
    throw new TypeError(
      `patternToRegex() expects a string, got ${typeof pattern}`,
    );
  }
  const state: CompileState = {
    pattern,
    index: 0,
    out: "^",
    atSegmentStart: true,
  };
  while (state.index < pattern.length) {
    compileNext(state, options);
  }
  state.out += "$";
  const flags = options.caseInsensitive === true ? "i" : "";
  return new RegExp(state.out, flags);
}

function compileNext(state: CompileState, options: PathMatchOptions): void {
  if (consumeGlobstar(state)) {
    return;
  }
  const char = state.pattern[state.index] as string;
  if (dispatchToken(char, state, options)) {
    return;
  }
  appendLiteralChar(state, char);
}

function dispatchToken(
  char: string,
  state: CompileState,
  options: PathMatchOptions,
): boolean {
  if (char === "\\") {
    consumeEscape(state);
    return true;
  }
  if (char === "*") {
    appendStar(state, options);
    return true;
  }
  if (char === "?") {
    appendQuestion(state, options);
    return true;
  }
  if (char === "[") {
    appendCharClass(state, options);
    return true;
  }
  if (char === "/") {
    appendSlash(state);
    return true;
  }
  return false;
}

function appendSlash(state: CompileState): void {
  state.out += "/";
  state.atSegmentStart = true;
  state.index += 1;
}

function appendLiteralChar(state: CompileState, char: string): void {
  state.out += escapeRegexChar(char);
  state.atSegmentStart = false;
  state.index += 1;
}

function consumeGlobstar(state: CompileState): boolean {
  if (!state.atSegmentStart) {
    return false;
  }
  if (state.pattern.slice(state.index, state.index + 2) !== "**") {
    return false;
  }
  const after = state.pattern[state.index + 2];
  if (after !== undefined && after !== "/") {
    return false;
  }
  if (after === "/") {
    state.out += "(?:.*/)?";
    state.index += 3;
    state.atSegmentStart = true;
  } else {
    state.out += ".*";
    state.index += 2;
    state.atSegmentStart = false;
  }
  return true;
}

function consumeEscape(state: CompileState): void {
  if (state.index + 1 >= state.pattern.length) {
    throw new PatternError(
      state.pattern,
      "trailing backslash",
    );
  }
  state.out += escapeRegexChar(state.pattern[state.index + 1] as string);
  state.atSegmentStart = false;
  state.index += 2;
}

function appendStar(state: CompileState, options: PathMatchOptions): void {
  applyDotGuard(state, options);
  state.out += "[^/]*";
  state.atSegmentStart = false;
  state.index += 1;
}

function appendQuestion(
  state: CompileState,
  options: PathMatchOptions,
): void {
  applyDotGuard(state, options);
  state.out += "[^/]";
  state.atSegmentStart = false;
  state.index += 1;
}

function applyDotGuard(
  state: CompileState,
  options: PathMatchOptions,
): void {
  if (state.atSegmentStart && options.dot !== true) {
    state.out += "(?!\\.)";
  }
}

function appendCharClass(
  state: CompileState,
  options: PathMatchOptions,
): void {
  const end = state.pattern.indexOf("]", state.index + 1);
  if (end === -1) {
    throw new PatternError(state.pattern, "unclosed '['");
  }
  const inner = state.pattern.slice(state.index + 1, end);
  applyDotGuard(state, options);
  state.out += compileCharClass(inner, state.pattern);
  state.atSegmentStart = false;
  state.index = end + 1;
}

function compileCharClass(inner: string, pattern: string): string {
  if (inner.length === 0) {
    throw new PatternError(pattern, "empty character class");
  }
  const negated = inner.startsWith("!") || inner.startsWith("^");
  const body = negated ? inner.slice(1) : inner;
  const escaped = body
    .replace(/\\/g, "\\\\")
    .replace(/\^/g, "\\^")
    .replace(/]/g, "\\]");
  const prefix = negated ? "[^/" : "[";
  return `${prefix}${escaped}]`;
}
