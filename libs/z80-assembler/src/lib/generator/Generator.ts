import {ASTKinds, MatchAttempt, ParseResult, Program, Statement, SyntaxErr} from "../grammar/z80";
import {addLabel, addLabelExpression, getUnknownLabels, resetLabels} from "../compiler/Labels";
import {Byte, Bytes, bytes, getByteSize, isAbstract} from "../compiler/Ast";
import {CompilationError} from "../compiler/Error";

type Chunk = {
  address: string;
  bytes: string;
}

type ProgramInfo = {
  bytes: bytes;
  outputName: string;
  outputSldName: string;
  address: number;
};

function generate(result: ParseResult) {
  const prg = result.ast?.program;
  if(!prg) return [];

  resetLabels();
  computeEqualities(prg);
  computeVariableLabels(prg);

  const unknowns = getUnknownLabels().join(', ');
  if(unknowns.length > 0)
    throw new CompilationError({line: 1, offset: 0, overallPos: 0}, `Unknown value for labels: ${unknowns}`);

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

function formatBytes(bytes: number[], perLine: number): Chunk[] {
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

export {formatBytes, generate, Chunk, ProgramInfo};
