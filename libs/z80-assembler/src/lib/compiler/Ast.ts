import {ByteValue, Expression, Line, PosInfo, WordValue} from "../grammar/z80";
import {addLabel, getLabelValue} from "./Labels";
import {CompilationError} from "./Error";
import {parseData} from "../compiler/Compiler";

export type byte = number;
export type bytes = byte[];
export type Address = number | null;

export interface LinesInfo {
  lines: Line[];
  filename: string;
}

export type EvalFunc = () => number | null;

export interface AbstractByte {
  get size(): number;
  generate(instructionAddress: number): bytes;
}

class ByteBlock implements AbstractByte {
  private readonly filename = parseData.fileName;

  constructor(
    private pos0: PosInfo,
    private length: Expression,
    private pos1: PosInfo | undefined,
    private value: Expression | undefined) { }

  get size(): number {
    const size = this.length.eval();
    if(size == null) throw new CompilationError(this.filename, this.pos0, "Unknown size for the data block");
    if(size < 0) throw new CompilationError(this.filename, this.pos0, `Invalid size size for the data block: ${size}`);
    return size;
  }

  private getValue() {
    if(this.value == null || this.pos1 == null) return 0;
    let v =  this.value.eval();
    if(v == null) throw new CompilationError(this.filename, this.pos1, `Not able to determine a value`);
    if(v < -256 || v > 255) throw new CompilationError(this.filename, this.pos1, `Invalid 8-bits value: ${v}`);
    if(v < 0) v = 256 + v;
    return v;
  }

  generate(_: number): bytes {
    const array = new Array<byte>(this.size);
    array.fill(this.getValue());
    return array;
  }
}

class Byte16 implements AbstractByte {
  private readonly filename = parseData.fileName;
  constructor(private pos: PosInfo, private expression: Expression) { }
  get size(): number { return 2; }
  generate(_: number): bytes {
    let v = this.expression.eval();
    if(v == null) throw new CompilationError(this.filename, this.pos, `Not able to determine the 16-bits value`);
    if(v < -65536 || v > 65535) throw new CompilationError(this.filename, this.pos, `Invalid 16-bits value: ${v}`);
    if(v < 0) v = 65536 + v;
    return [v & 0x00FF, (v & 0xFF00) >> 8];
  }
}

class Byte8 implements AbstractByte {
  private readonly filename = parseData.fileName;
  constructor(private pos: PosInfo, private expression: Expression) {}
  get size(): number { return 1; }
  generate(_: number): bytes {
    let v = this.expression.eval();
    if(v == null) throw new CompilationError(this.filename, this.pos, `Not able to determine the 8-bits value`);
    if(v < -256 || v > 255) throw new CompilationError(this.filename, this.pos, `Invalid 8-bits value: ${v}`);
    if(v < 0) v = 256 + v;
    return [v];
  }
}

class ByteNeg8 implements AbstractByte {
  private readonly filename = parseData.fileName;
  constructor(private pos: PosInfo, private expression: Expression) {}
  get size(): number { return 1; }
  generate(_: number): bytes {
    let v = this.expression.eval();
    if(v == null) throw new CompilationError(this.filename, this.pos, `Not able to determine the 8-bits value`);
    v = -v;
    if(v < -256 || v > 255) throw new CompilationError(this.filename, this.pos, `Invalid 8-bits value: ${v}`);
    if(v < 0) v = 256 + v;
    return [v];
  }
}

class ByteJr implements AbstractByte {
  private readonly filename = parseData.fileName;
  constructor(private pos: PosInfo, private expression: Expression) {}
  get size(): number { return 1; }
  generate(_: number): bytes {
    let offset = this.expression.eval();
    if(offset == null) throw new CompilationError(this.filename, this.pos, `Not able to determine the offset value`);
    if(offset < -126 || offset > 129) throw new CompilationError(this.filename, this.pos,`Invalid offset for JR instruction: ${offset}`);
    offset -= 2;
    if(offset < 0) offset = 256 + offset;
    return [offset];
  }
}

class ByteJrRelative implements AbstractByte {
  private readonly filename = parseData.fileName;
  constructor(private pos: PosInfo, private label: string) {}
  get size(): number { return 1; }
  generate(instructionAddress: number): bytes {
    const targetAddress = getLabelValue(this.label);
    if(targetAddress == null) throw new CompilationError(this.filename, this.pos, `Not able to determine the value of label '${this.label}'`);
    let offset = targetAddress - instructionAddress;
    if(offset < -126 || offset > 129) throw new CompilationError(this.filename, this.pos,`Label ${this.label} is to far from JR instruction: ${offset} bytes`);
    offset -= 2;
    if(offset < 0) offset = 256 + offset;
    return [offset];
  }
}

class ByteLabel implements AbstractByte {
  private readonly filename = parseData.fileName;
  constructor(private pos: PosInfo, private name: string, private expression: Expression) {}
  get size(): number { return 0; }
  generate(_: number): bytes {
    const target = this.expression.eval();
    if(target == null) throw new CompilationError(this.filename, this.pos, `Not able to determine the address of label '${this.name}'`);
    addLabel(this.pos, this.name, target);
    return []; }
}

export type Byte = number | AbstractByte;
export type Bytes = Byte[];

export function isAbstract(byte: Byte): byte is AbstractByte {
  return (byte as AbstractByte).generate !== undefined;
}

export function getByteSize(byte: Byte): number {
  return isAbstract(byte) ? byte.size : 1;
}

export function low(value: number) {
  return value & 0x00FF;
}

export function high(value: number) {
  return (value & 0xFF00) >> 8;
}

interface Evaluable { eval: EvalFunc; }
interface InnerExpression<E extends Evaluable> { e: E; }
interface BinaryOperation { (a: number, b: number): number }
interface UnaryOperation { (a: number): number }

export function binaryOperation<
  Operation extends BinaryOperation,
  Inner extends Evaluable,
  Left extends InnerExpression<Inner>,
  Right extends Evaluable>(left: Left[], right: Right, op: Operation): EvalFunc {
  return () => {
    const rightValue = right.eval();
    // If the right value is null, the result is null
    if(rightValue == null) return null;
    // If the left side is empty, we return the right side
    if(left.length <= 0) return rightValue;
    const leftmostValue = left[0].e.eval();
    const partial = left.slice(1).reduce((r: number | null, c: Left) => {
      const currentValue = c.e.eval();
      return (r == null || currentValue == null) ? null : op(r, currentValue);
    }, leftmostValue);
    return partial == null ? null : op(partial, rightValue);
  }
}

type BinaryOperationsMap = { [key: string]: BinaryOperation };
type UnaryOperationsMap = { [key: string]: UnaryOperation };
interface InnerOp<E extends Evaluable> extends InnerExpression<E>{ op: string; }

export function binaryOperations<
  Inner extends Evaluable,
  Left extends InnerOp<Inner>,
  Right extends Evaluable>(left: Left[], right: Right, map: BinaryOperationsMap): EvalFunc {
  return () => {
    const rightValue = right.eval();
    // If the right value is null, the result is null
    if(rightValue == null) return null;
    // If the left side is empty, we return the right side
    if(left.length <= 0) return rightValue;
    const leftmost = left[0];
    const partial = left.slice(1).reduce((r: number | null, c: Left) => {
      const currentValue = c.e.eval();
      return (r == null || currentValue == null) ? null : map[c.op](r, currentValue);
    }, leftmost.e.eval());
    return partial == null ? null : map[leftmost.op](partial, rightValue);
  }
}

export function unaryOperation<
  Operation extends UnaryOperation,
  E extends Evaluable>(e: E, op: Operation): EvalFunc {
  return () => { const value = e.eval(); return (value == null) ? null : op(value); }
}

export function unaryOperations<
  E extends Evaluable>(e: E, op: string, map: UnaryOperationsMap): EvalFunc {
  return () => { const value = e.eval(); return (value == null) ? null : map[op](value); }
}


export const operatorOr = (a: number, b: number) => a | b;
export const operatorXor = (a: number, b: number) => a ^ b;
export const operatorAnd = (a: number, b: number) => a & b;
export const operatorLeftShift = (a: number, b: number) => a << b;
export const operatorRightShift = (a: number, b: number) => a >> b;
export const operatorAdd = (a: number, b: number) => a + b;
export const operatorSub = (a: number, b: number) => a - b;
export const operatorMul = (a: number, b: number) => a * b;
export const operatorDiv = (a: number, b: number) => Math.trunc(a / b);
export const operatorModulo = (a: number, b: number) => a % b;
export const operatorPlus = (a: number) => +a;
export const operatorNeg = (a: number) => -a;
export const operatorInvert = (a: number) => ~a;
export const operatorIdentity = (a: number) => a;

export function value16LE(pos: PosInfo, e: Expression): Byte {
  return new Byte16(pos, e);
}

export function value8(pos: PosInfo, e: Expression): Byte {
  return new Byte8(pos, e);
}

export function svalue8(pos: PosInfo, s: string, e: Expression): Byte {
  return s === '-' ? new ByteNeg8(pos, e) : new Byte8(pos, e);
}

export function jrOffset(pos: PosInfo, e: Expression): Byte {
  return new ByteJr(pos, e);
}

export function jrRelativeOffset(pos: PosInfo, label: string): Byte {
  return new ByteJrRelative(pos, label);
}

export function valueLabel(pos: PosInfo, name: string, e: Expression): Byte {
  return new ByteLabel(pos, name, e);
}

export interface InnerByte { inner: ByteValue }
export interface InnerWord { inner: WordValue }

export function dataBytes(_: PosInfo, data0: ByteValue, data: InnerByte[]): Bytes {
  return data.reduce((r, c) => r.concat(c.inner.bytes), data0.bytes);
}

export function dataBytesZero(pos0: PosInfo, data0: ByteValue, data: InnerByte[]): Bytes {
  return dataBytes(pos0, data0, data).concat([0]);
}

export function dataWords(_: PosInfo, data0: WordValue, data: InnerWord[]): Bytes {
  return data.reduce((r, c) => r.concat(c.inner.bytes), data0.bytes);
}

export function dataBlock(pos0: PosInfo, length: Expression, pos1: PosInfo | undefined, value: Expression | undefined): Byte {
  return new ByteBlock(pos0, length, pos1, value);
}


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

export function parseSimpleChar(pos: PosInfo, raw: string): number[] {
  const code = raw.charCodeAt(0);
  if(code > 127) throw new CompilationError(parseData.fileName, pos,
    "Only ASCII characters are supported, use escape for other values.")
  return [code];
}

export function parseSimpleEscape(value: string): number[] {
  switch(value) {
    case 'a': return [0x07];
    case 'b': return [0x08];
    case 'e': return [0x1B];
    case 'f': return [0x0C];
    case 'n': return [0x0A];
    case 'r': return [0x0D];
    case 't': return [0x09];
    case 'v': return [0x0B];

    case '\'':
    case '"':
    case '?':
    case '\\':
    default:
      return [value.charCodeAt(0)];
  }
}

export function parseOctalEscape(pos: PosInfo, value: string): number[] {
  const v = parseInt(value, 8);
  if(v > 255) throw new CompilationError(parseData.fileName, pos,
    `Number '${value}' in octal escape sequence does not fit into a byte.`);
  return [v];
}

export function parseHexadecimalEscape(pos: PosInfo, value: string): number[] {
  const v = parseInt(value, 16);
  if(v > 255) throw new CompilationError(parseData.fileName, pos,
    `Number '${value}' in hexadecimal escape sequence does not fit into a byte.`);
  return [v];
}

const zx81chars = new Map<string, number>([
  ['£', 0x0C], ['$', 0x0D], [':', 0x0E], ['?', 0x0F],
  ['(', 0x10], [')', 0x11], ['>', 0x12], ['<', 0x13], ['=', 0x14], ['+', 0x15], ['-', 0x16], ['*', 0x17],
  ['/', 0x18], [';', 0x19], [',', 0x1A], ['.', 0x1B]
]);


function parseZX81Char(pos: PosInfo, c: string): number {
  if(c >= 'A' && c < 'Z') return c.charCodeAt(0) - 0x41 + 0x26;
  if(c >= 'a' && c < 'z') return  c.charCodeAt(0) - 0x61 + 0xA6;
  if(c >= '0' && c < '9') return c.charCodeAt(0) - 0x30 + 0x1C;
  if(!zx81chars.has(c)) throw new CompilationError(parseData.fileName, pos,
    `Invalid ZX81 character: ${c}`);
  return zx81chars.get(c)!;
}

export function parseZX81String(pos: PosInfo, str: string) {
  const chars = [...str];
  return chars.map(c => parseZX81Char(pos, c));
}
