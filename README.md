# pathmatch-ts

A small, typed glob/path matcher for TypeScript. Brace expansion,
globstar (`**`), character classes, and the standard dot-file rule —
all backed by anchored regular expressions so matching is just
`RegExp.test`.

## Features

- `*`, `?`, `[…]`, `[!…]` / `[^…]` character classes
- `**` globstar — zero or more directory segments
- `{a,b,c}` brace expansion, including nested groups
- Backslash escapes for literal special chars
- Options: `caseInsensitive`, `dot`
- Pre-compiled matchers for repeated use
- Typed throughout (`strict` + `exactOptionalPropertyTypes`)
- 100% statement / branch / function / line coverage

## Install

```bash
npm install pathmatch-ts
```

## Usage

```ts
import { match, compile, escape } from "pathmatch-ts";

match("src/**/*.ts", "src/utils/x.ts");   // true
match("file.{js,ts}", "file.ts");         // true
match("*.txt", ".hidden.txt");            // false (leading dot hidden)
match("*.txt", ".hidden.txt", { dot: true }); // true

// Re-usable matcher — compile once, test many.
const matcher = compile("docs/**/*.md", { caseInsensitive: true });
["docs/readme.md", "docs/a/b.md", "src/x.ts"].filter(matcher.test);
// → ["docs/readme.md", "docs/a/b.md"]

// Escape arbitrary text into a literal pattern.
match(escape("file[1].txt"), "file[1].txt");  // true
```

## API reference

### `match(pattern, path, options?)`

Test whether `path` matches `pattern`. Returns `boolean`. Throws
`TypeError` on non-string input, `PatternError` on invalid pattern.

### `compile(pattern, options?) → PathMatcher`

Compile a pattern once for repeated use. The returned matcher exposes
`pattern`, `regexes` (array of compiled `RegExp` — one per brace
expansion), and `test(path: string): boolean`.

### `expandBraces(pattern) → string[]`

Expand all brace groups into a flat array of alternative patterns.

### `escape(text) → string`

Escape glob meta-characters so the result matches `text` literally.

### `patternToRegex(pattern, options?) → RegExp`

Low-level: compile a single (already brace-expanded) pattern into a
regular expression anchored with `^…$`.

### Options

- `caseInsensitive: boolean` — default `false`.
- `dot: boolean` — default `false`. When `false`, a wildcard at the
  start of a path component does not match a leading dot.

### Errors

- `PathMatchError` — base class.
- `PatternError` — pattern is structurally invalid (carries `.pattern`).

## Running tests

```bash
npm install
npm test               # jest with 100% coverage thresholds
npm run typecheck      # tsc --strict --noEmit
```

## License

MIT — see [LICENSE](LICENSE).
