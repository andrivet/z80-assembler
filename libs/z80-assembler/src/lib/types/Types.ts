/**
 * Z80 Assembler in Typescript
 *
 * File:        Types.ts
 * Description: Common types
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Line} from "../grammar/z80";
import {CompilationError} from "./Error";

type byte = number;
type bytes = byte[];
type Address = number | null;

interface LinesInfo {
  lines: Line[];
  filename: string;
}

interface CompilationInfo {
  outputName: string;
  outputSld: boolean;
  bytes: bytes;
  sld: string; // Source Level Debugging data
  errs: CompilationError[];
}

export {byte, bytes, Address, LinesInfo, CompilationInfo}
