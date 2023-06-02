/**
 * Z80 Assembler in Typescript
 *
 * File:        Generator.ts
 * Description: Generate bytes and SLD
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {ASTKinds, Line, Lines, Statement} from "../grammar/z80";
import {bytes, LinesInfo} from '../types/Types';
import {addLabel, addLabelExpression, getLabelValue, isLabelUsed} from "../compiler/Labels";
import {Byte, Bytes, getByteSize, isAbstract, } from "../compiler/Ast";

interface Chunk {
  address: string;
  bytes: string;
}

interface ProgramInfo {
  bytes: bytes;
  outputName: string;
  outputSldName: string;
  address: number;
}

function computeLabels(address: number, lines: Lines): number {
  if(lines.length <= 0) return address;
  computeEqualities(lines);
  return computeVariableLabels(address, lines);
}

function computeEqualities(lines: Lines) {
  for (const line of lines) {
    if(line.kind === ASTKinds.LineEqual)
      addLabelExpression(line.label.pos, line.label.name, line.equal.e);
    else if(line.kind === ASTKinds.LineStatement && line.statement?.kind === ASTKinds.Statement_1)
      computeEqualities(line.statement.inc.lines.lines);
  }
}

// Compute labels with a value dependent of the code generated
function computeVariableLabels(address: number, lines: Lines): number {
  for (const line of lines) {
    if(line.kind !== ASTKinds.LineStatement) continue;
    if(line.label) addLabel(line.label.pos, line.label.name, address);
    if(line.statement) address = computeAddress(address, line.statement);
  }
  return address;
}

function computeAddress(address: number, statement: Statement): number {
  switch(statement.kind) {
      case ASTKinds.Statement_1:
        return computeLabels(address, statement.linesinfo.lines);

      case ASTKinds.Statement_2:
        return address + statement.bytes.reduce((r: number, c) => r + getByteSize(c), 0);

      case ASTKinds.Statement_3:
        return statement.address ?  statement.address :
          address + statement.bytes.reduce((r: number, c) => r + getByteSize(c), 0);
  }
}

function generateBytes(lines: Lines): bytes {
  let address = 0;
  let bytes: bytes = [];
  for (const line of lines) {
    if(line.kind !== ASTKinds.LineStatement || !line.statement) continue;
    switch(line.statement?.kind) {
      case ASTKinds.Statement_1: bytes = bytes.concat(generateBytes(line.statement.linesinfo.lines)); break;
      case ASTKinds.Statement_2:
      case ASTKinds.Statement_3: bytes = bytes.concat(generateBytesAtAddress(address, line.statement.bytes)); break;
    }
    address = computeAddress(address, line.statement);
  }
  return bytes;
}

function generateBytesAtAddress(address: number, bytes: Bytes): bytes {
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

function generateSld(lines: LinesInfo): string {
  const filename = lines.filename;
  const header = '|SLD.data.version|1\n' +
    `${filename}|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0\n`;
  return header + generateSldLines(lines);
}

function generateSldLines(lines: LinesInfo): string {
  const filename = lines.filename;
  let lineNumber = 1;
  let address = 0;
  let content = '';
  for(const line of lines.lines) {
    content += generateSldLabel(filename, lineNumber, line) + generateSldTrace(filename, lineNumber, line, address);
    lineNumber += 1;
    if(line.kind === ASTKinds.LineStatement && line.statement)
      address = computeAddress(address, line.statement);
  }
  return content;
}

function generateSldLabel(filename: string, lineNumber: number, line: Line): string {
  if(!line.label) return '';
  const value = getLabelValue(line.label.name, false);
  const isUsed = isLabelUsed(line.label.name);

  // ./includes/zx81-characters.asm|3||0|-1|0|D|_SPC
  // ./includes/zx81-characters.asm|3||0|-1|0|L|,_SPC,,+equ,+used
  if(line.kind === ASTKinds.LineEqual)
      return `${filename}|${lineNumber}||0|-1|${value}|D|${line.label.name}\n` +
             `${filename}|${lineNumber}||0|-1|${value}|L|,${line.label.name},,+equ${isUsed ? ',+used' : ''}\n`;

  // ./includes/zx81-system-variables.asm|12||0|0|16393|F|VERSN
  // ./includes/zx81-system-variables.asm|12||0|0|16393|L|,VERSN,
  return `${filename}|${lineNumber}||0|0|${value}|F|${line.label.name}\n` +
         `${filename}|${lineNumber}||0|0|${value}|L|,${line.label.name},${isUsed ? ',+used' : ''}\n`;
}

function generateSldTrace(filename: string, lineNumber: number, line: Line, address: number): string {
  if(line.kind !== ASTKinds.LineStatement) return '';
  // main.zx81|23||0|0|16531|T|
  let content = line.statement?.kind === ASTKinds.Statement_2 ? `${filename}|${lineNumber}||0|0|${address}|T|\n` : '';
  if(line.statement?.kind === ASTKinds.Statement_1)
    content += generateSldLines({filename: line.statement.inc.name.raw, lines: line.statement.linesinfo.lines});
  return content;
}

export {formatBytes, computeLabels, generateBytes, generateSld, Chunk, ProgramInfo};
