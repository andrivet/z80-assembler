/**
 * Z80 Assembler in Typescript
 *
 * File:        Error.ts
 * Description: Compilation errors
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {MatchAttempt, PosInfo, SyntaxErr} from "../grammar/z80";

class CompilationError extends Error {
  constructor(public readonly filename: string, public readonly pos: PosInfo, message: string) {
    super(message);
  }

  override toString() {
    return `File '${this.filename}', Line ${this.pos.line}:${this.pos.offset+1} - ${this.message}`;
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
    return `Syntax error, expected one of: ${err.expmatches.map(m => CompilationError.formatMatch(m))}`
  }

  static fromSyntaxErr(filename: string, e: SyntaxErr): CompilationError {
    return new CompilationError(filename, e.pos, this.formatError(e));
  }

  static fromAny(filename: string, e: any) { // eslint-disable-line
    if(e instanceof CompilationError) return e;
    if(e instanceof SyntaxErr) return this.fromSyntaxErr(filename, e);
    return new CompilationError(filename, {line: 1, offset: 0, overallPos: 0}, e.toString());
  }

  static is(err: any): err is CompilationError { // eslint-disable-line
    return (err as CompilationError).filename !== undefined;
  }

  static isArray(err: any): err is CompilationError[] { // eslint-disable-line
    const errs = err as CompilationError[];
    return errs.length !== undefined && (errs.length === 0 || errs[0].filename !== undefined);
  }
}

export {CompilationError};
