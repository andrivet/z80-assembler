import {ASTKinds, MatchAttempt, ParseResult, Program, Statement, SyntaxErr} from "../grammar/z80";
import {addLabel, addLabelExpression, getUnknownLabels, resetLabels} from "../compiler/Labels";
import {Byte, Bytes, bytes, getByteSize, isAbstract} from "../compiler/Ast";
import {AssemblerError} from "../compiler/Error";

export type Chunk = {
  address: string;
  bytes: string;
}

export type ProgramInfo = {
  bytes: bytes;
  outputName: string;
  outputSldName: string;
  address: number;
};

export function generate(result: ParseResult) {
  const prg = result.ast?.program;
  if(!prg) return [];

  resetLabels();
  computeEqualities(prg);
  computeVariableLabels(prg);

  const unknowns = getUnknownLabels().join(', ');
  if(unknowns.length > 0)
    throw new AssemblerError({line: 1, offset: 0, overallPos: 0}, `Unknown value for labels: ${unknowns}`);

  return generateProgramBytes(prg);
}

function computeEqualities(prg: Program) {
  for (const line of prg) {
    if(line.kind == ASTKinds.LineEqual)
      addLabelExpression(line.label.pos, line.label.name, line.e);
  }
}

// Compute labels with a value dependent of the code generated
function computeVariableLabels(prg: Program) {
  let address = 0;
  for (const line of prg) {
    if(line.kind == ASTKinds.LineStatement) {
      if(line.label) addLabel(line.label.pos, line.label.name, address);
      if(line.statement)
        address = computeAddress(address, line.statement);
    }
  }
}

function computeAddress(address: number, statement: Statement): number {
  return (statement.address == null) ?
    address + statement.bytes.reduce((r: number, c) => r + getByteSize(c), 0) :
    statement.address;
}

function generateProgramBytes(prg: Program): bytes {
  let address = 0;
  let bytes: bytes = [];
  for (const line of prg) {
    if(line.kind == ASTKinds.LineStatement && line.statement) {
      const chunk = generateBytes(address, line.statement.bytes);
      bytes = bytes.concat(chunk);
      address = computeAddress(address, line.statement);
    }
  }
  return bytes;
}

function generateBytes(address: number, bytes: Bytes): bytes {
    return bytes.reduce((r: bytes, c: Byte) => r.concat(isAbstract(c) ? c.generate(address) : [c]), [] as bytes)
}

export function format(bytes: number[], perLine: number): Chunk[] {
  let data: Chunk[] = [];
  let address = 0;
  while(address < bytes.length) {
    const chunk = bytes.slice(address, address + perLine);
    data = data.concat({
      address: address.toString(16).padStart(4, '0'),
      bytes: chunk.map(b => b.toString(16).padStart(2, '0')).join(' ')
    });
    address += perLine;
  }
  return data;
}

export function exportBytes(data: number[] | undefined) {
  if(!data) return;
  const bytes = Uint8Array.from(data);
  const blob = new Blob([bytes]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "bytes.dat";
  link.click();
}

function formatMatch(match: MatchAttempt) {
  if(match.kind === 'EOF') return " end of code";
  const not = match.negated ? 'not ' : '';
  return ` ${not}${match.literal}`;
}

export function formatError(err: SyntaxErr | string): string {
  if(!(err instanceof SyntaxErr)) return err;
  return `Expected one of${err.expmatches.map(m => formatMatch(m))}`
}
