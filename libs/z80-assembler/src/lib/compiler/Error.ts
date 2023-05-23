import {MatchAttempt, PosInfo, SyntaxErr} from "../grammar/z80";

class CompilationError extends Error {
  constructor(public readonly pos: PosInfo, message: string) {
    super(message);
  }

  override toString() {
    return `Line ${this.pos.line}:${this.pos.offset+1} - Syntax Error - ${this.message}`;
  }

  static formatMatch(match: MatchAttempt) {
    if(match.kind === 'EOF') return " end of code";
    const not = match.negated ? 'not ' : '';
    return ` ${not}${match.literal}`;
  }

  static formatError(err: SyntaxErr): string {
    if(err.expmatches.length === 1) {
      const match = err.expmatches[0];
      const literal = match.kind === 'EOF' ? 'the end of the code' : match.literal;
      return `${match.negated ? 'Does not expect ' : 'Expect '}${literal}`;
    }
    return `Expected one of: ${err.expmatches.map(m => CompilationError.formatMatch(m))}`
  }

  static fromSyntaxErr(e: SyntaxErr): CompilationError {
    return new CompilationError(e.pos, this.formatError(e));
  }

  static fromAny(e: any) {
    if(e instanceof CompilationError) return e;
    if(e instanceof SyntaxErr) return this.fromSyntaxErr(e);
    return new CompilationError({line: 1, offset: 0, overallPos: 0}, e.toString());
  }
}

export {CompilationError};
