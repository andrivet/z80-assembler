/**
 * Z80 Assembler in Typescript
 *
 * File:        Compile.tests.ts
 * Description: Tests of the compiler
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

import {compile as rawCompile} from "./Compiler";
import {expect} from "vitest";

function compileCode(code: string) {
  const info = rawCompile('test.asm', code, () => '');
  expect(info.errs[0]?.toString()).toBeUndefined();
  return info.bytes;
}

function compileCodes(codes: {filename: string, code: string}[]) {
  const info = rawCompile(codes[0].filename, codes[0].code, (filename) =>
    codes.find(c => c.filename === filename)?.code ?? '');
  expect(info.errs[0]?.toString()).toBeUndefined();
  return info.bytes;
}

function compileWithError(code: string) {
  const info = rawCompile('test.asm', code, () => '');
  expect(info.errs[0]?.toString()).toBeDefined();
}

function compileWithSld(code: string) {
  const info = rawCompile('test.asm', code, () => '');
  expect(info.sld).toBeDefined();
  return {bytes: info.bytes, sld: info.sld};
}

// -------------------------------------------------------
// Numbers
// -------------------------------------------------------

test("Loading decimal", () => {
  const bytes = compileCode(' ld a, 123');
  expect(bytes).toEqual([0x3e, 0x7B]);
});

test("Loading positive decimal", () => {
  const bytes = compileCode(' ld a, +123');
  expect(bytes).toEqual([0x3e, 0x7B]);
});

test("Loading negative decimal", () => {
  const bytes = compileCode(' ld a, -123');
  expect(bytes).toEqual([0x3e, 0x85]);
});

test("Loading hexadecimal with $", () => {
  const bytes = compileCode(' ld a, $55');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with #", () => {
  const bytes = compileCode(' ld a, #55');
  expect(bytes).toEqual([0x3e, 0x55]);
});


test("Loading hexadecimal with 0x", () => {
  const bytes = compileCode(' ld a, 0x55');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with 0X", () => {
  const bytes = compileCode(' ld a, 0X55');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with h", () => {
  const bytes = compileCode(' ld a, 55h');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with H", () => {
  const bytes = compileCode(' ld a, 55H');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with only letters", () => {
  const bytes = compileCode(' ld a, abh');
  expect(bytes).toEqual([0x3e, 0xab]);
});

test("Loading hexadecimal with letters prefixed with 0", () => {
  const bytes = compileCode(' ld a, 0abh');
  expect(bytes).toEqual([0x3e, 0xab]);
});

test("Loading hexadecimal with mix of cases", () => {
  const bytes = compileCode(' ld a, Abh');
  expect(bytes).toEqual([0x3e, 0xab]);
});

test("Loading binary with 0b", () => {
  const bytes = compileCode(' ld a, 0b10101010');
  expect(bytes).toEqual([0x3e, 0xAA]);
});

test("Loading binary with 0B", () => {
  const bytes = compileCode(' ld a, 0B10101010');
  expect(bytes).toEqual([0x3e, 0xAA]);
});

test("Loading binary with b suffix", () => {
  const bytes = compileCode(' ld a, 10101010b');
  expect(bytes).toEqual([0x3e, 0xAA]);
});

test("Loading binary with B suffix", () => {
  const bytes = compileCode(' ld a, 10101010B');
  expect(bytes).toEqual([0x3e, 0xAA]);
});


test("Loading binary with %", () => {
  const bytes = compileCode(' ld a, %10101010');
  expect(bytes).toEqual([0x3e, 0xAA]);
});

test("Loading octal with 0q", () => {
  const bytes = compileCode(' ld a, 0q125');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with 0o", () => {
  const bytes = compileCode(' ld a, 0o125');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with 0O", () => {
  const bytes = compileCode(' ld a, 0O125');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with q", () => {
  const bytes = compileCode(' ld a, 125q');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with Q", () => {
  const bytes = compileCode(' ld a, 125Q');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with o", () => {
  const bytes = compileCode(' ld a, 125o');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with O", () => {
  const bytes = compileCode(' ld a, 125O');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading label with colon", () => {
  const bytes = compileCode('ld a, 1\nlabel1:\nld a, label1');
  expect(bytes).toEqual([0x3e, 0x01, 0x3e, 0x02]);
});

test("Loading label without colon", () => {
  const bytes = compileCode('ld a, 1\nlabel1\nld a, label1');
  expect(bytes).toEqual([0x3e, 0x01, 0x3e, 0x02]);
});

// "chances" starts wich "ch", that cam be confused with C in hexadecimal
test("Loading ambiguous label", () => {
  const bytes = compileCode('chances eq 0x44\nld a, chances');
  expect(bytes).toEqual([0x3e, 0x44]);
});

// -------------------------------------------------------
// Expressions
// -------------------------------------------------------

test("Expression unary +", () => {
  const bytes = compileCode('LD A, +$55');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Expression unary +", () => {
  const bytes = compileCode('LD A, -$55');
  expect(bytes).toEqual([0x3E, 0xAB]);
});

test("Expression binary +", () => {
  const bytes = compileCode('LD A, $55 + 2');
  expect(bytes).toEqual([0x3E, 0x57]);
});

test("Expression binary -", () => {
  const bytes = compileCode('LD A, $55 - 2');
  expect(bytes).toEqual([0x3E, 0x53]);
});

test("Expression *", () => {
  const bytes = compileCode('LD A, $55 * 2');
  expect(bytes).toEqual([0x3E, 0xAA]);
});

test("Expression /", () => {
  const bytes = compileCode('LD A, $55 / 2');
  expect(bytes).toEqual([0x3E, 0x2A]);
});

test("Expression %", () => {
  const bytes = compileCode('LD A, $55 % 2');
  expect(bytes).toEqual([0x3E, 0x01]);
});

test("Expression <<", () => {
  const bytes = compileCode('LD A, $55 << 1');
  expect(bytes).toEqual([0x3E, 0xAA]);
});

test("Expression <<", () => {
  const bytes = compileCode('LD A, $55 >> 4');
  expect(bytes).toEqual([0x3E, 0x05]);
});

test("Expression AND &", () => {
  const bytes = compileCode('LD A, $55 & 0x06');
  expect(bytes).toEqual([0x3E, 0x04]);
});

test("Expression XOR ^", () => {
  const bytes = compileCode('LD A, $55 ^ 0xFA');
  expect(bytes).toEqual([0x3E, 0xAF]);
});

test("Expression OR |", () => {
  const bytes = compileCode('LD A, $55 | 0xAA');
  expect(bytes).toEqual([0x3E, 0xFF]);
});

test("Expression with parenthesis at the beginning", () => {
  const bytes = compileCode('LD A, ($55 + 2) % 28');
  expect(bytes).toEqual([0x3E, 0x03]);
});

test("Expression with parenthesis at the end", () => {
  const bytes = compileCode('LD A, 2 * ($55 + 2)');
  expect(bytes).toEqual([0x3E, 0xAE]);
});

test("Expression with parenthesis int the middle", () => {
  const bytes = compileCode('LD A, 2 * ($55 + 2) % 28');
  expect(bytes).toEqual([0x3E, 0x06]);
});

test("Expression with multiple parenthesis", () => {
  const bytes = compileCode('LD A, 2 * ($55 + ($44 - $42)) % 28');
  expect(bytes).toEqual([0x3E, 0x06]);
});

test("Expression with (left) additive associativity", () => {
  const bytes = compileCode('LD A, 10 - 4 - 2 - 1');
  expect(bytes).toEqual([0x3E, 0x03]);
});

test("Expression with (left) additive associativity and different operations", () => {
  const bytes = compileCode('LD A, 42 + 3 + 1 - 4');
  expect(bytes).toEqual([0x3E, 42]);
});

test("Expression with multiplication, subtraction, division and a label", () => {
  const bytes = compileCode('label1 equ 8\nLD A, 42 * 5 - label1 / 2');
  expect(bytes).toEqual([0x3E, 206]);
});

test("Expression with (left) multiplicative associativity", () => {
  const bytes = compileCode('LD A, 20 / 2 / 5');
  expect(bytes).toEqual([0x3E, 0x02]);
});

// -------------------------------------------------------
// Instructions
// -------------------------------------------------------

test("Instruction LD r, r'", () => {
  const bytes = compileCode('LD A, B');
  expect(bytes).toEqual([0x78]);
});

test("Instruction LD r, (HL)", () => {
  const bytes = compileCode('LD B, (HL)');
  expect(bytes).toEqual([0x46]);
});

test("Instruction LD r, (HL) with E", () => {
  const bytes = compileCode('LD E, (HL)');
  expect(bytes).toEqual([0x5E]);
});

test("Instruction LD r, (IX+d)", () => {
  const bytes = compileCode('LD B, (IX+3)');
  expect(bytes).toEqual([0xDD, 0x46, 0x03]);
});

test("Instruction LD r, (IX+d) with negative d", () => {
  const bytes = compileCode('LD B, (IX-3)');
  expect(bytes).toEqual([0xDD, 0x46, 0xFD]);
});

test("Instruction LD r, (IX+d) with no d", () => {
  const bytes = compileCode('LD B, (IX)');
  expect(bytes).toEqual([0xDD, 0x46, 0x00]);
});

test("Instruction LD r, (IY+d)", () => {
  const bytes = compileCode('LD B, (IY+3)');
  expect(bytes).toEqual([0xFD, 0x46, 0x03]);
});

test("Instruction LD r, (IY+d)", () => {
  const bytes = compileCode('LD B, (IY-3)');
  expect(bytes).toEqual([0xFD, 0x46, 0xFD]);
});

test("Instruction LD r, (IY)", () => {
  const bytes = compileCode('LD B, (IY)');
  expect(bytes).toEqual([0xFD, 0x46, 0x00]);
});

test("Instruction LD r, n with label", () => {
  const bytes = compileCode('LD A, label1\nlabel1:');
  expect(bytes).toEqual([0x3E, 0x02]);
});

test("Instruction LD (HL), r", () => {
  const bytes = compileCode('LD (HL), B');
  expect(bytes).toEqual([0x70]);
});

test("Instruction LD (HL), r", () => {
  const bytes = compileCode('LD (HL), B');
  expect(bytes).toEqual([0x70]);
});

test("Instruction LD (IX+d), r", () => {
  const bytes = compileCode('LD (IX+5), B');
  expect(bytes).toEqual([0xDD, 0x70, 0x05]);
});

test("Instruction LD (IX+d), r", () => {
  const bytes = compileCode('LD (IY+5), B');
  expect(bytes).toEqual([0xFD, 0x70, 0x05]);
});

test("Instruction LD (HL), n", () => {
  const bytes = compileCode('LD (HL), 0x55');
  expect(bytes).toEqual([0x36, 0x55]);
});

test("Instruction LD (HL), n with expression", () => {
  const bytes = compileCode('LD (HL), 0 + (0x55 + 2) % 2');
  expect(bytes).toEqual([0x36, 0x01]);
});

test("Instruction LD (IX+d), n", () => {
  const bytes = compileCode('LD (IX+3), 0x55');
  expect(bytes).toEqual([0xDD, 0x36, 3, 0x55]);
});

test("Instruction LD (IY+d), n", () => {
  const bytes = compileCode('LD (IY+3), 0x55');
  expect(bytes).toEqual([0xFD, 0x36, 3, 0x55]);
});

test("Instruction LD (IX), n", () => {
  const bytes = compileCode('LD (IX), 0x55');
  expect(bytes).toEqual([0xDD, 0x36, 0, 0x55]);
});

test("Instruction LD (IY), n", () => {
  const bytes = compileCode('LD (IY), 0x55');
  expect(bytes).toEqual([0xFD, 0x36, 0, 0x55]);
});

test("Instruction LD A, (BC)", () => {
  const bytes = compileCode('LD A, (BC)');
  expect(bytes).toEqual([0x0A]);
});

test("Instruction LD A, (DE)", () => {
  const bytes = compileCode('LD A, (DE)');
  expect(bytes).toEqual([0x1A]);
});

test("Instruction LD A, (nn)", () => {
  const bytes = compileCode('LD A, (0x1234)');
  expect(bytes).toEqual([0x3A, 0x34, 0x12]);
});

test("Instruction LD A, (label)", () => {
  const bytes = compileCode('CHANCES EQ 0x44\nLD A, (CHANCES)');
  expect(bytes).toEqual([0x3A, 0x44, 0x00]);
});

test("Instruction LD A, (hex) with ambiguity", () => {
  const bytes = compileCode('CH EQ 0x44\nLD A, (CH)');
  expect(bytes).toEqual([0x3A, 0x0C, 0x00]);
});

test("Instruction LD (BC), A", () => {
  const bytes = compileCode('LD (BC), A');
  expect(bytes).toEqual([0x02]);
});

test("Instruction LD (DE), A", () => {
  const bytes = compileCode('LD (DE), A');
  expect(bytes).toEqual([0x12]);
});

test("Instruction LD (nn), A", () => {
  const bytes = compileCode('LD (0x1234), A');
  expect(bytes).toEqual([0x32, 0x34, 0x12]);
});

test("Instruction LD (nn), A with Expression", () => {
  const bytes = compileCode('LD (0x1234 + 4), A');
  expect(bytes).toEqual([0x32, 0x38, 0x12]);
});

test("Instruction LD A, I", () => {
  const bytes = compileCode('LD A, I');
  expect(bytes).toEqual([0xED, 0x57]);
});

test("Instruction LD A, R", () => {
  const bytes = compileCode('LD A, R');
  expect(bytes).toEqual([0xED, 0x5F]);
});

test("Instruction LD I, A", () => {
  const bytes = compileCode('LD I, A');
  expect(bytes).toEqual([0xED, 0x47]);
});

test("Instruction LD R, A", () => {
  const bytes = compileCode('LD R, A');
  expect(bytes).toEqual([0xED, 0x4F]);
});

test("Instruction LD r, n", () => {
  const bytes = compileCode('LD A, $55');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Instruction LD r, n with E", () => {
  const bytes = compileCode('LD E, $55');
  expect(bytes).toEqual([0x1E, 0x55]);
});


test("Instruction LD dd, nn", () => {
  const bytes = compileCode('LD BC, $55');
  expect(bytes).toEqual([0x01, 0x55, 0x00]);
});

test("Instruction LD dd, nn with Expression", () => {
  const bytes = compileCode('LD BC, $55 + 2');
  expect(bytes).toEqual([0x01, 0x57, 0x00]);
});

test("Instruction LD IX, nn", () => {
  const bytes = compileCode('LD IX, $55');
  expect(bytes).toEqual([0xDD, 0x21, 0x55, 0x00]);
});

test("Instruction LD IX, nn with Expression", () => {
  const bytes = compileCode('LD IX, $55 + 2');
  expect(bytes).toEqual([0xDD, 0x21, 0x57, 0x00]);
});

test("Instruction LD IY, nn", () => {
  const bytes = compileCode('LD IY, $55');
  expect(bytes).toEqual([0xFD, 0x21, 0x55, 0x00]);
});

test("Instruction LD IY, nn with Expression", () => {
  const bytes = compileCode('LD IY, $55 + 2');
  expect(bytes).toEqual([0xFD, 0x21, 0x57, 0x00]);
});

test("Instruction LD IX, (nn)", () => {
  const bytes = compileCode('LD IX, ($5544)');
  expect(bytes).toEqual([0xDD, 0x2A, 0x44, 0x55]);
});

test("Instruction LD IX, (nn) with Expression", () => {
  const bytes = compileCode('LD IX, ($5544 + 2)');
  expect(bytes).toEqual([0xDD, 0x2A, 0x46, 0x55]);
});

test("Instruction LD IY, (nn)", () => {
  const bytes = compileCode('LD IY, ($5555)');
  expect(bytes).toEqual([0xFD, 0x2A, 0x55, 0x55]);
});

test("Instruction LD IY, (nn) with Expression", () => {
  const bytes = compileCode('LD IY, ($5544 + 2)');
  expect(bytes).toEqual([0xFD, 0x2A, 0x46, 0x55]);
});

test("Instruction LD (nn), HL", () => {
  const bytes = compileCode('LD ($5544), HL');
  expect(bytes).toEqual([0x22, 0x44, 0x55]);
});

test("Instruction LD (nn), HL with Expression", () => {
  const bytes = compileCode('LD ($5544 + 2), HL');
  expect(bytes).toEqual([0x22, 0x46, 0x55]);
});

test("Instruction LD (nn), dd", () => {
  const bytes = compileCode('LD ($5544), BC');
  expect(bytes).toEqual([0xED, 0x43, 0x44, 0x55]);
});

test("Instruction LD (nn), dd with Expression", () => {
  const bytes = compileCode('LD ($5544+2), BC');
  expect(bytes).toEqual([0xED, 0x43, 0x46, 0x55]);
});

test("Instruction LD (nn), IX", () => {
  const bytes = compileCode('LD ($5544), IX');
  expect(bytes).toEqual([0xDD, 0x22, 0x44, 0x55]);
});

test("Instruction LD (nn), IY", () => {
  const bytes = compileCode('LD ($5544), IY');
  expect(bytes).toEqual([0xFD, 0x22, 0x44, 0x55]);
});

test("Instruction LD SP, HL", () => {
  const bytes = compileCode('LD SP, HL');
  expect(bytes).toEqual([0xF9]);
});

test("Instruction LD SP, IX", () => {
  const bytes = compileCode('LD SP, IX');
  expect(bytes).toEqual([0xDD, 0xF9]);
});

test("Instruction LD SP, IY", () => {
  const bytes = compileCode('LD SP, IY');
  expect(bytes).toEqual([0xFD, 0xF9]);
});

test("Instruction PUSH qq", () => {
  const bytes = compileCode('PUSH HL');
  expect(bytes).toEqual([0xE5]);
});

test("Instruction PUSH IX", () => {
  const bytes = compileCode('PUSH IX');
  expect(bytes).toEqual([0xDD, 0xE5]);
});

test("Instruction PUSH IY", () => {
  const bytes = compileCode('PUSH IY');
  expect(bytes).toEqual([0xFD, 0xE5]);
});

test("Instruction POP qq", () => {
  const bytes = compileCode('POP HL');
  expect(bytes).toEqual([0xE1]);
});

test("Instruction POP IX", () => {
  const bytes = compileCode('POP IX');
  expect(bytes).toEqual([0xDD, 0xE1]);
});

test("Instruction POP IY", () => {
  const bytes = compileCode('POP IY');
  expect(bytes).toEqual([0xFD, 0xE1]);
});

test("Instruction EX DE, HL", () => {
  const bytes = compileCode('EX DE, HL');
  expect(bytes).toEqual([0xEB]);
});

test("Instruction EX AF, AF'", () => {
  const bytes = compileCode('EX AF, AF\'');
  expect(bytes).toEqual([0x08]);
});

test("Instruction EXX", () => {
  const bytes = compileCode('EXX');
  expect(bytes).toEqual([0xD9]);
});

test("Instruction EX (SP), HL", () => {
  const bytes = compileCode('EX (SP), HL');
  expect(bytes).toEqual([0xE3]);
});

test("Instruction EX (SP), IX", () => {
  const bytes = compileCode('EX (SP), IX');
  expect(bytes).toEqual([0xDD, 0xE3]);
});

test("Instruction EX (SP), IY", () => {
  const bytes = compileCode('EX (SP), IY');
  expect(bytes).toEqual([0xFD, 0xE3]);
});

test("Instruction LDI", () => {
  const bytes = compileCode('LDI');
  expect(bytes).toEqual([0xED, 0xA0]);
});

test("Instruction LDIR", () => {
  const bytes = compileCode('LDIR');
  expect(bytes).toEqual([0xED, 0xB0]);
});

test("Instruction LDI", () => {
  const bytes = compileCode('LDI');
  expect(bytes).toEqual([0xED, 0xA0]);
});

test("Instruction LDDR", () => {
  const bytes = compileCode('LDDR');
  expect(bytes).toEqual([0xED, 0xB8]);
});

test("Instruction LDD", () => {
  const bytes = compileCode('LDD');
  expect(bytes).toEqual([0xED, 0xA8]);
});

test("Instruction CPIR", () => {
  const bytes = compileCode('CPIR');
  expect(bytes).toEqual([0xED, 0xB1]);
});

test("Instruction CPI", () => {
  const bytes = compileCode('CPI');
  expect(bytes).toEqual([0xED, 0xA1]);
});

test("Instruction CPDR", () => {
  const bytes = compileCode('CPDR');
  expect(bytes).toEqual([0xED, 0xB9]);
});

test("Instruction CPD", () => {
  const bytes = compileCode('CPD');
  expect(bytes).toEqual([0xED, 0xA9]);
});

test("Instruction ADD A, r", () => {
  const bytes = compileCode('ADD A, B');
  expect(bytes).toEqual([0x80]);
});

test("Instruction ADD A, n", () => {
  const bytes = compileCode('ADD A, 0x55');
  expect(bytes).toEqual([0xC6, 0x55]);
});

test("Instruction ADD A, (HL)", () => {
  const bytes = compileCode('ADD A, (HL)');
  expect(bytes).toEqual([0x86]);
});

test("Instruction ADD A, (IX+d)", () => {
  const bytes = compileCode('ADD A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x86, 0x55]);
});

test("Instruction ADD A, (IY+d)", () => {
  const bytes = compileCode('ADD A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x86, 0x55]);
});

test("Instruction ADC A, r", () => {
  const bytes = compileCode('ADC A, B');
  expect(bytes).toEqual([0x88]);
});

test("Instruction ADC A, n", () => {
  const bytes = compileCode('ADC A, 0x55');
  expect(bytes).toEqual([0xCE, 0x55]);
});

test("Instruction ADC A, (HL)", () => {
  const bytes = compileCode('ADC A, (HL)');
  expect(bytes).toEqual([0x8E]);
});

test("Instruction ADC A, (IX+d)", () => {
  const bytes = compileCode('ADC A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x8E, 0x55]);
});

test("Instruction ADC A, (IY+d)", () => {
  const bytes = compileCode('ADC A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x8E, 0x55]);
});

test("Instruction SUB A, r", () => {
  const bytes = compileCode('SUB A, B');
  expect(bytes).toEqual([0x90]);
});

test("Instruction SUB A, n", () => {
  const bytes = compileCode('SUB A, 0x55');
  expect(bytes).toEqual([0xD6, 0x55]);
});

test("Instruction SUB A, (HL)", () => {
  const bytes = compileCode('SUB A, (HL)');
  expect(bytes).toEqual([0x96]);
});

test("Instruction SUB A, (IX+d)", () => {
  const bytes = compileCode('SUB A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x96, 0x55]);
});

test("Instruction SUB A, (IY+d)", () => {
  const bytes = compileCode('SUB A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x96, 0x55]);
});

test("Instruction SBC A, r", () => {
  const bytes = compileCode('SBC A, B');
  expect(bytes).toEqual([0x98]);
});

test("Instruction SBC A, n", () => {
  const bytes = compileCode('SBC A, 0x55');
  expect(bytes).toEqual([0xDE, 0x55]);
});

test("Instruction SBC A, (HL)", () => {
  const bytes = compileCode('SBC A, (HL)');
  expect(bytes).toEqual([0x9E]);
});

test("Instruction SBC A, (IX+d)", () => {
  const bytes = compileCode('SBC A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x9E, 0x55]);
});

test("Instruction SBC A, (IY+d)", () => {
  const bytes = compileCode('SBC A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x9E, 0x55]);
});

test("Instruction AND A, r", () => {
  const bytes = compileCode('AND A, B');
  expect(bytes).toEqual([0xA0]);
});

test("Instruction AND A, n", () => {
  const bytes = compileCode('AND A, 0x55');
  expect(bytes).toEqual([0xE6, 0x55]);
});

test("Instruction AND A, (HL)", () => {
  const bytes = compileCode('AND A, (HL)');
  expect(bytes).toEqual([0xA6]);
});

test("Instruction AND A, (IX+d)", () => {
  const bytes = compileCode('AND A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xA6, 0x55]);
});

test("Instruction AND A, (IY+d)", () => {
  const bytes = compileCode('AND A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xA6, 0x55]);
});

test("Instruction OR A, r", () => {
  const bytes = compileCode('OR A, B');
  expect(bytes).toEqual([0xB0]);
});

test("Instruction OR A, n", () => {
  const bytes = compileCode('OR A, 0x55');
  expect(bytes).toEqual([0xF6, 0x55]);
});

test("Instruction OR A, (HL)", () => {
  const bytes = compileCode('OR A, (HL)');
  expect(bytes).toEqual([0xB6]);
});

test("Instruction OR A, (IX+d)", () => {
  const bytes = compileCode('OR A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xB6, 0x55]);
});

test("Instruction OR A, (IY+d)", () => {
  const bytes = compileCode('OR A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xB6, 0x55]);
});

test("Instruction XOR A, r", () => {
  const bytes = compileCode('XOR A, B');
  expect(bytes).toEqual([0xA8]);
});

test("Instruction XOR A, n", () => {
  const bytes = compileCode('XOR A, 0x55');
  expect(bytes).toEqual([0xEE, 0x55]);
});

test("Instruction XOR A, (HL)", () => {
  const bytes = compileCode('XOR A, (HL)');
  expect(bytes).toEqual([0xAE]);
});

test("Instruction XOR A, (IX+d)", () => {
  const bytes = compileCode('XOR A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xAE, 0x55]);
});

test("Instruction XOR A, (IY+d)", () => {
  const bytes = compileCode('XOR A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xAE, 0x55]);
});

test("Instruction CP A, r", () => {
  const bytes = compileCode('CP A, B');
  expect(bytes).toEqual([0xB8]);
});

test("Instruction CP A, n", () => {
  const bytes = compileCode('CP A, 0x55');
  expect(bytes).toEqual([0xFE, 0x55]);
});

test("Instruction CP A, (HL)", () => {
  const bytes = compileCode('CP A, (HL)');
  expect(bytes).toEqual([0xBE]);
});

test("Instruction CP A, (IX+d)", () => {
  const bytes = compileCode('CP A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xBE, 0x55]);
});

test("Instruction CP A, (IY+d)", () => {
  const bytes = compileCode('CP A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xBE, 0x55]);
});

test("Instruction ADD r", () => {
  const bytes = compileCode('ADD B');
  expect(bytes).toEqual([0x80]);
});

test("Instruction ADD n", () => {
  const bytes = compileCode('ADD 0x55');
  expect(bytes).toEqual([0xC6, 0x55]);
});

test("Instruction ADD (HL)", () => {
  const bytes = compileCode('ADD (HL)');
  expect(bytes).toEqual([0x86]);
});

test("Instruction ADD (IX+d)", () => {
  const bytes = compileCode('ADD (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x86, 0x55]);
});

test("Instruction ADD (IY+d)", () => {
  const bytes = compileCode('ADD (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x86, 0x55]);
});

test("Instruction ADC r", () => {
  const bytes = compileCode('ADC B');
  expect(bytes).toEqual([0x88]);
});

test("Instruction ADC n", () => {
  const bytes = compileCode('ADC 0x55');
  expect(bytes).toEqual([0xCE, 0x55]);
});

test("Instruction ADC (HL)", () => {
  const bytes = compileCode('ADC (HL)');
  expect(bytes).toEqual([0x8E]);
});

test("Instruction ADC (IX+d)", () => {
  const bytes = compileCode('ADC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x8E, 0x55]);
});

test("Instruction ADC (IY+d)", () => {
  const bytes = compileCode('ADC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x8E, 0x55]);
});

test("Instruction SUB r", () => {
  const bytes = compileCode('SUB B');
  expect(bytes).toEqual([0x90]);
});

test("Instruction SUB n", () => {
  const bytes = compileCode('SUB 0x55');
  expect(bytes).toEqual([0xD6, 0x55]);
});

test("Instruction SUB (HL)", () => {
  const bytes = compileCode('SUB (HL)');
  expect(bytes).toEqual([0x96]);
});

test("Instruction SUB (IX+d)", () => {
  const bytes = compileCode('SUB (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x96, 0x55]);
});

test("Instruction SUB (IY+d)", () => {
  const bytes = compileCode('SUB (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x96, 0x55]);
});

test("Instruction SBC r", () => {
  const bytes = compileCode('SBC B');
  expect(bytes).toEqual([0x98]);
});

test("Instruction SBC n", () => {
  const bytes = compileCode('SBC 0x55');
  expect(bytes).toEqual([0xDE, 0x55]);
});

test("Instruction SBC (HL)", () => {
  const bytes = compileCode('SBC (HL)');
  expect(bytes).toEqual([0x9E]);
});

test("Instruction SBC (IX+d)", () => {
  const bytes = compileCode('SBC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x9E, 0x55]);
});

test("Instruction SBC (IY+d)", () => {
  const bytes = compileCode('SBC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x9E, 0x55]);
});

test("Instruction AND r", () => {
  const bytes = compileCode('AND B');
  expect(bytes).toEqual([0xA0]);
});

test("Instruction AND n", () => {
  const bytes = compileCode('AND 0x55');
  expect(bytes).toEqual([0xE6, 0x55]);
});

test("Instruction AND (HL)", () => {
  const bytes = compileCode('AND (HL)');
  expect(bytes).toEqual([0xA6]);
});

test("Instruction AND (IX+d)", () => {
  const bytes = compileCode('AND (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xA6, 0x55]);
});

test("Instruction AND (IY+d)", () => {
  const bytes = compileCode('AND (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xA6, 0x55]);
});

test("Instruction OR r", () => {
  const bytes = compileCode('OR B');
  expect(bytes).toEqual([0xB0]);
});

test("Instruction OR n", () => {
  const bytes = compileCode('OR 0x55');
  expect(bytes).toEqual([0xF6, 0x55]);
});

test("Instruction OR (HL)", () => {
  const bytes = compileCode('OR (HL)');
  expect(bytes).toEqual([0xB6]);
});

test("Instruction OR (IX+d)", () => {
  const bytes = compileCode('OR (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xB6, 0x55]);
});

test("Instruction OR (IY+d)", () => {
  const bytes = compileCode('OR (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xB6, 0x55]);
});

test("Instruction XOR r", () => {
  const bytes = compileCode('XOR B');
  expect(bytes).toEqual([0xA8]);
});

test("Instruction XOR n", () => {
  const bytes = compileCode('XOR 0x55');
  expect(bytes).toEqual([0xEE, 0x55]);
});

test("Instruction XOR (HL)", () => {
  const bytes = compileCode('XOR (HL)');
  expect(bytes).toEqual([0xAE]);
});

test("Instruction XOR (IX+d)", () => {
  const bytes = compileCode('XOR (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xAE, 0x55]);
});

test("Instruction XOR (IY+d)", () => {
  const bytes = compileCode('XOR (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xAE, 0x55]);
});

test("Instruction CP r", () => {
  const bytes = compileCode('CP B');
  expect(bytes).toEqual([0xB8]);
});

test("Instruction CP n", () => {
  const bytes = compileCode('CP 0x55');
  expect(bytes).toEqual([0xFE, 0x55]);
});

test("Instruction CP (HL)", () => {
  const bytes = compileCode('CP (HL)');
  expect(bytes).toEqual([0xBE]);
});

test("Instruction CP (IX+d)", () => {
  const bytes = compileCode('CP (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xBE, 0x55]);
});

test("Instruction CP (IY+d)", () => {
  const bytes = compileCode('CP (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xBE, 0x55]);
});

test("Instruction INC r", () => {
  const bytes = compileCode('INC B');
  expect(bytes).toEqual([0x04]);
});

test("Instruction INC (HL)", () => {
  const bytes = compileCode('INC (HL)');
  expect(bytes).toEqual([0x34]);
});

test("Instruction INC (IX+d)", () => {
  const bytes = compileCode('INC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x34, 0x55]);
});

test("Instruction INC (IY+d)", () => {
  const bytes = compileCode('INC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x34, 0x55]);
});

test("Instruction DEC r", () => {
  const bytes = compileCode('DEC B');
  expect(bytes).toEqual([0x05]);
});

test("Instruction DEC (HL)", () => {
  const bytes = compileCode('DEC (HL)');
  expect(bytes).toEqual([0x35]);
});

test("Instruction DEC (IX+d)", () => {
  const bytes = compileCode('DEC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x35, 0x55]);
});

test("Instruction DEC (IY+d)", () => {
  const bytes = compileCode('DEC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x35, 0x55]);
});

test("Instruction DAA", () => {
  const bytes = compileCode('DAA');
  expect(bytes).toEqual([0x27]);
});

test("Instruction CPL", () => {
  const bytes = compileCode('CPL');
  expect(bytes).toEqual([0x2F]);
});

test("Instruction NEG", () => {
  const bytes = compileCode('NEG');
  expect(bytes).toEqual([0xED, 0x44]);
});

test("Instruction CCF", () => {
  const bytes = compileCode('CCF');
  expect(bytes).toEqual([0x3F]);
});

test("Instruction SCF", () => {
  const bytes = compileCode('SCF');
  expect(bytes).toEqual([0x37]);
});

test("Instruction NOP", () => {
  const bytes = compileCode('NOP');
  expect(bytes).toEqual([0x00]);
});

test("Instruction HALT", () => {
  const bytes = compileCode('HALT');
  expect(bytes).toEqual([0x76]);
});

test("Instruction DI", () => {
  const bytes = compileCode('DI');
  expect(bytes).toEqual([0xF3]);
});

test("Instruction EI", () => {
  const bytes = compileCode('EI');
  expect(bytes).toEqual([0xFB]);
});

test("Instruction IM 0", () => {
  const bytes = compileCode('IM 0');
  expect(bytes).toEqual([0xED, 0x46]);
});

test("Instruction IM 1", () => {
  const bytes = compileCode('IM 1');
  expect(bytes).toEqual([0xED, 0x56]);
});

test("Instruction IM 2", () => {
  const bytes = compileCode('IM 2');
  expect(bytes).toEqual([0xED, 0x5E]);
});

test("Instruction ADD HL, ss", () => {
  const bytes = compileCode('ADD HL, BC');
  expect(bytes).toEqual([0x09]);
});

test("Instruction ADC HL, ss", () => {
  const bytes = compileCode('ADC HL, BC');
  expect(bytes).toEqual([0xED, 0x4A]);
});

test("Instruction SBC HL, ss", () => {
  const bytes = compileCode('SBC HL, BC');
  expect(bytes).toEqual([0xED, 0x42]);
});

test("Instruction ADD IX, ss", () => {
  const bytes = compileCode('ADD IX, BC');
  expect(bytes).toEqual([0xDD, 0x09]);
});

test("Instruction ADD IY, ss", () => {
  const bytes = compileCode('ADD IY, BC');
  expect(bytes).toEqual([0xFD, 0x09]);
});

test("Instruction INC ss", () => {
  const bytes = compileCode('INC BC');
  expect(bytes).toEqual([0x03]);
});

test("Instruction INC IX", () => {
  const bytes = compileCode('INC IX');
  expect(bytes).toEqual([0xDD, 0x23]);
});

test("Instruction INC IY", () => {
  const bytes = compileCode('INC IY');
  expect(bytes).toEqual([0xFD, 0x23]);
});

test("Instruction DEC ss", () => {
  const bytes = compileCode('DEC BC');
  expect(bytes).toEqual([0x0B]);
});

test("Instruction DEC IX", () => {
  const bytes = compileCode('DEC IX');
  expect(bytes).toEqual([0xDD, 0x2B]);
});

test("Instruction DEC IY", () => {
  const bytes = compileCode('DEC IY');
  expect(bytes).toEqual([0xFD, 0x2B]);
});

test("Instruction RLCA", () => {
  const bytes = compileCode('RLCA');
  expect(bytes).toEqual([0x07]);
});

test("Instruction RLA", () => {
  const bytes = compileCode('RLA');
  expect(bytes).toEqual([0x17]);
});

test("Instruction RRCA", () => {
  const bytes = compileCode('RRCA');
  expect(bytes).toEqual([0x0F]);
});

test("Instruction RRA", () => {
  const bytes = compileCode('RRA');
  expect(bytes).toEqual([0x1F]);
});

test("Instruction RLC r", () => {
  const bytes = compileCode('RLC B');
  expect(bytes).toEqual([0xCB, 0x00]);
});

test("Instruction RLC (HL)", () => {
  const bytes = compileCode('RLC (HL)');
  expect(bytes).toEqual([0xCB, 0x06]);
});

test("Instruction RLC (IX+d)", () => {
  const bytes = compileCode('RLC (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x06]);
});

test("Instruction RLC (IY+d)", () => {
  const bytes = compileCode('RLC (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x06]);
});

test("Instruction RL r", () => {
  const bytes = compileCode('RL B');
  expect(bytes).toEqual([0xCB, 0x10]);
});

test("Instruction RL (HL)", () => {
  const bytes = compileCode('RL (HL)');
  expect(bytes).toEqual([0xCB, 0x16]);
});

test("Instruction RL (IX+d)", () => {
  const bytes = compileCode('RL (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x16]);
});

test("Instruction RL (IY+d)", () => {
  const bytes = compileCode('RL (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x16]);
});

test("Instruction RRC r", () => {
  const bytes = compileCode('RRC B');
  expect(bytes).toEqual([0xCB, 0x08]);
});

test("Instruction RRC (HL)", () => {
  const bytes = compileCode('RRC (HL)');
  expect(bytes).toEqual([0xCB, 0x0E]);
});

test("Instruction RRC (IX+d)", () => {
  const bytes = compileCode('RRC (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x0E]);
});

test("Instruction RRC (IY+d)", () => {
  const bytes = compileCode('RRC (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x0E]);
});

test("Instruction RR r", () => {
  const bytes = compileCode('RR B');
  expect(bytes).toEqual([0xCB, 0x18]);
});

test("Instruction RR (HL)", () => {
  const bytes = compileCode('RR (HL)');
  expect(bytes).toEqual([0xCB, 0x1E]);
});

test("Instruction RR (IX+d)", () => {
  const bytes = compileCode('RR (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x1E]);
});

test("Instruction RR (IY+d)", () => {
  const bytes = compileCode('RR (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x1E]);
});

test("Instruction SLA r", () => {
  const bytes = compileCode('SLA B');
  expect(bytes).toEqual([0xCB, 0x20]);
});

test("Instruction SLA (HL)", () => {
  const bytes = compileCode('SLA (HL)');
  expect(bytes).toEqual([0xCB, 0x26]);
});

test("Instruction SLA (IX+d)", () => {
  const bytes = compileCode('SLA (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x26]);
});

test("Instruction SLA (IY+d)", () => {
  const bytes = compileCode('SLA (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x26]);
});

test("Instruction SRA r", () => {
  const bytes = compileCode('SRA B');
  expect(bytes).toEqual([0xCB, 0x28]);
});

test("Instruction SRA (HL)", () => {
  const bytes = compileCode('SRA (HL)');
  expect(bytes).toEqual([0xCB, 0x2E]);
});

test("Instruction SRA (IX+d)", () => {
  const bytes = compileCode('SRA (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x2E]);
});

test("Instruction SRA (IY+d)", () => {
  const bytes = compileCode('SRA (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x2E]);
});

test("Instruction SRL r", () => {
  const bytes = compileCode('SRL B');
  expect(bytes).toEqual([0xCB, 0x38]);
});

test("Instruction SRL (HL)", () => {
  const bytes = compileCode('SRL (HL)');
  expect(bytes).toEqual([0xCB, 0x3E]);
});

test("Instruction SRL (IX+d)", () => {
  const bytes = compileCode('SRL (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x3E]);
});

test("Instruction SRL (IY+d)", () => {
  const bytes = compileCode('SRL (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x3E]);
});

test("Instruction RLD", () => {
  const bytes = compileCode('RLD');
  expect(bytes).toEqual([0xED, 0x6F]);
});

test("Instruction RRD", () => {
  const bytes = compileCode('RRD');
  expect(bytes).toEqual([0xED, 0x67]);
});

test("Instruction BIT b, r", () => {
  const bytes = compileCode('BIT 2, B');
  expect(bytes).toEqual([0xCB, 0x50]);
});

test("Instruction BIT b, (HL)", () => {
  const bytes = compileCode('BIT 2, (HL)');
  expect(bytes).toEqual([0xCB, 0x56]);
});

test("Instruction BIT b, (IX+d)", () => {
  const bytes = compileCode('BIT 2, (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x56]);
});

test("Instruction BIT b, (IY+d)", () => {
  const bytes = compileCode('BIT 2, (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x56]);
});

test("Instruction SET b, r", () => {
  const bytes = compileCode('SET 2, B');
  expect(bytes).toEqual([0xCB, 0xD0]);
});

test("Instruction SET b, (HL)", () => {
  const bytes = compileCode('SET 2, (HL)');
  expect(bytes).toEqual([0xCB, 0xD6]);
});

test("Instruction SET b, (IX+d)", () => {
  const bytes = compileCode('SET 2, (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0xD6]);
});

test("Instruction SET b, (IY+d)", () => {
  const bytes = compileCode('SET 2, (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0xD6]);
});

test("Instruction RES b, r", () => {
  const bytes = compileCode('RES 2, B');
  expect(bytes).toEqual([0xCB, 0x90]);
});

test("Instruction RES b, (HL)", () => {
  const bytes = compileCode('RES 2, (HL)');
  expect(bytes).toEqual([0xCB, 0x96]);
});

test("Instruction RES b, (IX+d)", () => {
  const bytes = compileCode('RES 2, (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x96]);
});

test("Instruction RES b, (IY+d)", () => {
  const bytes = compileCode('RES 2, (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x96]);
});

test("Instruction JP nn", () => {
  const bytes = compileCode('JP $5522');
  expect(bytes).toEqual([0xC3, 0x22, 0x55]);
});

test("Instruction JP NZ, nn", () => {
  const bytes = compileCode('JP NZ, $5522');
  expect(bytes).toEqual([0xC2, 0x22, 0x55]);
});

test("Instruction JP Z, nn", () => {
  const bytes = compileCode('JP Z, $5522');
  expect(bytes).toEqual([0xCA, 0x22, 0x55]);
});

test("Instruction JP NC, nn", () => {
  const bytes = compileCode('JP NC, $5522');
  expect(bytes).toEqual([0xD2, 0x22, 0x55]);
});

test("Instruction JP C, nn", () => {
  const bytes = compileCode('JP C, $5522');
  expect(bytes).toEqual([0xDA, 0x22, 0x55]);
});

test("Instruction JP PO, nn", () => {
  const bytes = compileCode('JP PO, $5522');
  expect(bytes).toEqual([0xE2, 0x22, 0x55]);
});

test("Instruction JP PE, nn", () => {
  const bytes = compileCode('JP PE, $5522');
  expect(bytes).toEqual([0xEA, 0x22, 0x55]);
});

test("Instruction JP P, nn", () => {
  const bytes = compileCode('JP P, $5522');
  expect(bytes).toEqual([0xF2, 0x22, 0x55]);
});

test("Instruction JP M, nn", () => {
  const bytes = compileCode('JP M, $5522');
  expect(bytes).toEqual([0xFA, 0x22, 0x55]);
});

test("Instruction JR e", () => {
  const bytes = compileCode('JR 24');
  expect(bytes).toEqual([0x18, 0x16]);
});

test("Instruction JR e with negative offset", () => {
  const bytes = compileCode('JR -24');
  expect(bytes).toEqual([0x18, 0xE6]);
});

test("Instruction JR e on the next instruction", () => {
  const bytes = compileCode('NOP\nNOP\nJR label1\nlabel1:\nNOP\nNOP\nNOP\n');
  expect(bytes).toEqual([0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00]);
});

test("Instruction JR e with forward label", () => {
  const bytes = compileCode('NOP\nNOP\nJR label1\nNOP\nNOP\nNOP\nlabel1:');
  expect(bytes).toEqual([0x00, 0x00, 0x18, 0x03, 0x00, 0x00, 0x00]);
});

test("Instruction JR e with backward label", () => {
  const bytes = compileCode('label1:\nNOP\nNOP\nNOP\nNOP\nJR label1');
  expect(bytes).toEqual([0x00, 0x00, 0x00, 0x00, 0x18, 0xFA]);
});

test("Instruction JR NZ, e", () => {
  const bytes = compileCode('JR NZ, 24');
  expect(bytes).toEqual([0x20, 0x16]);
});

test("Instruction JR Z, e", () => {
  const bytes = compileCode('JR Z, 24');
  expect(bytes).toEqual([0x28, 0x16]);
});

test("Instruction JR NC, e", () => {
  const bytes = compileCode('JR NC, 24');
  expect(bytes).toEqual([0x30, 0x16]);
});

test("Instruction JR C, e", () => {
  const bytes = compileCode('JR C, 24');
  expect(bytes).toEqual([0x38, 0x16]);
});

test("Instruction JP (HL)", () => {
  const bytes = compileCode('JP (HL)');
  expect(bytes).toEqual([0xE9]);
});

test("Instruction JP (IX)", () => {
  const bytes = compileCode('JP (IX)');
  expect(bytes).toEqual([0xDD, 0xE9]);
});

test("Instruction JP (IY)", () => {
  const bytes = compileCode('JP (IY)');
  expect(bytes).toEqual([0xFD, 0xE9]);
});

test("Instruction DJNZ e", () => {
  const bytes = compileCode('DJNZ $55');
  expect(bytes).toEqual([0x10, 0x53]);
});

test("Instruction DJNZ e with negative offset", () => {
  const bytes = compileCode('DJNZ -24');
  expect(bytes).toEqual([0x10, 0xE6]);
});

test("Instruction DJNZ e with forward label", () => {
  const bytes = compileCode('DJNZ label1\ndb $55\nlabel1:');
  expect(bytes).toEqual([0x10, 0x01, 0x55]);
});

test("Instruction DJNZ e with backward label", () => {
  const bytes = compileCode('label1:\ndb $55\nDJNZ label1');
  expect(bytes).toEqual([0x55, 0x10, 0xFD]);
});

test("Instruction CALL nn", () => {
  const bytes = compileCode('CALL $5522');
  expect(bytes).toEqual([0xCD, 0x22, 0x55]);
});

test("Instruction CALL NZ, nn", () => {
  const bytes = compileCode('CALL NZ, $5522');
  expect(bytes).toEqual([0xC4, 0x22, 0x55]);
});

test("Instruction CALL NZ, nn", () => {
  const bytes = compileCode('CALL NZ, $5522');
  expect(bytes).toEqual([0xC4, 0x22, 0x55]);
});

test("Instruction CALL NZ, nn", () => {
  const bytes = compileCode('CALL NZ, $5522');
  expect(bytes).toEqual([0xC4, 0x22, 0x55]);
});

test("Instruction CALL Z, nn", () => {
  const bytes = compileCode('CALL Z, $5522');
  expect(bytes).toEqual([0xCC, 0x22, 0x55]);
});

test("Instruction CALL NC, nn", () => {
  const bytes = compileCode('CALL NC, $5522');
  expect(bytes).toEqual([0xD4, 0x22, 0x55]);
});

test("Instruction CALL C, nn", () => {
  const bytes = compileCode('CALL C, $5522');
  expect(bytes).toEqual([0xDC, 0x22, 0x55]);
});

test("Instruction CALL PO, nn", () => {
  const bytes = compileCode('CALL PO, $5522');
  expect(bytes).toEqual([0xE4, 0x22, 0x55]);
});

test("Instruction CALL PE, nn", () => {
  const bytes = compileCode('CALL PE, $5522');
  expect(bytes).toEqual([0xEC, 0x22, 0x55]);
});

test("Instruction CALL P, nn", () => {
  const bytes = compileCode('CALL P, $5522');
  expect(bytes).toEqual([0xF4, 0x22, 0x55]);
});

test("Instruction CALL M, nn", () => {
  const bytes = compileCode('CALL M, $5522');
  expect(bytes).toEqual([0xFC, 0x22, 0x55]);
});

test("Instruction RET", () => {
  const bytes = compileCode('RET');
  expect(bytes).toEqual([0xC9]);
});

test("Instruction RET NZ", () => {
  const bytes = compileCode('RET NZ');
  expect(bytes).toEqual([0xC0]);
});

test("Instruction RET Z", () => {
  const bytes = compileCode('RET Z');
  expect(bytes).toEqual([0xC8]);
});

test("Instruction RET NC", () => {
  const bytes = compileCode('RET NC');
  expect(bytes).toEqual([0xD0]);
});

test("Instruction RET C", () => {
  const bytes = compileCode('RET C');
  expect(bytes).toEqual([0xD8]);
});

test("Instruction RET PO", () => {
  const bytes = compileCode('RET PO');
  expect(bytes).toEqual([0xE0]);
});

test("Instruction RET PE", () => {
  const bytes = compileCode('RET PE');
  expect(bytes).toEqual([0xE8]);
});

test("Instruction RET P", () => {
  const bytes = compileCode('RET P');
  expect(bytes).toEqual([0xF0]);
});

test("Instruction RET M", () => {
  const bytes = compileCode('RET M');
  expect(bytes).toEqual([0xF8]);
});

test("Instruction RETI", () => {
  const bytes = compileCode('RETI');
  expect(bytes).toEqual([0xED, 0x4D]);
});

test("Instruction RETN", () => {
  const bytes = compileCode('RETN');
  expect(bytes).toEqual([0xED, 0x45]);
});

test("Instruction RST p", () => {
  const bytes = compileCode('RST 0x08');
  expect(bytes).toEqual([0xCF]);
});

test("Instruction IN A, (n)", () => {
  const bytes = compileCode('IN A, ($55)');
  expect(bytes).toEqual([0xDB, 0x55]);
});

test("Instruction IN r, (C) with B", () => {
  const bytes = compileCode('IN B, (C)');
  expect(bytes).toEqual([0xED, 0x40]);
});

test("Instruction IN r, (C) with A", () => {
  const bytes = compileCode('IN A, (C)');
  expect(bytes).toEqual([0xED, 0x78]);
});

test("Instruction INI", () => {
  const bytes = compileCode('INI');
  expect(bytes).toEqual([0xED, 0xA2]);
});

test("Instruction INIR", () => {
  const bytes = compileCode('INIR');
  expect(bytes).toEqual([0xED, 0xB2]);
});

test("Instruction IND", () => {
  const bytes = compileCode('IND');
  expect(bytes).toEqual([0xED, 0xAA]);
});

test("Instruction INDR", () => {
  const bytes = compileCode('INDR');
  expect(bytes).toEqual([0xED, 0xBA]);
});

test("Instruction OUT (n), A", () => {
  const bytes = compileCode('OUT ($55), A');
  expect(bytes).toEqual([0xD3, 0x55]);
});

test("Instruction OUT (C), r", () => {
  const bytes = compileCode('OUT (C), B');
  expect(bytes).toEqual([0xED, 0x41]);
});

test("Instruction OUTI", () => {
  const bytes = compileCode('OUTI');
  expect(bytes).toEqual([0xED, 0xA3]);
});

test("Instruction OTIR", () => {
  const bytes = compileCode('OTIR');
  expect(bytes).toEqual([0xED, 0xB3]);
});

test("Instruction OUTD", () => {
  const bytes = compileCode('OUTD');
  expect(bytes).toEqual([0xED, 0xAB]);
});

test("Instruction OTDR", () => {
  const bytes = compileCode('OTDR');
  expect(bytes).toEqual([0xED, 0xBB]);
});


// -------------------------------------------------------
// Labels
// -------------------------------------------------------

test("Label with a colon", () => {
  const bytes = compileCode('label1:');
  expect(bytes).toEqual([]);
});

test("Label without a colon", () => {
  const bytes = compileCode('label1');
  expect(bytes).toEqual([]);
});

test("Label with a name starting with the name of an instruction", () => {
  const bytes = compileCode('init:');
  expect(bytes).toEqual([]);
});

test("Label not defined", () => {
  compileWithError('ld a, label1');
});

test("Label transitive", () => {
  const bytes = compileCode('label1 equ label2\nlabel2 equ label3\nlabel3 equ $55\nld a, label1');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Circular Labels", () => {
  compileWithError('label1 equ label2\nlabel2 equ label3\nlabel3 equ label1\nld a, label1');
});

test("Circular equalities", () => {
  compileWithError('label1 equ label1\ndb label1');
});

test("Labels with computation EQU", () => {
  const bytes = compileCode(`
before equ 0
after  equ 5
defw after-before-4
`);
  expect(bytes).toEqual([0x01, 0x00]);
});

test("Labels with computation DEFW", () => {
  const bytes = compileCode(`before:
    defb $55, $44
    defw after-before-4
    defb $66
after:`);
  expect(bytes).toEqual([0x55, 0x44, 0x01, 0x00, 0x66]);
});

test("Label redefined", () => {
  compileWithError('lbl: db $00\nlbl: db $01\ndb lbl');
});

test("Label forbidden", () => {
  compileWithError('equ: db $00\nld a, 0x44');
});

test("Label almost forbidden", () => {
  const bytes = compileCode('_equ: db $00\nld a, 0x44');
  expect(bytes).toEqual([0x00, 0x3E, 0x44]);
});

// -------------------------------------------------------
// Data
// -------------------------------------------------------

test("Declaring bytes", () => {
  const bytes = compileCode('db $44, $01, $55');
  expect(bytes).toEqual([0x44, 0x01, 0x55]);
});

test("Declaring bytes with expressions", () => {
  const bytes = compileCode('db $44 + 2, $01 * 2, $55');
  expect(bytes).toEqual([0x46, 0x02, 0x55]);
});

test("Declaring string", () => {
  const bytes = compileCode('db "HELLO WORLD"');
  expect(bytes).toEqual([0x2D, 0x2A, 0x31, 0x31, 0x34, 0x00, 0x3C, 0x34, 0x37, 0x31, 0x29]);
});

test("Declaring string with simple quotes", () => {
  const bytes = compileCode('db \'HELLO WORLD\'');
  expect(bytes).toEqual([0x2D, 0x2A, 0x31, 0x31, 0x34, 0x00, 0x3C, 0x34, 0x37, 0x31, 0x29]);
});

test("Declaring strings", () => {
  const bytes = compileCode('db "HELLO", "WORLD"');
  expect(bytes).toEqual([0x2D, 0x2A, 0x31, 0x31, 0x34, 0x3C, 0x34, 0x37, 0x31, 0x29]);
});

test("Declaring words", () => {
  const bytes = compileCode('dw $22, $4455, $0102, $55AA');
  expect(bytes).toEqual([0x22, 0x00, 0x55, 0x44, 0x02, 0x01, 0xAA, 0x55]);
});

test("Declaring words with label", () => {
  const bytes = compileCode('values:\ndw label2*2+0x55\nlabel2:');
  expect(bytes).toEqual([0x59, 0x00]);
});

test("Declaring block with explicit value", () => {
  const bytes = compileCode('ds 10, 0xFF');
  expect(bytes).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
});


test("Declaring block with implicit value", () => {
  const bytes = compileCode('ds 10');
  expect(bytes).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
});

test("Declaring block with length from previous label", () => {
  const bytes = compileCode('db 0x00, 0x01, 0x02, 0x03\nlength:\nds length, 0xFF');
  expect(bytes).toEqual([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with length from following label", () => {
  compileWithError('db 0x00, 0x01, 0x02, 0x03\nds length, 0xFF\nlength:');
});

test("Declaring block with length from previous equ", () => {
  const bytes = compileCode('length equ 10\nds length, 0xFF');
  expect(bytes).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with length from following equ", () => {
  const bytes = compileCode('ds length, 0xFF\nlength equ 10');
  expect(bytes).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with length dependent of the size", () => {
  compileWithError('length equ label1\ndb 0x55, 0x56, 0x57\nds length, 0xFF\nlabel1:\n db 0x44');
});

// -------------------------------------------------------
// Directives
// -------------------------------------------------------

test("Directive EQU", () => {
  const bytes = compileCode('label1 EQU $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Directive EQU with colon", () => {
  const bytes = compileCode('label1: EQU $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Directive EQU with dot", () => {
  const bytes = compileCode('label1 .EQU $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Directive EQU with period and colon", () => {
  const bytes = compileCode('label1: .EQU $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Origin directive", () => {
  const bytes = compileCode('org $5544\nlabel1:\nld hl, label1');
  expect(bytes).toEqual([0x21, 0x44, 0x55]);
});

test("Directive EQU with equal symbol", () => {
  const bytes = compileCode('label1 = $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Directive EQU with colon and equal symbol", () => {
  const bytes = compileCode('label1: = $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Origin directive with dot", () => {
  const bytes = compileCode('.org $5544\nlabel1:\nld hl, label1');
  expect(bytes).toEqual([0x21, 0x44, 0x55]);
});

test("Include", () => {
  const bytes = compileCode('include test.asm');
  expect(bytes).toEqual([]);
});

test("Include with dot", () => {
  const bytes = compileCode('.include test.asm');
  expect(bytes).toEqual([]);
});

test("Include with quotes", () => {
  const bytes = compileCode('include "test.asm"');
  expect(bytes).toEqual([]);
});

test("Include with label definition", () => {
  const bytes = compileCodes([
    {filename: 'main.asm', code: 'include "inc1.asm"\ndb test1'},
    {filename: 'inc1.asm', code: 'test1 equ $55'}
  ]);
  expect(bytes).toEqual([0x55]);
});

test("Include with label defined after inclusion", () => {
  const bytes = compileCodes([
    {filename: 'main.asm', code: 'include "inc1.asm"\ntest2 equ $55\ndb test1'},
    {filename: 'inc1.asm', code: 'test1 equ test2'}
  ]);
  expect(bytes).toEqual([0x55]);
});

test("Include with address defined after inclusion", () => {
  const bytes = compileCodes([
    {filename: 'main.asm', code: 'db $AA, $AA, $AA, $AA\ninclude "inc1.asm"\ntest1: db $55'},
    {filename: 'inc1.asm', code: 'db test1'}
  ]);
  expect(bytes).toEqual([0xAA, 0xAA, 0xAA, 0xAA, 0x05, 0x55]);
});

test("Include with address defined in another inclusion", () => {
  const bytes = compileCodes([
    {filename: 'main.asm', code: 'db $AA, $AA, $AA, $AA\ninclude "inc1.asm"\ndb $55\ninclude "inc2.asm"\ndb $66'},
    {filename: 'inc1.asm', code: 'test1: defw test2'},
    {filename: 'inc2.asm', code: 'test2: db $22, $22, $22, $22'}
  ]);
  expect(bytes).toEqual([0xAA, 0xAA, 0xAA, 0xAA, 0x07, 0x00, 0x55, 0x22, 0x22, 0x22, 0x22, 0x66]);
});

test("Output", () => {
  const bytes = compileCode('output test.P');
  expect(bytes).toEqual([]);
});

test("Output with dot", () => {
  const bytes = compileCode('.output test.P');
  expect(bytes).toEqual([]);
});

test("Output with quotes", () => {
  const bytes = compileCode('output "test.P"');
  expect(bytes).toEqual([]);
});

test("Output with SLD", () => {
  const bytes = compileCode('output test.P, sld test.sld');
  expect(bytes).toEqual([]);
});

test("Output with SLD and quotes", () => {
  const bytes = compileCode('output "test.P", sld "test.sld"');
  expect(bytes).toEqual([]);
});

test("Device", () => {
  const bytes = compileCode('device test');
  expect(bytes).toEqual([]);
});

test("Device with dot", () => {
  const bytes = compileCode('.device test');
  expect(bytes).toEqual([]);
});

test("End Directive", () => {
  const bytes = compileCode('ld a,1\nend\nld a,2');
  expect(bytes).toEqual([0x3E, 0x01]);
});


// -------------------------------------------------------
// Comments
// -------------------------------------------------------

test("Comment alone", () => {
  const bytes = compileCode('; a comment');
  expect(bytes).toEqual([]);
});

test("Comment with spaces", () => {
  const bytes = compileCode('    ; a comment');
  expect(bytes).toEqual([]);
});

test("Comment with label", () => {
  const bytes = compileCode('test1: ; a comment');
  expect(bytes).toEqual([]);
});

test("Comment with instruction", () => {
  const bytes = compileCode(' ld a, $55 ; a comment');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Comment with label and instruction", () => {
  const bytes = compileCode('test1: ld a, $55 ; a comment');
  expect(bytes).toEqual([0x3E, 0x55]);
});

// -------------------------------------------------------
// Pseudo label $ for current program counter
// -------------------------------------------------------

test("Pseudo label $", () => {
  const bytes = compileCode('ld a, $55\nld hl, $');
  expect(bytes).toEqual([0x3E, 0x55, 0x21, 0x02, 0x00]);
});

// -------------------------------------------------------
// SLD
// -------------------------------------------------------

test("SLD with label alone on a line", () => {
  const info = compileWithSld(`
  ld a, $44
start:
  ld a, $55
  ld b, $66
  ld hl, start
  `);
  expect(info.bytes).toEqual([0x3E, 0x44, 0x3E, 0x55, 0x06, 0x66, 0x21, 0x02, 0x00]);
  expect(info.sld).toEqual(`|SLD.data.version|1
test.asm|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0
test.asm|2||0|0|0|T|
test.asm|3||0|0|2|L|,start,
test.asm|4||0|0|2|T|
test.asm|5||0|0|4|T|
test.asm|6||0|0|6|T|
`);
});

test("SLD with label in front of statement", () => {
  const info = compileWithSld(`
        ld a, $44
start:  ld a, $55
        ld b, $66
        ld hl, start
  `);
  expect(info.bytes).toEqual([0x3E, 0x44, 0x3E, 0x55, 0x06, 0x66, 0x21, 0x02, 0x00]);
  expect(info.sld).toEqual(`|SLD.data.version|1
test.asm|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0
test.asm|2||0|0|0|T|
test.asm|3||0|0|2|L|,start,
test.asm|3||0|0|2|T|
test.asm|4||0|0|4|T|
test.asm|5||0|0|6|T|
`);
});

test("SLD with label alone on a line and $", () => {
  const info = compileWithSld(`
  ld a, $44
start:
  ld a, $55
  ld b, $66
  ld hl, $ - start
  `);
  expect(info.bytes).toEqual([0x3E, 0x44, 0x3E, 0x55, 0x06, 0x66, 0x21, 0x04, 0x00]);
  expect(info.sld).toEqual(`|SLD.data.version|1
test.asm|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0
test.asm|2||0|0|0|T|
test.asm|3||0|0|2|L|,start,
test.asm|4||0|0|2|T|
test.asm|5||0|0|4|T|
test.asm|6||0|0|6|T|
`);
});

test("SLD with $", () => {
  const info = compileWithSld(`
start:
  ds 10, $44
size eq $ - start
  ld hl, size
  `);
  expect(info.bytes).toEqual([0x44, 0x44, 0x44, 0x44, 0x44, 0x44, 0x44, 0x44, 0x44, 0x44,
    0x21, 0x0A, 0x00]);
  expect(info.sld).toEqual(`|SLD.data.version|1
test.asm|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0
test.asm|2||0|0|0|L|,start,
test.asm|4||0|-1|10|L|,size,,+equ
test.asm|5||0|0|10|T|
`);
});
