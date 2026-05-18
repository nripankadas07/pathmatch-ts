/**
 * Brace-expansion: `{a,b,c}` → `["a", "b", "c"]`, including nested groups.
 *
 * The expansion is multiplicative across multiple groups, so
 * `a{b,c}{1,2}` produces `["ab1", "ab2", "ac1", "ac2"]`.
 *
 * Escaped braces (`\{`, `\}`) and unmatched braces are treated as literals.
 */
import { PatternError } from "./errors";

const MAX_DEPTH = 16;

interface ParseResult {
  readonly alternatives: readonly string[];
  readonly nextIndex: number;
}

/**
 * Expand all brace groups in *pattern* into a list of alternative patterns.
 * The result always contains at least one entry — when no braces are
 * present the original pattern is returned as the single entry.
 */
export function expandBraces(pattern: string): string[] {
  if (typeof pattern !== "string") {
    throw new TypeError(
      `expandBraces() expects a string, got ${typeof pattern}`,
    );
  }
  const result = parseSequence(pattern, 0, /* depth */ 0, /* inGroup */ false);
  if (result.nextIndex !== pattern.length) {
    throw new PatternError(pattern, "unmatched '}' at top level");
  }
  return [...result.alternatives];
}

function parseSequence(
  pattern: string,
  start: number,
  depth: number,
  inGroup: boolean,
): ParseResult {
  let acc: string[] = [""];
  let index = start;
  while (index < pattern.length) {
    const char = pattern[index] as string;
    if (char === "\\" && index + 1 < pattern.length) {
      acc = appendLiteral(acc, char + (pattern[index + 1] as string));
      index += 2;
      continue;
    }
    if (char === "{") {
      const group = parseGroup(pattern, index, depth + 1);
      acc = combine(acc, group.alternatives);
      index = group.nextIndex;
      continue;
    }
    if (char === "}" || (char === "," && inGroup)) {
      break;
    }
    acc = appendLiteral(acc, char);
    index += 1;
  }
  return { alternatives: acc, nextIndex: index };
}

function parseGroup(
  pattern: string,
  start: number,
  depth: number,
): ParseResult {
  if (depth > MAX_DEPTH) {
    throw new PatternError(pattern, "brace nesting too deep");
  }
  const alternatives: string[] = [];
  let index = start + 1;
  while (index < pattern.length) {
    const child = parseSequence(pattern, index, depth, /* inGroup */ true);
    alternatives.push(...child.alternatives);
    index = child.nextIndex;
    const sentinel = pattern[index];
    if (sentinel === "}") {
      return { alternatives, nextIndex: index + 1 };
    }
    if (sentinel === ",") {
      index += 1;
      continue;
    }
    // sentinel is undefined (end of input) or any other char.
    throw new PatternError(pattern, "unclosed '{'");
  }
  /* istanbul ignore next: while-guard makes this unreachable, but TS
     requires a return path. */
  throw new PatternError(pattern, "unclosed '{'");
}

function appendLiteral(acc: string[], literal: string): string[] {
  return acc.map((item) => item + literal);
}

function combine(left: string[], right: readonly string[]): string[] {
  const out: string[] = [];
  for (const a of left) {
    for (const b of right) {
      out.push(a + b);
    }
  }
  return out;
}
