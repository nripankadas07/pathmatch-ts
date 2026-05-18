/**
 * Public type definitions shared across the `pathmatch` package.
 */

export interface PathMatchOptions {
  /**
   * When `true`, the matcher ignores ASCII case differences.
   * Defaults to `false`.
   */
  readonly caseInsensitive?: boolean;

  /**
   * When `true`, a wildcard (`*`, `?`, `[…]`) at the start of a path
   * component matches a leading dot. Defaults to `false`, matching the
   * common shell behaviour where dotfiles are hidden by default.
   */
  readonly dot?: boolean;
}

export interface PathMatcher {
  /**
   * The original pattern (before brace expansion).
   */
  readonly pattern: string;

  /**
   * Each expansion of the pattern as a regular expression. A path matches
   * the pattern iff it matches at least one of these regexes.
   */
  readonly regexes: readonly RegExp[];

  /**
   * Test whether `path` matches this pattern.
   */
  test(path: string): boolean;
}
