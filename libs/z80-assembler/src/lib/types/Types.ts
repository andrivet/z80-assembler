/**
 * Z80 Assembler in Typescript
 *
 * File:        Types.ts
 * Description: Common types
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

import {Line, PosInfo} from "../grammar/z80";
import {CompilationError} from "./Error";


/**
 * A byte is represented by a number.
 */
type byte = number;

/**
 * An array of bytes.
 */
type bytes = byte[];

/**
 * An address is either a number (known) or null (unknown).
 */
type Address = number | null;

/**
 * Information about lines.
 */
interface LinesInfo {
  // An array of lines (AST).
  lines: Line[];
  // A filename associated with this lines.
  filename: string;
}

/**
 * The result of a compilation.
 */
interface CompilationInfo {
  // The name of the output (output directive).
  outputName: string;
  // The bytes, result of the compilation.
  bytes: bytes;
  // The Source Level Debugging data.
  sld: string;
  // The compilation errors.
  errs: CompilationError[];
}

/**
 * Position in a source file.
 */
interface Position {
  filename: string;
  pos: PosInfo;
}

export {byte, bytes, Address, LinesInfo, CompilationInfo, Position}
