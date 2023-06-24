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
import {MatchAttempt, SyntaxErr} from "../grammar/z80";
import {Position} from "./Types";

/**
 * A compilation error.
 * Une erreur de compilation.
 */
class CompilationError extends Error {
  /**
   * Constructor.
   * Constructeur.
   * @param position Position (filename, line, offset) where the error occurred.
   *                 Position (fichier, line, décalage) où s'est produite l'erreur.
   * @param message Description of the error.
   *                Description de l'erreur.
   */
  constructor(public readonly position: Position, message: string) {
    super(message);
  }

  /**
   * Format the error.
   * Formate l'erreur.
   */
  override toString() {
    return `File '${this.position.filename}', Line ${this.position.pos.line}:${this.position.pos.offset+1} - ${this.message}`;
  }

  /**
   * Format internal MatchAttempt.
   * Formate le MatchAttempt interne.
   * @param match The MatchAttempt to format.
   *              Le MatchAttempt à formater.
   * @private
   */
  private static formatMatch(match: MatchAttempt) {
    if(match.kind === 'EOF') return " end of code";
    const not = match.negated ? 'not ' : '';
    const literal = match.literal
      // Escaped chars except escaped backslashes.
      // Les caractères échappés sauf la barre oblique inversée.
      .replace(/\\([^\\])/g, '$1')
      // Escaped backslashes.
      // Barres obliques inversées.
      .replace(/\\\\/g, '\\');
    return ` ${not}${literal}`;
  }

  /**
   * Format a syntax error.
   * Formate une erreur de syntaxe.
   * @param err a syntax error.
   *            L'erreur de syntaxe.
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
   * Crée une erreur de compilation depuis une erreur de syntaxe.
   * @param filename Filename where the error occurred.
   *                 Fichier où s'est produite l'erreur.
   * @param e Syntax error.
   *          L'erreur de syntaxe.
   */
  static fromSyntaxErr(filename: string, e: SyntaxErr): CompilationError {
    return new CompilationError({filename: filename, pos: e.pos}, this.formatError(e));
  }

  /**
   * Create a compilation error from different errors.
   * Crée une erreur de compilation depuis différents types d'erreur.
   * @param filename Filename where the error occurred.
   *                 Fichier où s'est produite l'erreur.
   * @param e The error
   *          L'erreur.
   */
  static fromAny(filename: string, e: any) { // eslint-disable-line
    // Already a compilation error? Return it.
    // Déjà une erreur de syntaxe ? On la retourne.
    if(e instanceof CompilationError) return e;
    // A syntax error?
    // Une erreur de syntaxe =
    if(e instanceof SyntaxErr) return this.fromSyntaxErr(filename, e);
    // Something else?
    // Quelque chose d'autre ?
    return new CompilationError({filename: filename, pos: {line: 1, offset: 0, overallPos: 0}}, e.toString());
  }

  /**
   * Check if an error is a compilation error (and cast the error in this case).
   * Vérifie si une erreur est une erreur de compilation (and convertit le type de l'erreur dans ce cas).
   * @param err The error to check.
   *            L'erreur à vérifier.
   */
  static is(err: any): err is CompilationError { // eslint-disable-line
    return (err as CompilationError).position !== undefined;
  }

  /**
   * Check if an error is an array of compilation errors (and cast the type in this case).
   * Vérifie si une erreur est un tableau d'erreurs de compilation (and convertit le type dans ce cas).
   * @param err The error to check.
   *            L'erreur à vérifier.
   */
  static isArray(err: any): err is CompilationError[] { // eslint-disable-line
    const errs = err as CompilationError[];
    return errs.length !== undefined && (errs.length === 0 || errs[0].position !== undefined);
  }
}

export {CompilationError};
