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
