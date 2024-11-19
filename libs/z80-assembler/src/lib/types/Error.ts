/**
 * Z80 Assembler in Typescript
 *
 * File:        Error.ts
 * Description: Compilation errors
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

import {MatchAttempt, SyntaxErr} from "../grammar/z80";
import {Position} from "./Types";

/**
 * A compilation error.
 */
class CompilationError extends Error {
  /**
   * Constructor.
   * @param position Position (filename, line, offset) where the error occurred.
   * @param message Description of the error.
   */
  constructor(public readonly position: Position, message: string) {
    super(message);
  }

  /**
   * Format the error.
   */
  override toString() {
    return `File '${this.position.filename}', Line ${this.position.pos.line}:${this.position.pos.offset+1} - ${this.message}`;
  }

  /**
   * Format internal MatchAttempt.
   * @param match The MatchAttempt to format.
   * @private
   */
  private static formatMatch(match: MatchAttempt) {
    if(match.kind === 'EOF') return " end of code";
    const not = match.negated ? 'not ' : '';
    const literal = match.literal
      // Escaped chars except escaped backslashes.
      .replace(/\\([^\\])/g, '$1')
      // Escaped backslashes.
      .replace(/\\\\/g, '\\');
    return ` ${not}${literal}`;
  }

  /**
   * Format a syntax error.
   * @param err a syntax error.
   * @private
   */
  private static formatError(err: SyntaxErr): string {
    if(err.expmatches.length === 1) {
      const match = err.expmatches[0];
      const literal = match.kind === 'EOF' ? 'the end of the code' : match.literal;
      return `${match.negated ? 'Does not expect ' : 'Expect '}${literal}`;
    }
    return `Syntax error, expected one of: ${err.expmatches.map(m => CompilationError.formatMatch(m))}`
  }

  /**
   * Create a compilation error from a syntax error.
   * @param filename Filename where the error occurred.
   * @param e Syntax error.
   */
  static fromSyntaxErr(filename: string, e: SyntaxErr): CompilationError {
    return new CompilationError({filename: filename, pos: e.pos}, this.formatError(e));
  }

  /**
   * Create a compilation error from different errors.
   * @param filename Filename where the error occurred.
   * @param e The error
   */
  static fromAny(filename: string, e: any) { // eslint-disable-line
    // Already a compilation error? Return it.
    if(e instanceof CompilationError) return e;
    // A syntax error?
    if(e instanceof SyntaxErr) return this.fromSyntaxErr(filename, e);
    // Something else?
    return new CompilationError({filename: filename, pos: {line: 1, offset: 0, overallPos: 0}}, e.toString());
  }

  /**
   * Check if an error is a compilation error (and cast the error in this case).
   * @param err The error to check.
   */
  static is(err: any): err is CompilationError { // eslint-disable-line
    return (err as CompilationError).position !== undefined;
  }

  /**
   * Check if an error is an array of compilation errors (and cast the type in this case).
   * @param err The error to check.
   */
  static isArray(err: any): err is CompilationError[] { // eslint-disable-line
    const errs = err as CompilationError[];
    return errs.length !== undefined && (errs.length === 0 || errs[0].position !== undefined);
  }
}

export {CompilationError};
