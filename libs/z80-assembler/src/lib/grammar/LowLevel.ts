/**
 * Z80 Assembler in Typescript
 *
 * File:        LoweLevel.ts
 * Description: Low level functions for the parser
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {byte} from "../types/Types";

/**
 * Compute the binary representation of the r argument.
 * @param r The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function r_bits(r: string, offset = 0): byte {
  switch(r.toLowerCase()) {
    case 'b': return 0b000 << offset;
    case 'c': return 0b001 << offset;
    case 'd': return 0b010 << offset;
    case 'e': return 0b011 << offset;
    case 'h': return 0b100 << offset;
    case 'l': return 0b101 << offset;
    case 'a': return 0b111 << offset;
    default: console.log(`Invalid register name: ${r}`); return 0;
  }
}

/**
 * Compute the binary representation of the dd argument.
 * @param dd The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function dd_bits(dd: string, offset = 0): byte {
  switch(dd.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'hl': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${dd}`); return 0;
  }
}

/**
 * Compute the binary representation of the qq argument.
 * @param qq The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function qq_bits(qq: string, offset = 0): byte {
  switch(qq.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'hl': return 0b00000010 << offset;
    case 'af': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${qq}`); return 0;
  }
}

/**
 * Compute the binary representation of the ss argument.
 * @param ss The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function ss_bits(ss: string, offset = 0): byte {
  switch(ss.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'hl': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${ss}`); return 0;
  }
}

/**
 * Compute the binary representation of the pp argument.
 * @param pp The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function pp_bits(pp: string, offset = 0): byte {
  switch(pp.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'ix': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${pp}`); return 0;
  }
}

/**
 * Compute the binary representation of the rr argument.
 * @param rr The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function rr_bits(rr: string, offset = 0): byte {
  switch(rr.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'iy': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${rr}`); return 0;
  }
}

/**
 * Compute the binary representation of the cc argument.
 * @param cc The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function cc_bits(cc: string, offset = 0): byte {
  switch(cc.toLowerCase()) {
    case 'nz': return 0b00000000 << offset;
    case 'z':  return 0b00000001 << offset;
    case 'nc': return 0b00000010 << offset;
    case 'c':  return 0b00000011 << offset;
    case 'po': return 0b00000100 << offset;
    case 'pe': return 0b00000101 << offset;
    case 'p':  return 0b00000110 << offset;
    case 's':
    case 'm':  return 0b00000111 << offset;
    default: console.log(`Invalid jump condition: ${cc}`); return 0;
  }
}

/**
 * Compute the binary representation of the jj argument.
 * @param jj The argument of the opcode
 */
export function jj_bits(jj = ''): byte {
  switch(jj.toLowerCase()) {
    case '':   return 0x18;
    case 'nz': return 0x20;
    case 'z':  return 0x28;
    case 'nc': return 0x30;
    case 'c':  return 0x38;
    default: console.log(`Invalid relative jump condition: ${jj}`); return 0;
  }
}

/**
 * Compute the binary representation of the p argument.
 * @param p The argument of the opcode
 * @param offset The number of bits to shift to the left.
 */
export function p_bits(p: number, offset = 0): byte {
  if(p < 0 || p > 0x38 || p % 8 !== 0)
    console.log(`Invalid argument for RST: ${p}`);
  return (p / 8) << offset;
}

/**
 * Compute the binary representation of the mode argument.
 * @param mode The argument of the opcode
 */
export function imode(mode: string): byte {
  switch (mode) {
    case '0': return 0x46;
    case '1': return 0x56;
    case '2': return 0x5E;
    default: console.log(`Invalid interrupt mode: ${mode}`); return 0;
  }
}
