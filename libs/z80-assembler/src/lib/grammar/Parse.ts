/**
 * Z80 Assembler in Typescript
 *
 * File:        Parse.ts
 * Description: Fonctions uses by the parser to convert strings
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Assembler Z80 en Typescript
 *
 * Fichier:     Parse.ts
 * Description: Fonctions de conversion de chaines de caractères pour l'analyseur.
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {PosInfo} from "./z80";
import {CompilationError} from "../types/Error";
import {parseData} from '../compiler/Compiler';

/**
 * Parse a number.
 * Analyse un nombre.
 * @param pos Position of the number in the source code.
 *            Position du nombre dans le code source.
 * @param str The characters of the number.
 *            Les caractères du nombre.
 * @param base The base of the number.
 *             La base du nombre.
 * @param nbBytes The number of bytes to represent this number (1 or 2)
 *                Le nombre d'octets pour représenter ce nombre (1 ou 2)
 */
export function parseNumber(pos: PosInfo, str: string, base: number, nbBytes: number): number {
  // Convert the string to a number.
  // Conversion de la chaine en nombre.
  let v = parseInt(str, base);
  if(isNaN(v)) throw new CompilationError(parseData.fileName, pos,
    `Number '${str}' is invalid in base ${base}.`)
  switch(nbBytes) {
    case 1:
      // Must be able to fit this number into 8 bits.
      // On doit pouvoir représenter ce nombre sur 8 bits.
      if(v > 255 || v < -256) throw new CompilationError(parseData.fileName, pos,
        `Number '${str}' does not fit into a byte.`);
      // If negative, take the 2-complement.
      // S'il est négatif, on prend son complément à 2.
      if(v < 0) v = 256 + v;
      break;

    case 2:
      // Must be able to fit this number into 16 bits.
      // On doit pouvoir représenter ce nombre sur 16 bits.
      if(v > 65535 || v < -65536) throw new CompilationError(parseData.fileName, pos,
        `Number '${str}' does not fit into a word.`);
      // If negative, take the 2-complement.
      // S'il est négatif, on prend son complément à 2.
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
 * Analyse un échappement simple, c.-à-d. une barre oblique inversée suivie d'un caractère.
 * @param pos Position of the character in the source code.
 *            Position du caractère dans le code source.
 * @param c The character after the backslash.
 *          Le caractère après la barre oblique inversée.
 */
export function parseSimpleEscape(pos: PosInfo, c: string): number[] {
  switch(c) {
    case '"': return [0x0B];
    default:  throw new CompilationError(parseData.fileName, pos,`Invalid escape: \\${c}`);
  }
}

/**
 * Parse an octal value.
 * Analyse une valeur octale.
 * @param pos Position of the value in the source code.
 *            Position de la valeur dans le code source.
 * @param value The characters representing the value.
 *              Les caractères représentant la valeur.
 */
export function parseOctalEscape(pos: PosInfo, value: string): number[] {
  const v = parseInt(value, 8);
  if(v > 255) throw new CompilationError(parseData.fileName, pos,
    `Number '${value}' in octal escape sequence does not fit into a byte.`);
  return [v];
}

/**
 * Parse a hexadecimal value.
 * Analyse une valeur hexadécimale.
 * @param pos Position of the value in the source code.
 *            Position de la valeur dans le code source.
 * @param value The characters representing the value.
 *              Les caractères représentant la valeur.
 */
export function parseHexadecimalEscape(pos: PosInfo, value: string): number[] {
  const v = parseInt(value, 16);
  if(v > 255) throw new CompilationError(parseData.fileName, pos,
    `Number '${value}' in hexadecimal escape sequence does not fit into a byte.`);
  return [v];
}

/**
 * Map between ASCII and ZX81 characters set.
 * Table de correspondance entre l'ASCII et le jeu de caractères du ZX81.
 */
const zx81chars = new Map<string, number>([
  [' ', 0x00], ['"', 0x0B], ['£', 0x0C], ['$', 0x0D], [':', 0x0E], ['?', 0x0F],
  ['(', 0x10], [')', 0x11], ['>', 0x12], ['<', 0x13], ['=', 0x14], ['+', 0x15], ['-', 0x16], ['*', 0x17],
  ['/', 0x18], [';', 0x19], [',', 0x1A], ['.', 0x1B],
  ['_', 0x80]
]);

/**
 * Parse a ZX81 character written in ASCII.
 * Analyse un caractère ZX81 écrit en ASCII.
 * @param pos Position of the character in the source code.
 *            Position du caractère dans le code source.
 * @param c The ASCII character.
 *          Le caractère ASCII.
 */
export function parseZX81Char(pos: PosInfo, c: string): [number] {
  // Convert capital letters to their ZX81 counterparts.
  // On convertit les lettres capitales en leur correspondance pour le ZX81.
  if(c >= 'A' && c < 'Z') return [c.charCodeAt(0) - 0x41 + 0x26];
  // Convert lowercase letters to their uppercase and inverted ZX81 counterparts.
  // On convertit les lettres capitales en leur correspondance inversée pour le ZX81.
  if(c >= 'a' && c < 'z') return [c.charCodeAt(0) - 0x61 + 0xA6];
  // Convert digits to their ZX81 counterparts.
  // On convertit les chiffres en leur correspondance pour le ZX81.
  if(c >= '0' && c < '9') return [c.charCodeAt(0) - 0x30 + 0x1C];
  // Is it possible to convert this symbol?
  // Est-il possible de convertir ce symbole ?
  if(!zx81chars.has(c)) throw new CompilationError(parseData.fileName, pos,
    `Invalid ZX81 character: ${c}`);
  // eslint-disable-next-line
  return [zx81chars.get(c)!];
}

/**
 * Parse a ZX81 string written in ASCII.
 * Analyse un chaine ZX81 écrit en ASCII.
 * @param pos Position of the string in the source code.
 *            Position de la chaine dans le code source.
 * @param str The ASCII string.
 *            La chaine ASCII.
 */
export function parseZX81String(pos: PosInfo, str: string): number[] {
  // Convert each character.
  // On convertit chaque caractère.
  return [...str].reduce((r: number[], c) => r.concat(parseZX81Char(pos, c)), []);
}
