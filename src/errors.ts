/**
 * Error tree for the `pathmatch` package. All errors raised by the public
 * API extend {@link PathMatchError}, so callers can catch one class.
 */

export class PathMatchError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "PathMatchError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PatternError extends PathMatchError {
  public readonly pattern: string;

  public constructor(pattern: string, detail: string) {
    super(`Invalid glob pattern: ${JSON.stringify(pattern)} (${detail})`);
    this.pattern = pattern;
    this.name = "PatternError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
