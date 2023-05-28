import {compile as rawCompile} from "../compiler/Compiler"
import {expect} from "vitest";

function compile(code: string) {
  const info = rawCompile('test.asm', code, () => '');
  expect(info.errs[0]?.toString()).toBeUndefined();
  return info.bytes;
}

function compileWithError(code: string) {
  const info = rawCompile('test.asm', code, () => '');
  expect(info.errs[0]?.toString()).toBeDefined();
}


// -------------------------------------------------------
// Numbers
// -------------------------------------------------------

test("Loading decimal", () => {
  const bytes = compile(' ld a, 123');
  expect(bytes).toEqual([0x3e, 0x7B]);
});

test("Loading positive decimal", () => {
  const bytes = compile(' ld a, +123');
  expect(bytes).toEqual([0x3e, 0x7B]);
});

test("Loading negative decimal", () => {
  const bytes = compile(' ld a, -123');
  expect(bytes).toEqual([0x3e, 0x85]);
});

test("Loading hexadecimal with $", () => {
  const bytes = compile(' ld a, $55');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with #", () => {
  const bytes = compile(' ld a, #55');
  expect(bytes).toEqual([0x3e, 0x55]);
});


test("Loading hexadecimal with 0x", () => {
  const bytes = compile(' ld a, 0x55');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading hexadecimal with h", () => {
  const bytes = compile(' ld a, 55h');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading binary with 0b", () => {
  const bytes = compile(' ld a, 0b10101010');
  expect(bytes).toEqual([0x3e, 0xAA]);
});

test("Loading binary with %", () => {
  const bytes = compile(' ld a, %10101010');
  expect(bytes).toEqual([0x3e, 0xAA]);
});

test("Loading octal with 0q", () => {
  const bytes = compile(' ld a, 0q125');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with 0o", () => {
  const bytes = compile(' ld a, 0o125');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with q", () => {
  const bytes = compile(' ld a, 125q');
  expect(bytes).toEqual([0x3e, 0x55]);
});

test("Loading octal with o", () => {
  const bytes = compile(' ld a, 125o');
  expect(bytes).toEqual([0x3e, 0x55]);
});


test("Loading label with colon", () => {
  const bytes = compile('ld a, 1\nlabel1:\nld a, label1');
  expect(bytes).toEqual([0x3e, 0x01, 0x3e, 0x02]);
});

test("Loading label without colon", () => {
  const bytes = compile('ld a, 1\nlabel1\nld a, label1');
  expect(bytes).toEqual([0x3e, 0x01, 0x3e, 0x02]);
});

// -------------------------------------------------------
// Expressions
// -------------------------------------------------------

test("Expression unary +", () => {
  const bytes = compile('LD A, +$55');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Expression unary +", () => {
  const bytes = compile('LD A, -$55');
  expect(bytes).toEqual([0x3E, 0xAB]);
});

test("Expression binary +", () => {
  const bytes = compile('LD A, $55 + 2');
  expect(bytes).toEqual([0x3E, 0x57]);
});

test("Expression binary -", () => {
  const bytes = compile('LD A, $55 - 2');
  expect(bytes).toEqual([0x3E, 0x53]);
});

test("Expression *", () => {
  const bytes = compile('LD A, $55 * 2');
  expect(bytes).toEqual([0x3E, 0xAA]);
});

test("Expression /", () => {
  const bytes = compile('LD A, $55 / 2');
  expect(bytes).toEqual([0x3E, 0x2A]);
});

test("Expression %", () => {
  const bytes = compile('LD A, $55 % 2');
  expect(bytes).toEqual([0x3E, 0x01]);
});

test("Expression <<", () => {
  const bytes = compile('LD A, $55 << 1');
  expect(bytes).toEqual([0x3E, 0xAA]);
});

test("Expression <<", () => {
  const bytes = compile('LD A, $55 >> 4');
  expect(bytes).toEqual([0x3E, 0x05]);
});

test("Expression AND &", () => {
  const bytes = compile('LD A, $55 & 0x06');
  expect(bytes).toEqual([0x3E, 0x04]);
});

test("Expression XOR ^", () => {
  const bytes = compile('LD A, $55 ^ 0xFA');
  expect(bytes).toEqual([0x3E, 0xAF]);
});

test("Expression OR |", () => {
  const bytes = compile('LD A, $55 | 0xAA');
  expect(bytes).toEqual([0x3E, 0xFF]);
});

test("Expression with parenthesis at the beginning", () => {
  const bytes = compile('LD A, 0 + ($55 + 2) % 28');
  expect(bytes).toEqual([0x3E, 0x03]);
});

test("Expression with parenthesis at the end", () => {
  const bytes = compile('LD A, 2 * ($55 + 2)');
  expect(bytes).toEqual([0x3E, 0xAE]);
});

test("Expression with parenthesis int the middle", () => {
  const bytes = compile('LD A, 2 * ($55 + 2) % 28');
  expect(bytes).toEqual([0x3E, 0x06]);
});

test("Expression with multiple parenthesis", () => {
  const bytes = compile('LD A, 2 * ($55 + ($44 - $42)) % 28');
  expect(bytes).toEqual([0x3E, 0x06]);
});

// -------------------------------------------------------
// Instructions
// -------------------------------------------------------

test("Instruction LD r, r'", () => {
  const bytes = compile('LD A, B');
  expect(bytes).toEqual([0x78]);
});

test("Instruction LD r, (HL)", () => {
  const bytes = compile('LD B, (HL)');
  expect(bytes).toEqual([0x46]);
});

test("Instruction LD r, (HL) with E", () => {
  const bytes = compile('LD E, (HL)');
  expect(bytes).toEqual([0x5E]);
});

test("Instruction LD r, (IX+d)", () => {
  const bytes = compile('LD B, (IX+3)');
  expect(bytes).toEqual([0xDD, 0x46, 0x03]);
});

test("Instruction LD r, (IX+d) with negative d", () => {
  const bytes = compile('LD B, (IX-3)');
  expect(bytes).toEqual([0xDD, 0x46, 0xFD]);
});

test("Instruction LD r, (IY+d)", () => {
  const bytes = compile('LD B, (IY+3)');
  expect(bytes).toEqual([0xFD, 0x46, 0x03]);
});

test("Instruction LD r, (IY+d)", () => {
  const bytes = compile('LD B, (IY-3)');
  expect(bytes).toEqual([0xFD, 0x46, 0xFD]);
});

test("Instruction LD r, n with label", () => {
  const bytes = compile('LD A, label1\nlabel1:');
  expect(bytes).toEqual([0x3E, 0x02]);
});

test("Instruction LD (HL), r", () => {
  const bytes = compile('LD (HL), B');
  expect(bytes).toEqual([0x70]);
});

test("Instruction LD (HL), r", () => {
  const bytes = compile('LD (HL), B');
  expect(bytes).toEqual([0x70]);
});

test("Instruction LD (IX+d), r", () => {
  const bytes = compile('LD (IX+5), B');
  expect(bytes).toEqual([0xDD, 0x70, 0x05]);
});

test("Instruction LD (IX+d), r", () => {
  const bytes = compile('LD (IY+5), B');
  expect(bytes).toEqual([0xFD, 0x70, 0x05]);
});

test("Instruction LD (HL), n", () => {
  const bytes = compile('LD (HL), 0x55');
  expect(bytes).toEqual([0x36, 0x55]);
});

test("Instruction LD (HL), n with expression", () => {
  const bytes = compile('LD (HL), 0 + (0x55 + 2) % 2');
  expect(bytes).toEqual([0x36, 0x01]);
});

test("Instruction LD (IX+d), n", () => {
  const bytes = compile('LD (IX+3), 0x55');
  expect(bytes).toEqual([0xDD, 0x36, 3, 0x55]);
});

test("Instruction LD (IY+d), n", () => {
  const bytes = compile('LD (IY+3), 0x55');
  expect(bytes).toEqual([0xFD, 0x36, 3, 0x55]);
});

test("Instruction LD A, (BC)", () => {
  const bytes = compile('LD A, (BC)');
  expect(bytes).toEqual([0x0A]);
});

test("Instruction LD A, (DE)", () => {
  const bytes = compile('LD A, (DE)');
  expect(bytes).toEqual([0x1A]);
});

test("Instruction LD A, (nn)", () => {
  const bytes = compile('LD A, (0x1234)');
  expect(bytes).toEqual([0x3A, 0x34, 0x12]);
});

test("Instruction LD (BC), A", () => {
  const bytes = compile('LD (BC), A');
  expect(bytes).toEqual([0x02]);
});

test("Instruction LD (DE), A", () => {
  const bytes = compile('LD (DE), A');
  expect(bytes).toEqual([0x12]);
});

test("Instruction LD (nn), A", () => {
  const bytes = compile('LD (0x1234), A');
  expect(bytes).toEqual([0x32, 0x34, 0x12]);
});

test("Instruction LD (nn), A with Expression", () => {
  const bytes = compile('LD (0x1234 + 4), A');
  expect(bytes).toEqual([0x32, 0x38, 0x12]);
});

test("Instruction LD A, I", () => {
  const bytes = compile('LD A, I');
  expect(bytes).toEqual([0xED, 0x57]);
});

test("Instruction LD A, R", () => {
  const bytes = compile('LD A, R');
  expect(bytes).toEqual([0xED, 0x5F]);
});

test("Instruction LD I, A", () => {
  const bytes = compile('LD I, A');
  expect(bytes).toEqual([0xED, 0x47]);
});

test("Instruction LD R, A", () => {
  const bytes = compile('LD R, A');
  expect(bytes).toEqual([0xED, 0x4F]);
});

test("Instruction LD r, n", () => {
  const bytes = compile('LD A, $55');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Instruction LD r, n with E", () => {
  const bytes = compile('LD E, $55');
  expect(bytes).toEqual([0x1E, 0x55]);
});


test("Instruction LD dd, nn", () => {
  const bytes = compile('LD BC, $55');
  expect(bytes).toEqual([0x01, 0x55, 0x00]);
});

test("Instruction LD dd, nn with Expression", () => {
  const bytes = compile('LD BC, $55 + 2');
  expect(bytes).toEqual([0x01, 0x57, 0x00]);
});

test("Instruction LD IX, nn", () => {
  const bytes = compile('LD IX, $55');
  expect(bytes).toEqual([0xDD, 0x21, 0x55, 0x00]);
});

test("Instruction LD IX, nn with Expression", () => {
  const bytes = compile('LD IX, $55 + 2');
  expect(bytes).toEqual([0xDD, 0x21, 0x57, 0x00]);
});

test("Instruction LD IY, nn", () => {
  const bytes = compile('LD IY, $55');
  expect(bytes).toEqual([0xFD, 0x21, 0x55, 0x00]);
});

test("Instruction LD IY, nn with Expression", () => {
  const bytes = compile('LD IY, $55 + 2');
  expect(bytes).toEqual([0xFD, 0x21, 0x57, 0x00]);
});

test("Instruction LD IX, (nn)", () => {
  const bytes = compile('LD IX, ($5544)');
  expect(bytes).toEqual([0xDD, 0x2A, 0x44, 0x55]);
});

test("Instruction LD IX, (nn) with Expression", () => {
  const bytes = compile('LD IX, ($5544 + 2)');
  expect(bytes).toEqual([0xDD, 0x2A, 0x46, 0x55]);
});

test("Instruction LD IY, (nn)", () => {
  const bytes = compile('LD IY, ($5555)');
  expect(bytes).toEqual([0xFD, 0x2A, 0x55, 0x55]);
});

test("Instruction LD IY, (nn) with Expression", () => {
  const bytes = compile('LD IY, ($5544 + 2)');
  expect(bytes).toEqual([0xFD, 0x2A, 0x46, 0x55]);
});

test("Instruction LD (nn), HL", () => {
  const bytes = compile('LD ($5544), HL');
  expect(bytes).toEqual([0x22, 0x44, 0x55]);
});

test("Instruction LD (nn), HL with Expression", () => {
  const bytes = compile('LD ($5544 + 2), HL');
  expect(bytes).toEqual([0x22, 0x46, 0x55]);
});

test("Instruction LD (nn), dd", () => {
  const bytes = compile('LD ($5544), BC');
  expect(bytes).toEqual([0xED, 0x43, 0x44, 0x55]);
});

test("Instruction LD (nn), dd with Expression", () => {
  const bytes = compile('LD ($5544+2), BC');
  expect(bytes).toEqual([0xED, 0x43, 0x46, 0x55]);
});

test("Instruction LD (nn), IX", () => {
  const bytes = compile('LD ($5544), IX');
  expect(bytes).toEqual([0xDD, 0x22, 0x44, 0x55]);
});

test("Instruction LD (nn), IY", () => {
  const bytes = compile('LD ($5544), IY');
  expect(bytes).toEqual([0xFD, 0x22, 0x44, 0x55]);
});

test("Instruction LD SP, HL", () => {
  const bytes = compile('LD SP, HL');
  expect(bytes).toEqual([0xF9]);
});

test("Instruction LD SP, IX", () => {
  const bytes = compile('LD SP, IX');
  expect(bytes).toEqual([0xDD, 0xF9]);
});

test("Instruction LD SP, IY", () => {
  const bytes = compile('LD SP, IY');
  expect(bytes).toEqual([0xFD, 0xF9]);
});

test("Instruction PUSH qq", () => {
  const bytes = compile('PUSH HL');
  expect(bytes).toEqual([0xE5]);
});

test("Instruction PUSH IX", () => {
  const bytes = compile('PUSH IX');
  expect(bytes).toEqual([0xDD, 0xE5]);
});

test("Instruction PUSH IY", () => {
  const bytes = compile('PUSH IY');
  expect(bytes).toEqual([0xFD, 0xE5]);
});

test("Instruction POP qq", () => {
  const bytes = compile('POP HL');
  expect(bytes).toEqual([0xE1]);
});

test("Instruction POP IX", () => {
  const bytes = compile('POP IX');
  expect(bytes).toEqual([0xDD, 0xE1]);
});

test("Instruction POP IY", () => {
  const bytes = compile('POP IY');
  expect(bytes).toEqual([0xFD, 0xE1]);
});

test("Instruction EX DE, HL", () => {
  const bytes = compile('EX DE, HL');
  expect(bytes).toEqual([0xEB]);
});

test("Instruction EX AF, AF'", () => {
  const bytes = compile('EX AF, AF\'');
  expect(bytes).toEqual([0x08]);
});

test("Instruction EXX", () => {
  const bytes = compile('EXX');
  expect(bytes).toEqual([0xD9]);
});

test("Instruction EX (SP), HL", () => {
  const bytes = compile('EX (SP), HL');
  expect(bytes).toEqual([0xE3]);
});

test("Instruction EX (SP), IX", () => {
  const bytes = compile('EX (SP), IX');
  expect(bytes).toEqual([0xDD, 0xE3]);
});

test("Instruction EX (SP), IY", () => {
  const bytes = compile('EX (SP), IY');
  expect(bytes).toEqual([0xFD, 0xE3]);
});

test("Instruction LDI", () => {
  const bytes = compile('LDI');
  expect(bytes).toEqual([0xED, 0xA0]);
});

test("Instruction LDIR", () => {
  const bytes = compile('LDIR');
  expect(bytes).toEqual([0xED, 0xB0]);
});

test("Instruction LDI", () => {
  const bytes = compile('LDI');
  expect(bytes).toEqual([0xED, 0xA0]);
});

test("Instruction LDDR", () => {
  const bytes = compile('LDDR');
  expect(bytes).toEqual([0xED, 0xB8]);
});

test("Instruction LDD", () => {
  const bytes = compile('LDD');
  expect(bytes).toEqual([0xED, 0xA8]);
});

test("Instruction CPIR", () => {
  const bytes = compile('CPIR');
  expect(bytes).toEqual([0xED, 0xB1]);
});

test("Instruction CPI", () => {
  const bytes = compile('CPI');
  expect(bytes).toEqual([0xED, 0xA1]);
});

test("Instruction CPDR", () => {
  const bytes = compile('CPDR');
  expect(bytes).toEqual([0xED, 0xB9]);
});

test("Instruction CPD", () => {
  const bytes = compile('CPD');
  expect(bytes).toEqual([0xED, 0xA9]);
});

test("Instruction ADD A, r", () => {
  const bytes = compile('ADD A, B');
  expect(bytes).toEqual([0x80]);
});

test("Instruction ADD A, n", () => {
  const bytes = compile('ADD A, 0x55');
  expect(bytes).toEqual([0xC6, 0x55]);
});

test("Instruction ADD A, (HL)", () => {
  const bytes = compile('ADD A, (HL)');
  expect(bytes).toEqual([0x86]);
});

test("Instruction ADD A, (IX+d)", () => {
  const bytes = compile('ADD A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x86, 0x55]);
});

test("Instruction ADD A, (IY+d)", () => {
  const bytes = compile('ADD A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x86, 0x55]);
});

test("Instruction ADC A, r", () => {
  const bytes = compile('ADC A, B');
  expect(bytes).toEqual([0x88]);
});

test("Instruction ADC A, n", () => {
  const bytes = compile('ADC A, 0x55');
  expect(bytes).toEqual([0xCE, 0x55]);
});

test("Instruction ADC A, (HL)", () => {
  const bytes = compile('ADC A, (HL)');
  expect(bytes).toEqual([0x8E]);
});

test("Instruction ADC A, (IX+d)", () => {
  const bytes = compile('ADC A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x8E, 0x55]);
});

test("Instruction ADC A, (IY+d)", () => {
  const bytes = compile('ADC A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x8E, 0x55]);
});

test("Instruction SUB A, r", () => {
  const bytes = compile('SUB A, B');
  expect(bytes).toEqual([0x90]);
});

test("Instruction SUB A, n", () => {
  const bytes = compile('SUB A, 0x55');
  expect(bytes).toEqual([0xD6, 0x55]);
});

test("Instruction SUB A, (HL)", () => {
  const bytes = compile('SUB A, (HL)');
  expect(bytes).toEqual([0x96]);
});

test("Instruction SUB A, (IX+d)", () => {
  const bytes = compile('SUB A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x96, 0x55]);
});

test("Instruction SUB A, (IY+d)", () => {
  const bytes = compile('SUB A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x96, 0x55]);
});

test("Instruction SBC A, r", () => {
  const bytes = compile('SBC A, B');
  expect(bytes).toEqual([0x98]);
});

test("Instruction SBC A, n", () => {
  const bytes = compile('SBC A, 0x55');
  expect(bytes).toEqual([0xDE, 0x55]);
});

test("Instruction SBC A, (HL)", () => {
  const bytes = compile('SBC A, (HL)');
  expect(bytes).toEqual([0x9E]);
});

test("Instruction SBC A, (IX+d)", () => {
  const bytes = compile('SBC A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x9E, 0x55]);
});

test("Instruction SBC A, (IY+d)", () => {
  const bytes = compile('SBC A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x9E, 0x55]);
});

test("Instruction AND A, r", () => {
  const bytes = compile('AND A, B');
  expect(bytes).toEqual([0xA0]);
});

test("Instruction AND A, n", () => {
  const bytes = compile('AND A, 0x55');
  expect(bytes).toEqual([0xE6, 0x55]);
});

test("Instruction AND A, (HL)", () => {
  const bytes = compile('AND A, (HL)');
  expect(bytes).toEqual([0xA6]);
});

test("Instruction AND A, (IX+d)", () => {
  const bytes = compile('AND A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xA6, 0x55]);
});

test("Instruction AND A, (IY+d)", () => {
  const bytes = compile('AND A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xA6, 0x55]);
});

test("Instruction OR A, r", () => {
  const bytes = compile('OR A, B');
  expect(bytes).toEqual([0xB0]);
});

test("Instruction OR A, n", () => {
  const bytes = compile('OR A, 0x55');
  expect(bytes).toEqual([0xF6, 0x55]);
});

test("Instruction OR A, (HL)", () => {
  const bytes = compile('OR A, (HL)');
  expect(bytes).toEqual([0xB6]);
});

test("Instruction OR A, (IX+d)", () => {
  const bytes = compile('OR A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xB6, 0x55]);
});

test("Instruction OR A, (IY+d)", () => {
  const bytes = compile('OR A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xB6, 0x55]);
});

test("Instruction XOR A, r", () => {
  const bytes = compile('XOR A, B');
  expect(bytes).toEqual([0xA8]);
});

test("Instruction XOR A, n", () => {
  const bytes = compile('XOR A, 0x55');
  expect(bytes).toEqual([0xEE, 0x55]);
});

test("Instruction XOR A, (HL)", () => {
  const bytes = compile('XOR A, (HL)');
  expect(bytes).toEqual([0xAE]);
});

test("Instruction XOR A, (IX+d)", () => {
  const bytes = compile('XOR A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xAE, 0x55]);
});

test("Instruction XOR A, (IY+d)", () => {
  const bytes = compile('XOR A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xAE, 0x55]);
});

test("Instruction CP A, r", () => {
  const bytes = compile('CP A, B');
  expect(bytes).toEqual([0xB8]);
});

test("Instruction CP A, n", () => {
  const bytes = compile('CP A, 0x55');
  expect(bytes).toEqual([0xFE, 0x55]);
});

test("Instruction CP A, (HL)", () => {
  const bytes = compile('CP A, (HL)');
  expect(bytes).toEqual([0xBE]);
});

test("Instruction CP A, (IX+d)", () => {
  const bytes = compile('CP A, (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xBE, 0x55]);
});

test("Instruction CP A, (IY+d)", () => {
  const bytes = compile('CP A, (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xBE, 0x55]);
});

test("Instruction ADD r", () => {
  const bytes = compile('ADD B');
  expect(bytes).toEqual([0x80]);
});

test("Instruction ADD n", () => {
  const bytes = compile('ADD 0x55');
  expect(bytes).toEqual([0xC6, 0x55]);
});

test("Instruction ADD (HL)", () => {
  const bytes = compile('ADD (HL)');
  expect(bytes).toEqual([0x86]);
});

test("Instruction ADD (IX+d)", () => {
  const bytes = compile('ADD (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x86, 0x55]);
});

test("Instruction ADD (IY+d)", () => {
  const bytes = compile('ADD (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x86, 0x55]);
});

test("Instruction ADC r", () => {
  const bytes = compile('ADC B');
  expect(bytes).toEqual([0x88]);
});

test("Instruction ADC n", () => {
  const bytes = compile('ADC 0x55');
  expect(bytes).toEqual([0xCE, 0x55]);
});

test("Instruction ADC (HL)", () => {
  const bytes = compile('ADC (HL)');
  expect(bytes).toEqual([0x8E]);
});

test("Instruction ADC (IX+d)", () => {
  const bytes = compile('ADC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x8E, 0x55]);
});

test("Instruction ADC (IY+d)", () => {
  const bytes = compile('ADC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x8E, 0x55]);
});

test("Instruction SUB r", () => {
  const bytes = compile('SUB B');
  expect(bytes).toEqual([0x90]);
});

test("Instruction SUB n", () => {
  const bytes = compile('SUB 0x55');
  expect(bytes).toEqual([0xD6, 0x55]);
});

test("Instruction SUB (HL)", () => {
  const bytes = compile('SUB (HL)');
  expect(bytes).toEqual([0x96]);
});

test("Instruction SUB (IX+d)", () => {
  const bytes = compile('SUB (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x96, 0x55]);
});

test("Instruction SUB (IY+d)", () => {
  const bytes = compile('SUB (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x96, 0x55]);
});

test("Instruction SBC r", () => {
  const bytes = compile('SBC B');
  expect(bytes).toEqual([0x98]);
});

test("Instruction SBC n", () => {
  const bytes = compile('SBC 0x55');
  expect(bytes).toEqual([0xDE, 0x55]);
});

test("Instruction SBC (HL)", () => {
  const bytes = compile('SBC (HL)');
  expect(bytes).toEqual([0x9E]);
});

test("Instruction SBC (IX+d)", () => {
  const bytes = compile('SBC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x9E, 0x55]);
});

test("Instruction SBC (IY+d)", () => {
  const bytes = compile('SBC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x9E, 0x55]);
});

test("Instruction AND r", () => {
  const bytes = compile('AND B');
  expect(bytes).toEqual([0xA0]);
});

test("Instruction AND n", () => {
  const bytes = compile('AND 0x55');
  expect(bytes).toEqual([0xE6, 0x55]);
});

test("Instruction AND (HL)", () => {
  const bytes = compile('AND (HL)');
  expect(bytes).toEqual([0xA6]);
});

test("Instruction AND (IX+d)", () => {
  const bytes = compile('AND (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xA6, 0x55]);
});

test("Instruction AND (IY+d)", () => {
  const bytes = compile('AND (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xA6, 0x55]);
});

test("Instruction OR r", () => {
  const bytes = compile('OR B');
  expect(bytes).toEqual([0xB0]);
});

test("Instruction OR n", () => {
  const bytes = compile('OR 0x55');
  expect(bytes).toEqual([0xF6, 0x55]);
});

test("Instruction OR (HL)", () => {
  const bytes = compile('OR (HL)');
  expect(bytes).toEqual([0xB6]);
});

test("Instruction OR (IX+d)", () => {
  const bytes = compile('OR (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xB6, 0x55]);
});

test("Instruction OR (IY+d)", () => {
  const bytes = compile('OR (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xB6, 0x55]);
});

test("Instruction XOR r", () => {
  const bytes = compile('XOR B');
  expect(bytes).toEqual([0xA8]);
});

test("Instruction XOR n", () => {
  const bytes = compile('XOR 0x55');
  expect(bytes).toEqual([0xEE, 0x55]);
});

test("Instruction XOR (HL)", () => {
  const bytes = compile('XOR (HL)');
  expect(bytes).toEqual([0xAE]);
});

test("Instruction XOR (IX+d)", () => {
  const bytes = compile('XOR (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xAE, 0x55]);
});

test("Instruction XOR (IY+d)", () => {
  const bytes = compile('XOR (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xAE, 0x55]);
});

test("Instruction CP r", () => {
  const bytes = compile('CP B');
  expect(bytes).toEqual([0xB8]);
});

test("Instruction CP n", () => {
  const bytes = compile('CP 0x55');
  expect(bytes).toEqual([0xFE, 0x55]);
});

test("Instruction CP (HL)", () => {
  const bytes = compile('CP (HL)');
  expect(bytes).toEqual([0xBE]);
});

test("Instruction CP (IX+d)", () => {
  const bytes = compile('CP (IX+$55)');
  expect(bytes).toEqual([0xDD, 0xBE, 0x55]);
});

test("Instruction CP (IY+d)", () => {
  const bytes = compile('CP (IY+$55)');
  expect(bytes).toEqual([0xFD, 0xBE, 0x55]);
});

test("Instruction INC r", () => {
  const bytes = compile('INC B');
  expect(bytes).toEqual([0x04]);
});

test("Instruction INC (HL)", () => {
  const bytes = compile('INC (HL)');
  expect(bytes).toEqual([0x34]);
});

test("Instruction INC (IX+d)", () => {
  const bytes = compile('INC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x34, 0x55]);
});

test("Instruction INC (IY+d)", () => {
  const bytes = compile('INC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x34, 0x55]);
});

test("Instruction DEC r", () => {
  const bytes = compile('DEC B');
  expect(bytes).toEqual([0x05]);
});

test("Instruction DEC (HL)", () => {
  const bytes = compile('DEC (HL)');
  expect(bytes).toEqual([0x35]);
});

test("Instruction DEC (IX+d)", () => {
  const bytes = compile('DEC (IX+$55)');
  expect(bytes).toEqual([0xDD, 0x35, 0x55]);
});

test("Instruction DEC (IY+d)", () => {
  const bytes = compile('DEC (IY+$55)');
  expect(bytes).toEqual([0xFD, 0x35, 0x55]);
});

test("Instruction DAA", () => {
  const bytes = compile('DAA');
  expect(bytes).toEqual([0x27]);
});

test("Instruction CPL", () => {
  const bytes = compile('CPL');
  expect(bytes).toEqual([0x2F]);
});

test("Instruction NEG", () => {
  const bytes = compile('NEG');
  expect(bytes).toEqual([0xED, 0x44]);
});

test("Instruction CCF", () => {
  const bytes = compile('CCF');
  expect(bytes).toEqual([0x3F]);
});

test("Instruction SCF", () => {
  const bytes = compile('SCF');
  expect(bytes).toEqual([0x37]);
});

test("Instruction NOP", () => {
  const bytes = compile('NOP');
  expect(bytes).toEqual([0x00]);
});

test("Instruction HALT", () => {
  const bytes = compile('HALT');
  expect(bytes).toEqual([0x76]);
});

test("Instruction DI", () => {
  const bytes = compile('DI');
  expect(bytes).toEqual([0xF3]);
});

test("Instruction EI", () => {
  const bytes = compile('EI');
  expect(bytes).toEqual([0xFB]);
});

test("Instruction IM 0", () => {
  const bytes = compile('IM 0');
  expect(bytes).toEqual([0xED, 0x46]);
});

test("Instruction IM 1", () => {
  const bytes = compile('IM 1');
  expect(bytes).toEqual([0xED, 0x56]);
});

test("Instruction IM 2", () => {
  const bytes = compile('IM 2');
  expect(bytes).toEqual([0xED, 0x5E]);
});

test("Instruction ADD HL, ss", () => {
  const bytes = compile('ADD HL, BC');
  expect(bytes).toEqual([0x09]);
});

test("Instruction ADC HL, ss", () => {
  const bytes = compile('ADC HL, BC');
  expect(bytes).toEqual([0xED, 0x4A]);
});

test("Instruction SBC HL, ss", () => {
  const bytes = compile('SBC HL, BC');
  expect(bytes).toEqual([0xED, 0x42]);
});

test("Instruction ADD IX, ss", () => {
  const bytes = compile('ADD IX, BC');
  expect(bytes).toEqual([0xDD, 0x09]);
});

test("Instruction ADD IY, ss", () => {
  const bytes = compile('ADD IY, BC');
  expect(bytes).toEqual([0xFD, 0x09]);
});

test("Instruction INC ss", () => {
  const bytes = compile('INC BC');
  expect(bytes).toEqual([0x03]);
});

test("Instruction INC IX", () => {
  const bytes = compile('INC IX');
  expect(bytes).toEqual([0xDD, 0x23]);
});

test("Instruction INC IY", () => {
  const bytes = compile('INC IY');
  expect(bytes).toEqual([0xFD, 0x23]);
});

test("Instruction DEC ss", () => {
  const bytes = compile('DEC BC');
  expect(bytes).toEqual([0x0B]);
});

test("Instruction DEC IX", () => {
  const bytes = compile('DEC IX');
  expect(bytes).toEqual([0xDD, 0x2B]);
});

test("Instruction DEC IY", () => {
  const bytes = compile('DEC IY');
  expect(bytes).toEqual([0xFD, 0x2B]);
});

test("Instruction RLCA", () => {
  const bytes = compile('RLCA');
  expect(bytes).toEqual([0x07]);
});

test("Instruction RLA", () => {
  const bytes = compile('RLA');
  expect(bytes).toEqual([0x17]);
});

test("Instruction RRCA", () => {
  const bytes = compile('RRCA');
  expect(bytes).toEqual([0x0F]);
});

test("Instruction RRA", () => {
  const bytes = compile('RRA');
  expect(bytes).toEqual([0x1F]);
});

test("Instruction RLC r", () => {
  const bytes = compile('RLC B');
  expect(bytes).toEqual([0xCB, 0x00]);
});

test("Instruction RLC (HL)", () => {
  const bytes = compile('RLC (HL)');
  expect(bytes).toEqual([0xCB, 0x06]);
});

test("Instruction RLC (IX+d)", () => {
  const bytes = compile('RLC (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x06]);
});

test("Instruction RLC (IY+d)", () => {
  const bytes = compile('RLC (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x06]);
});

test("Instruction RL r", () => {
  const bytes = compile('RL B');
  expect(bytes).toEqual([0xCB, 0x10]);
});

test("Instruction RL (HL)", () => {
  const bytes = compile('RL (HL)');
  expect(bytes).toEqual([0xCB, 0x16]);
});

test("Instruction RL (IX+d)", () => {
  const bytes = compile('RL (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x16]);
});

test("Instruction RL (IY+d)", () => {
  const bytes = compile('RL (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x16]);
});

test("Instruction RRC r", () => {
  const bytes = compile('RRC B');
  expect(bytes).toEqual([0xCB, 0x08]);
});

test("Instruction RRC (HL)", () => {
  const bytes = compile('RRC (HL)');
  expect(bytes).toEqual([0xCB, 0x0E]);
});

test("Instruction RRC (IX+d)", () => {
  const bytes = compile('RRC (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x0E]);
});

test("Instruction RRC (IY+d)", () => {
  const bytes = compile('RRC (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x0E]);
});

test("Instruction RR r", () => {
  const bytes = compile('RR B');
  expect(bytes).toEqual([0xCB, 0x18]);
});

test("Instruction RR (HL)", () => {
  const bytes = compile('RR (HL)');
  expect(bytes).toEqual([0xCB, 0x1E]);
});

test("Instruction RR (IX+d)", () => {
  const bytes = compile('RR (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x1E]);
});

test("Instruction RR (IY+d)", () => {
  const bytes = compile('RR (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x1E]);
});

test("Instruction SLA r", () => {
  const bytes = compile('SLA B');
  expect(bytes).toEqual([0xCB, 0x20]);
});

test("Instruction SLA (HL)", () => {
  const bytes = compile('SLA (HL)');
  expect(bytes).toEqual([0xCB, 0x26]);
});

test("Instruction SLA (IX+d)", () => {
  const bytes = compile('SLA (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x26]);
});

test("Instruction SLA (IY+d)", () => {
  const bytes = compile('SLA (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x26]);
});

test("Instruction SRA r", () => {
  const bytes = compile('SRA B');
  expect(bytes).toEqual([0xCB, 0x28]);
});

test("Instruction SRA (HL)", () => {
  const bytes = compile('SRA (HL)');
  expect(bytes).toEqual([0xCB, 0x2E]);
});

test("Instruction SRA (IX+d)", () => {
  const bytes = compile('SRA (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x2E]);
});

test("Instruction SRA (IY+d)", () => {
  const bytes = compile('SRA (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x2E]);
});

test("Instruction SRL r", () => {
  const bytes = compile('SRL B');
  expect(bytes).toEqual([0xCB, 0x38]);
});

test("Instruction SRL (HL)", () => {
  const bytes = compile('SRL (HL)');
  expect(bytes).toEqual([0xCB, 0x3E]);
});

test("Instruction SRL (IX+d)", () => {
  const bytes = compile('SRL (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x3E]);
});

test("Instruction SRL (IY+d)", () => {
  const bytes = compile('SRL (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x3E]);
});

test("Instruction RLD", () => {
  const bytes = compile('RLD');
  expect(bytes).toEqual([0xED, 0x6F]);
});

test("Instruction RRD", () => {
  const bytes = compile('RRD');
  expect(bytes).toEqual([0xED, 0x67]);
});

test("Instruction BIT b, r", () => {
  const bytes = compile('BIT 2, B');
  expect(bytes).toEqual([0xCB, 0x50]);
});

test("Instruction BIT b, (HL)", () => {
  const bytes = compile('BIT 2, (HL)');
  expect(bytes).toEqual([0xCB, 0x56]);
});

test("Instruction BIT b, (IX+d)", () => {
  const bytes = compile('BIT 2, (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x56]);
});

test("Instruction BIT b, (IY+d)", () => {
  const bytes = compile('BIT 2, (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x56]);
});

test("Instruction SET b, r", () => {
  const bytes = compile('SET 2, B');
  expect(bytes).toEqual([0xCB, 0xD0]);
});

test("Instruction SET b, (HL)", () => {
  const bytes = compile('SET 2, (HL)');
  expect(bytes).toEqual([0xCB, 0xD6]);
});

test("Instruction SET b, (IX+d)", () => {
  const bytes = compile('SET 2, (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0xD6]);
});

test("Instruction SET b, (IY+d)", () => {
  const bytes = compile('SET 2, (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0xD6]);
});

test("Instruction RES b, r", () => {
  const bytes = compile('RES 2, B');
  expect(bytes).toEqual([0xCB, 0x90]);
});

test("Instruction RES b, (HL)", () => {
  const bytes = compile('RES 2, (HL)');
  expect(bytes).toEqual([0xCB, 0x96]);
});

test("Instruction RES b, (IX+d)", () => {
  const bytes = compile('RES 2, (IX+3)');
  expect(bytes).toEqual([0xDD, 0xCB, 0x03, 0x96]);
});

test("Instruction RES b, (IY+d)", () => {
  const bytes = compile('RES 2, (IY+3)');
  expect(bytes).toEqual([0xFD, 0xCB, 0x03, 0x96]);
});

test("Instruction JP nn", () => {
  const bytes = compile('JP $5522');
  expect(bytes).toEqual([0xC3, 0x22, 0x55]);
});

test("Instruction JP NZ, nn", () => {
  const bytes = compile('JP NZ, $5522');
  expect(bytes).toEqual([0xC2, 0x22, 0x55]);
});

test("Instruction JP Z, nn", () => {
  const bytes = compile('JP Z, $5522');
  expect(bytes).toEqual([0xCA, 0x22, 0x55]);
});

test("Instruction JP NC, nn", () => {
  const bytes = compile('JP NC, $5522');
  expect(bytes).toEqual([0xD2, 0x22, 0x55]);
});

test("Instruction JP C, nn", () => {
  const bytes = compile('JP C, $5522');
  expect(bytes).toEqual([0xDA, 0x22, 0x55]);
});

test("Instruction JP PO, nn", () => {
  const bytes = compile('JP PO, $5522');
  expect(bytes).toEqual([0xE2, 0x22, 0x55]);
});

test("Instruction JP PE, nn", () => {
  const bytes = compile('JP PE, $5522');
  expect(bytes).toEqual([0xEA, 0x22, 0x55]);
});

test("Instruction JP P, nn", () => {
  const bytes = compile('JP P, $5522');
  expect(bytes).toEqual([0xF2, 0x22, 0x55]);
});

test("Instruction JP M, nn", () => {
  const bytes = compile('JP M, $5522');
  expect(bytes).toEqual([0xFA, 0x22, 0x55]);
});

test("Instruction JR e", () => {
  const bytes = compile('JR 24');
  expect(bytes).toEqual([0x18, 0x16]);
});

test("Instruction JR e with negative offset", () => {
  const bytes = compile('JR -24');
  expect(bytes).toEqual([0x18, 0xE6]);
});

test("Instruction JR e on the next instruction", () => {
  const bytes = compile('NOP\nNOP\nJR label1\nlabel1:\nNOP\nNOP\nNOP\n');
  expect(bytes).toEqual([0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00]);
});

test("Instruction JR e with forward label", () => {
  const bytes = compile('NOP\nNOP\nJR label1\nNOP\nNOP\nNOP\nlabel1:');
  expect(bytes).toEqual([0x00, 0x00, 0x18, 0x03, 0x00, 0x00, 0x00]);
});

test("Instruction JR e with backward label", () => {
  const bytes = compile('label1:\nNOP\nNOP\nNOP\nNOP\nJR label1');
  expect(bytes).toEqual([0x00, 0x00, 0x00, 0x00, 0x18, 0xFA]);
});

test("Instruction JR NZ, e", () => {
  const bytes = compile('JR NZ, 24');
  expect(bytes).toEqual([0x20, 0x16]);
});

test("Instruction JR Z, e", () => {
  const bytes = compile('JR Z, 24');
  expect(bytes).toEqual([0x28, 0x16]);
});

test("Instruction JR NC, e", () => {
  const bytes = compile('JR NC, 24');
  expect(bytes).toEqual([0x30, 0x16]);
});

test("Instruction JR C, e", () => {
  const bytes = compile('JR C, 24');
  expect(bytes).toEqual([0x38, 0x16]);
});

test("Instruction JP (HL)", () => {
  const bytes = compile('JP (HL)');
  expect(bytes).toEqual([0xE9]);
});

test("Instruction JP (IX)", () => {
  const bytes = compile('JP (IX)');
  expect(bytes).toEqual([0xDD, 0xE9]);
});

test("Instruction JP (IY)", () => {
  const bytes = compile('JP (IY)');
  expect(bytes).toEqual([0xFD, 0xE9]);
});

test("Instruction DJNZ e", () => {
  const bytes = compile('DJNZ $55');
  expect(bytes).toEqual([0x10, 0x53]);
});

test("Instruction DJNZ e with negative offset", () => {
  const bytes = compile('DJNZ -24');
  expect(bytes).toEqual([0x10, 0xE6]);
});

test("Instruction DJNZ e with forward label", () => {
  const bytes = compile('DJNZ label1\ndb $55\nlabel1:');
  expect(bytes).toEqual([0x10, 0x01, 0x55]);
});

test("Instruction DJNZ e with backward label", () => {
  const bytes = compile('label1:\ndb $55\nDJNZ label1');
  expect(bytes).toEqual([0x55, 0x10, 0xFD]);
});

test("Instruction CALL nn", () => {
  const bytes = compile('CALL $5522');
  expect(bytes).toEqual([0xCD, 0x22, 0x55]);
});

test("Instruction CALL NZ, nn", () => {
  const bytes = compile('CALL NZ, $5522');
  expect(bytes).toEqual([0xC4, 0x22, 0x55]);
});

test("Instruction CALL NZ, nn", () => {
  const bytes = compile('CALL NZ, $5522');
  expect(bytes).toEqual([0xC4, 0x22, 0x55]);
});

test("Instruction CALL NZ, nn", () => {
  const bytes = compile('CALL NZ, $5522');
  expect(bytes).toEqual([0xC4, 0x22, 0x55]);
});

test("Instruction CALL Z, nn", () => {
  const bytes = compile('CALL Z, $5522');
  expect(bytes).toEqual([0xCC, 0x22, 0x55]);
});

test("Instruction CALL NC, nn", () => {
  const bytes = compile('CALL NC, $5522');
  expect(bytes).toEqual([0xD4, 0x22, 0x55]);
});

test("Instruction CALL C, nn", () => {
  const bytes = compile('CALL C, $5522');
  expect(bytes).toEqual([0xDC, 0x22, 0x55]);
});

test("Instruction CALL PO, nn", () => {
  const bytes = compile('CALL PO, $5522');
  expect(bytes).toEqual([0xE4, 0x22, 0x55]);
});

test("Instruction CALL PE, nn", () => {
  const bytes = compile('CALL PE, $5522');
  expect(bytes).toEqual([0xEC, 0x22, 0x55]);
});

test("Instruction CALL P, nn", () => {
  const bytes = compile('CALL P, $5522');
  expect(bytes).toEqual([0xF4, 0x22, 0x55]);
});

test("Instruction CALL M, nn", () => {
  const bytes = compile('CALL M, $5522');
  expect(bytes).toEqual([0xFC, 0x22, 0x55]);
});

test("Instruction RET", () => {
  const bytes = compile('RET');
  expect(bytes).toEqual([0xC9]);
});

test("Instruction RET NZ", () => {
  const bytes = compile('RET NZ');
  expect(bytes).toEqual([0xC0]);
});

test("Instruction RET Z", () => {
  const bytes = compile('RET Z');
  expect(bytes).toEqual([0xC8]);
});

test("Instruction RET NC", () => {
  const bytes = compile('RET NC');
  expect(bytes).toEqual([0xD0]);
});

test("Instruction RET C", () => {
  const bytes = compile('RET C');
  expect(bytes).toEqual([0xD8]);
});

test("Instruction RET PO", () => {
  const bytes = compile('RET PO');
  expect(bytes).toEqual([0xE0]);
});

test("Instruction RET PE", () => {
  const bytes = compile('RET PE');
  expect(bytes).toEqual([0xE8]);
});

test("Instruction RET P", () => {
  const bytes = compile('RET P');
  expect(bytes).toEqual([0xF0]);
});

test("Instruction RET M", () => {
  const bytes = compile('RET M');
  expect(bytes).toEqual([0xF8]);
});

test("Instruction RETI", () => {
  const bytes = compile('RETI');
  expect(bytes).toEqual([0xED, 0x4D]);
});

test("Instruction RETN", () => {
  const bytes = compile('RETN');
  expect(bytes).toEqual([0xED, 0x45]);
});

test("Instruction RST p", () => {
  const bytes = compile('RST 0x08');
  expect(bytes).toEqual([0xCF]);
});

test("Instruction IN A, (n)", () => {
  const bytes = compile('IN A, ($55)');
  expect(bytes).toEqual([0xDB, 0x55]);
});

test("Instruction IN r, (C) with B", () => {
  const bytes = compile('IN B, (C)');
  expect(bytes).toEqual([0xED, 0x40]);
});

test("Instruction IN r, (C) with A", () => {
  const bytes = compile('IN A, (C)');
  expect(bytes).toEqual([0xED, 0x78]);
});


test("Instruction INI", () => {
  const bytes = compile('INI');
  expect(bytes).toEqual([0xED, 0xA2]);
});

test("Instruction INIR", () => {
  const bytes = compile('INIR');
  expect(bytes).toEqual([0xED, 0xB2]);
});

test("Instruction IND", () => {
  const bytes = compile('IND');
  expect(bytes).toEqual([0xED, 0xAA]);
});

test("Instruction INDR", () => {
  const bytes = compile('INDR');
  expect(bytes).toEqual([0xED, 0xBA]);
});

test("Instruction OUT (n), A", () => {
  const bytes = compile('OUT ($55), A');
  expect(bytes).toEqual([0xD3, 0x55]);
});

test("Instruction OUT (C), r", () => {
  const bytes = compile('OUT (C), B');
  expect(bytes).toEqual([0xED, 0x41]);
});

test("Instruction OUTI", () => {
  const bytes = compile('OUTI');
  expect(bytes).toEqual([0xED, 0xA3]);
});

test("Instruction OTIR", () => {
  const bytes = compile('OTIR');
  expect(bytes).toEqual([0xED, 0xB3]);
});

test("Instruction OUTD", () => {
  const bytes = compile('OUTD');
  expect(bytes).toEqual([0xED, 0xAB]);
});

test("Instruction OTDR", () => {
  const bytes = compile('OTDR');
  expect(bytes).toEqual([0xED, 0xBB]);
});

test("Statement EQU", () => {
  const bytes = compile('label1 EQU $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

test("Statement EQU with colon", () => {
  const bytes = compile('label1: EQU $55\nDB label1');
  expect(bytes).toEqual([0x55]);
});

// -------------------------------------------------------
// Labels
// -------------------------------------------------------

test("Label with a colon", () => {
  const bytes = compile('label1:');
  expect(bytes).toEqual([]);
});

test("Label without a colon", () => {
  const bytes = compile('label1');
  expect(bytes).toEqual([]);
});

test("Label with a name starting with the name of an instruction", () => {
  const bytes = compile('init:');
  expect(bytes).toEqual([]);
});

test("Label not defined", () => {
  compileWithError('ld a, label1');
});

test("Label transitive", () => {
  const bytes = compile('label1 equ label2\nlabel2 equ label3\nlabel3 equ $55\nld a, label1');
  expect(bytes).toEqual([0x3E, 0x55]);
});

test("Circular Labels", () => {
  compileWithError('label1 equ label2\nlabel2 equ label3\nlabel3 equ label1\nld a, label1');
});


// -------------------------------------------------------
// Data
// -------------------------------------------------------

test("Declaring bytes", () => {
  const bytes = compile('db $44, $01, $55');
  expect(bytes).toEqual([0x44, 0x01, 0x55]);
});

test("Declaring bytes with expressions", () => {
  const bytes = compile('db $44 + 2, $01 * 2, $55');
  expect(bytes).toEqual([0x46, 0x02, 0x55]);
});

test("Declaring string", () => {
  const bytes = compile('db "ABCDEF"');
  expect(bytes).toEqual([0x41, 0x42, 0x43, 0x44, 0x45, 0x46]);
});

test("Declaring null-terminated string", () => {
  const bytes = compile('dz "ABCDEF"');
  expect(bytes).toEqual([0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x00]);
});

test("Declaring strings", () => {
  const bytes = compile('db "ABCDEF", "abcdef"');
  expect(bytes).toEqual([0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66]);
});

test("Declaring words", () => {
  const bytes = compile('dw $22, $4455, $0102, $55AA');
  expect(bytes).toEqual([0x22, 0x00, 0x55, 0x44, 0x02, 0x01, 0xAA, 0x55]);
});

test("Declaring words with label", () => {
  const bytes = compile('values:\ndw label2*2+0x55\nlabel2:');
  expect(bytes).toEqual([0x59, 0x00]);
});

test("Declaring block with implicit value", () => {
  const bytes = compile('ds 10, 0xFF');
  expect(bytes).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with explicit value", () => {
  const bytes = compile('ds 10');
  expect(bytes).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
});

test("Declaring block with length from previous label", () => {
  const bytes = compile('db 0x00, 0x01, 0x02, 0x03\nlength:\nds length, 0xFF');
  expect(bytes).toEqual([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with length from following label", () => {
  compileWithError('db 0x00, 0x01, 0x02, 0x03\nds length, 0xFF\nlength:');
});

test("Declaring block with length from previous equ", () => {
  const bytes = compile('length equ 10\nds length, 0xFF');
  expect(bytes).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with length from following equ", () => {
  const bytes = compile('ds length, 0xFF\nlength equ 10');
  expect(bytes).toEqual([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
});

test("Declaring block with length dependent of the size", () => {
  compileWithError('length equ label1\ndb 0x55, 0x56, 0x57\nds length, 0xFF\nlabel1:\n db 0x44');
});

// -------------------------------------------------------
// Directives
// -------------------------------------------------------

test("Origin directive", () => {
  const bytes = compile('org $5544\nlabel1:\nld hl, label1');
  expect(bytes).toEqual([0x21, 0x44, 0x55]);
});

test("Origin directive with dot", () => {
  const bytes = compile('.org $5544\nlabel1:\nld hl, label1');
  expect(bytes).toEqual([0x21, 0x44, 0x55]);
});

test("Include", () => {
  const bytes = compile('include test.asm');
  expect(bytes).toEqual([]);
});

test("Include with dot", () => {
  const bytes = compile('.include test.asm');
  expect(bytes).toEqual([]);
});

test("Include with quotes", () => {
  const bytes = compile('include "test.asm"');
  expect(bytes).toEqual([]);
});

test("Output", () => {
  const bytes = compile('output test.P');
  expect(bytes).toEqual([]);
});

test("Output with dot", () => {
  const bytes = compile('.output test.P');
  expect(bytes).toEqual([]);
});

test("Output with quotes", () => {
  const bytes = compile('output "test.P"');
  expect(bytes).toEqual([]);
});

test("Output with SLD", () => {
  const bytes = compile('output test.P, sld');
  expect(bytes).toEqual([]);
});

test("Output with SLD and quotes", () => {
  const bytes = compile('output "test.P", sld');
  expect(bytes).toEqual([]);
});

test("Device", () => {
  const bytes = compile('device ZX81');
  expect(bytes).toEqual([]);
});

test("Device with dot", () => {
  const bytes = compile('.device ZX81');
  expect(bytes).toEqual([]);
});
