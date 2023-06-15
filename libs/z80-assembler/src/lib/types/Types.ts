/**
 * Z80 Assembler in Typescript
 *
 * File:        Types.ts
 * Description: Common types
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Assembler Z80 en Typescript
 *
 * Fichier:     Types.ts
 * Description: Types partagés
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 *
 */
import {Line} from "../grammar/z80";
import {CompilationError} from "./Error";


/**
 * A byte is represented by a number.
 * Un octet est représenté par un nombre.
 */
type byte = number;

/**
 * An array of bytes.
 * Un tableau d'octets.
 */
type bytes = byte[];

/**
 * An address is either a number (known) or null (unknown).
 * Une adresse est soit un nombre (connue) soit nulle (inconnue).
 */
type Address = number | null;

/**
 * Information about lines.
 * Informations à propos de lignes.
 */
interface LinesInfo {
  // An array of lines (AST).
  // Un tableau de lignes.
  lines: Line[];
  // A filename associated with this lines.
  // Un fichier associé avec ces lignes.
  filename: string;
}

/**
 * The result of a compilation.
 * Le résultat d'une compilation.
 */
interface CompilationInfo {
  // The name of the output (output directive).
  // Le nom de la sortie (directive output).
  outputName: string;
  // The bytes, result of the compilation.
  // Les octets, résultat de la compilation.
  bytes: bytes;
  // The Source Level Debugging data.
  // Les informations de debug (SLD)
  sld: string;
  // The compilation errors.
  // Les erreurs de compilation.
  errs: CompilationError[];
}

export {byte, bytes, Address, LinesInfo, CompilationInfo}
