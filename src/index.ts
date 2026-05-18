/**
 * pathmatch — typed path/glob matcher with brace expansion and globstar.
 *
 * @example
 * ```ts
 * import { match, compile } from "pathmatch";
 *
 * match("src/**​/*.ts", "src/utils/x.ts");      // true
 * match("file.{js,ts}", "file.ts");            // true
 *
 * const matcher = compile("docs/**​/*.md");
 * ["docs/readme.md", "docs/a/b.md"].filter(matcher.test);
 * ```
 */
export { expandBraces } from "./braces";
export { patternToRegex } from "./compile";
export { escape } from "./escape";
export { PathMatchError, PatternError } from "./errors";
export { compile, match } from "./match";
export type { PathMatchOptions, PathMatcher } from "./types";
