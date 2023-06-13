import {PosInfo} from "./z80";
import {CompilationError} from "../types/Error";
import {parseData} from '../compiler/Compiler';

/**
 * Parse a number.
 * @param pos Position of the number in the source code.
 * @param str The characters of the number.
 * @param base The base of the number.
 * @param nbBytes The number of bytes to represent this number (1 or 2)
 */
export function parseNumber(pos: PosInfo, str: string, base: number, nbBytes: number): number {
  let v = parseInt(str, base);
  if(isNaN(v)) throw new CompilationError(parseData.fileName, pos,
    `Number '${str}' is invalid in base ${base}.`)
  switch(nbBytes) {
    case 1:
      if(v > 255 || v < -256) throw new CompilationError(parseData.fileName, pos,
        `Number '${str}' does not fit into a byte.`);
      if(v < 0) v = 256 + v;
      break;

    case 2:
      if(v > 65535 || v < -65536) throw new CompilationError(parseData.fileName, pos,
        `Number '${str}' does not fit into a word.`);
      if(v < 0) v = 65536 + v;
      break;

    default:
      throw new CompilationError(parseData.fileName, pos,
        `Invalid number of bytes (${nbBytes})`);
  }

  return v;
}

/**
 * Parse a simple escape, i.e. a backslash followed by a character.
 * @param pos Position of the character in the source code.
 * @param c The character after the backslash.
 */
export function parseSimpleEscape(pos: PosInfo, c: string): number[] {
  switch(c) {
    case '"': return [0x0B];
    default:  throw new CompilationError(parseData.fileName, pos,`Invalid escape: \\${c}`);
  }
}

/**
 * Parse an octal value.
 * @param pos Position of the value in the source code.
 * @param value The characters representing the value.
 */
export function parseOctalEscape(pos: PosInfo, value: string): number[] {
  const v = parseInt(value, 8);
  if(v > 255) throw new CompilationError(parseData.fileName, pos,
    `Number '${value}' in octal escape sequence does not fit into a byte.`);
  return [v];
}

/**
 * Parse a hexadecimal value.
 * @param pos Position of the value in the source code.
 * @param value The characters representing the value.
 */
export function parseHexadecimalEscape(pos: PosInfo, value: string): number[] {
  const v = parseInt(value, 16);
  if(v > 255) throw new CompilationError(parseData.fileName, pos,
    `Number '${value}' in hexadecimal escape sequence does not fit into a byte.`);
  return [v];
}

/**
 * Map between ASCII and ZX81 characters set
 */
const zx81chars = new Map<string, number>([
  [' ', 0x00], ['"', 0x0B], ['£', 0x0C], ['$', 0x0D], [':', 0x0E], ['?', 0x0F],
  ['(', 0x10], [')', 0x11], ['>', 0x12], ['<', 0x13], ['=', 0x14], ['+', 0x15], ['-', 0x16], ['*', 0x17],
  ['/', 0x18], [';', 0x19], [',', 0x1A], ['.', 0x1B],
  ['_', 0x80]
]);

/**
 * Parse a ZX81 character written in ASCII.
 * @param pos Position of the character in the source code.
 * @param c The ASCII character.
 */
export function parseZX81Char(pos: PosInfo, c: string): number {
  // Convert capital letters to their ZX81 counterparts.
  if(c >= 'A' && c < 'Z') return c.charCodeAt(0) - 0x41 + 0x26;
  // Convert lowercase letters to their uppercase and inverted ZX81 counterparts.
  if(c >= 'a' && c < 'z') return  c.charCodeAt(0) - 0x61 + 0xA6;
  // Convert digits to their ZX81 counterparts.
  if(c >= '0' && c < '9') return c.charCodeAt(0) - 0x30 + 0x1C;
  // Is it possible to convert this symbol?
  if(!zx81chars.has(c)) throw new CompilationError(parseData.fileName, pos,
    `Invalid ZX81 character: ${c}`);
  // eslint-disable-next-line
  return zx81chars.get(c)!; // Return the ZX81 counterparts
}

/**
 * Parse a ZX81 string written in ASCII.
 * @param pos Position of the string in the source code.
 * @param str The ASCII string.
 */
export function parseZX81String(pos: PosInfo, str: string): number[] {
  // Convert each character
  return [...str].map(c => parseZX81Char(pos, c));
}
