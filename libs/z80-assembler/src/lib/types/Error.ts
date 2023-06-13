/**
 * Z80 Assembler in Typescript
 *
 * File:        Error.ts
 * Description: Compilation errors
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Assembler Z80 en Typescript
 *
 * Fichier:     Error.ts
 * Description: Erreurs de compilation
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {MatchAttempt, PosInfo, SyntaxErr} from "../grammar/z80";

/**
 * A compilation error.
 */
class CompilationError extends Error {
  /**
   * Constructor.
   * @param filename Filename where the error occurred.
   * @param pos Position (line, offset) here the error occurred.
   * @param message Description of the error.
   */
  constructor(public readonly filename: string, public readonly pos: PosInfo, message: string) {
    super(message);
  }

  /**
   * Format the error.
   */
  override toString() {
    return `File '${this.filename}', Line ${this.pos.line}:${this.pos.offset+1} - ${this.message}`;
  }

  /**
   * Format internal MatchAttempt
   * @param match The MatchAttempt to format.
   * @private
   */
  private static formatMatch(match: MatchAttempt) {
    if(match.kind === 'EOF') return " end of code";
    const not = match.negated ? 'not ' : '';
    const literal = match.literal
      .replace(/\\([^\\])/g, '$1') // Escaped chars except escaped backslashes
      .replace(/\\\\/g, '\\'); // Escaped backslashes
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
    return new CompilationError(filename, e.pos, this.formatError(e));
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
    return new CompilationError(filename, {line: 1, offset: 0, overallPos: 0}, e.toString());
  }

  /**
   * Check if an error is a compilation error (and cast the result in this case)
   * @param err
   */
  static is(err: any): err is CompilationError { // eslint-disable-line
    return (err as CompilationError).filename !== undefined;
  }

  /**
   * Check if an error is an array of compilation errors (and cast the result in this case)
   * @param err
   */
  static isArray(err: any): err is CompilationError[] { // eslint-disable-line
    const errs = err as CompilationError[];
    return errs.length !== undefined && (errs.length === 0 || errs[0].filename !== undefined);
  }
}

export {CompilationError};
