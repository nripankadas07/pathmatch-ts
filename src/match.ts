/**
 * Public entry points: {@link match} and {@link compile}.
 */
import { expandBraces } from "./braces";
import { patternToRegex } from "./compile";
import type { PathMatchOptions, PathMatcher } from "./types";

/**
 * Compile a glob pattern into a reusable matcher. Use this when the same
 * pattern is tested against many paths — avoids re-parsing each call.
 */
export function compile(
  pattern: string,
  options: PathMatchOptions = {},
): PathMatcher {
  if (typeof pattern !== "string") {
    throw new TypeError(
      `compile() expects a string, got ${typeof pattern}`,
    );
  }
  const expansions = expandBraces(pattern);
  const regexes = expansions.map((expanded) =>
    patternToRegex(expanded, options),
  );
  return {
    pattern,
    regexes,
    test(path: string): boolean {
      return testPath(regexes, path);
    },
  };
}

/**
 * Test whether `path` matches `pattern`. For repeated matching against
 * the same pattern, prefer {@link compile} for efficiency.
 */
export function match(
  pattern: string,
  path: string,
  options: PathMatchOptions = {},
): boolean {
  return compile(pattern, options).test(path);
}

function testPath(regexes: readonly RegExp[], path: string): boolean {
  if (typeof path !== "string") {
    throw new TypeError(
      `path must be a string, got ${typeof path}`,
    );
  }
  for (const regex of regexes) {
    regex.lastIndex = 0;
    if (regex.test(path)) {
      return true;
    }
  }
  return false;
}
