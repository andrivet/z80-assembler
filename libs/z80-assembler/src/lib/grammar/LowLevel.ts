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

export function dd_bits(rr: string, offset = 0): byte {
  switch(rr.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'hl': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${rr}`); return 0;
  }
}

export function qq_bits(rr: string, offset = 0): byte {
  switch(rr.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'hl': return 0b00000010 << offset;
    case 'af': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${rr}`); return 0;
  }
}

export function ss_bits(rr: string, offset = 0): byte {
  switch(rr.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'hl': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${rr}`); return 0;
  }
}

export function pp_bits(rr: string, offset = 0): byte {
  switch(rr.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'ix': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${rr}`); return 0;
  }
}

export function rr_bits(rr: string, offset = 0): byte {
  switch(rr.toLowerCase()) {
    case 'bc': return 0b00000000 << offset;
    case 'de': return 0b00000001 << offset;
    case 'iy': return 0b00000010 << offset;
    case 'sp': return 0b00000011 << offset;
    default: console.log(`Invalid register name: ${rr}`); return 0;
  }
}

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


export function p_bits(p: number, offset = 0): byte {
  if(p < 0 || p > 0x38 || p % 8 !== 0)
    console.log(`Invalid argument for RST: ${p}`);
  return (p / 8) << offset;
}

export function imode(mode: string): byte {
  switch (mode) {
    case '0': return 0x46;
    case '1': return 0x56;
    case '2': return 0x5E;
    default: console.log(`Invalid interrupt mode: ${mode}`); return 0;
  }
}
