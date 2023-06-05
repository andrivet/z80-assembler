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
import {addLabel, addLabelExpression, getLabelValue, isLabelUsed} from "./Labels";
import {AstElement, AstElements, getByteSize, isAbstract, } from "./Ast";


/**
 * Information about a compiled program.
 */
interface ProgramInfo {
  bytes: bytes;
  outputName: string;
  outputSldName: string;
  address: number;
}

/**
 * Compute, whenever possible, the value associated with labels.
 * @param address The starting address.
 * @param lines The lines (i.e. the AST)
 * @return the address that corresponds to the code after the lines (i.e the new starting address).
 */
function computeLabels(address: number, lines: Lines): number {
  if(lines.length <= 0) return address;
  computeEqualities(lines);
  return computeVariableLabels(address, lines);
}

/**
 * Compute the value of labels associated with equalities.
 * @param lines The lines (i.e. the AST)
 */
function computeEqualities(lines: Lines) {
  // For each line
  for (const line of lines) {
    // If it is an equality, add the label and its value (an expression)
    if(line.kind === ASTKinds.LineEqual)
      addLabelExpression(line.label.pos, line.label.name, line.equal.e);
    // If it is a statement, and it contains an inclusion, compute recursively the labels for those lines
    else if(line.kind === ASTKinds.LineStatement && line.statement?.kind === ASTKinds.Statement_1)
      computeEqualities(line.statement.inc.lines.lines);
  }
}

/**
 * Compute labels with a value dependent of the code generated
 * @param address The starting address.
 * @param lines The lines (i.e. the AST)
 * @return the address that corresponds to the code after the lines (i.e. the new starting address).
 */
function computeVariableLabels(address: number, lines: Lines): number {
  // For each line...
  for (const line of lines) {
    // If it is not a line statement, the address remains the same
    if(line.kind !== ASTKinds.LineStatement) continue;
    // If the line starts with a label, record it (and its address)
    if(line.label) addLabel(line.label.pos, line.label.name, address);
    // If it is a statement, compute the new address (after the statement)
    if(line.statement) address = computeAddress(address, line.statement);
  }
  return address;
}

/**
 * Compute the address following a statement.
 * @param address The starting address.
 * @param statement The statement.
 * @return the address that corresponds to the code after the statement (i.e. the new starting address).
 */
function computeAddress(address: number, statement: Statement): number {
  switch(statement.kind) {
      // If it is an include statement, compute recursively the labels for those lines
      case ASTKinds.Statement_1:
        return computeLabels(address, statement.linesinfo.lines);

      // If it is an instruction, increment the address by the number of bytes that will be generated
      case ASTKinds.Statement_2:
        return address + statement.elements.reduce((r: number, c) => r + getByteSize(c), 0);

      // If it is a directive, take either the address set by the directive (origin) or
      // increment the address by the number of bytes that will be generated
      case ASTKinds.Statement_3:
        return statement.address ?  statement.address :
          address + statement.elements.reduce((r: number, c) => r + getByteSize(c), 0);
  }
}

/**
 * Generate machine code bytes for an array of lines (i.e. an AST)
 * @param address The current address.
 * @param lines The lines (i.e. the AST)
 * @return An array of bytes (numbers)
 */
function generateLinesBytes(address: number, lines: Lines): bytes {
  // Start with an empty array of bytes
  let bytes: bytes = [];
  // For each line...
  for (const line of lines) {
    // If it is not a statement, take the next line
    if(line.kind !== ASTKinds.LineStatement || !line.statement) continue;
    switch(line.statement?.kind) {
      // If it is an include, generate the bytes for those lines and concatenate the result with the already computed bytes
      case ASTKinds.Statement_1: bytes = bytes.concat(generateLinesBytes(address, line.statement.linesinfo.lines)); break;
      // Otherwise, generate bytes for the AST elements of the line and concatenate the result with the already computed bytes
      case ASTKinds.Statement_2:
      case ASTKinds.Statement_3: bytes = bytes.concat(generateElementsBytes(address, line.statement.elements)); break;
    }
    // Compute the address after the line
    address = computeAddress(address, line.statement);
  }
  return bytes;
}

/**
 * Generate machine code bytes for some AST elements.
 * @param address The current address.
 * @param elements The AST elements.
 */
function generateElementsBytes(address: number, elements: AstElements): bytes {
  // The element is either concrete (i.e. the raw byte) or abstract. In the later case, ask the abstract
  // AST element to generate its machine code.
  // Concatenate all the generated bytes.
  return elements.reduce((r: bytes, c: AstElement) => r.concat(isAbstract(c) ? c.generate(address) : [c]), [] as bytes)
}

/**
 * Generate debugging information (in Source Level Debugging format)
 * @param lines An array of lines with their associated filename
 * @return The debugging information (in Source Level Debugging format)
 */
function generateSld(lines: LinesInfo): string {
  const filename = lines.filename;
  // Generate the header
  const header = '|SLD.data.version|1\n' +
    `${filename}|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0\n`;
  // Generate SLD for the lines
  return header + generateSldLines(0, lines);
}

/**
 * Generate debugging information (in Source Level Debugging format) for the lines.
 * @param lines An array of lines with their associated filename
 * @return The debugging information (in Source Level Debugging format)
 */
function generateSldLines(address: number, lines: LinesInfo): string {
  const filename = lines.filename;
  let lineNumber = 1;
  let content = '';
  // For each line...
  for(const line of lines.lines) {
    // Generate SLD for labels and for instruction tracing
    content += generateSldLabel(filename, lineNumber, line) +
               generateSldTrace(filename, lineNumber, line, address);
    lineNumber += 1; // Next line number
    // If it is a statement, compute the new address
    if(line.kind === ASTKinds.LineStatement && line.statement)
      address = computeAddress(address, line.statement);
  }
  return content;
}

/**
 * Generate a SLD Label for an AST line
 * @param filename The current filename
 * @param lineNumber The current line number
 * @param line The AST line
 */
function generateSldLabel(filename: string, lineNumber: number, line: Line): string {
  // If there is no label on the line, there is nothing to generate
  if(!line.label) return '';
  // Get the value associated with the label
  const value = getLabelValue(line.label.name, false);
  // Is this label used in the program?
  const isUsed = isLabelUsed(line.label.name);

  // Generate a SLD line like:
  // ./includes/zx81-characters.asm|3||0|-1|0|L|,_SPC,,+equ,+used
  if(line.kind === ASTKinds.LineEqual)
      return `${filename}|${lineNumber}||0|-1|${value}|L|,${line.label.name},,+equ${isUsed ? ',+used' : ''}\n`;

  // Generate a SLD line like:
  // ./includes/zx81-system-variables.asm|12||0|0|16393|L|,VERSN,
  return `${filename}|${lineNumber}||0|0|${value}|L|,${line.label.name},${isUsed ? ',+used' : ''}\n`;
}

/**
 * Generate a SLD Instruction Tracing for an AST line
 * @param filename The current filename
 * @param lineNumber The current line number
 * @param line The AST line
 * @param address The current address (i.e. the address of the line)
 */
function generateSldTrace(filename: string, lineNumber: number, line: Line, address: number): string {
  // If it is not a statement, there is nothing to generate
  if(line.kind !== ASTKinds.LineStatement) return '';

  // Generate a SLD line like:
  // main.zx81|23||0|0|16531|T|
  let content = line.statement?.kind === ASTKinds.Statement_2 ? `${filename}|${lineNumber}||0|0|${address}|T|\n` : '';

  // If the statement is an include, generate recursively the SLD
  if(line.statement?.kind === ASTKinds.Statement_1) {
    content += generateSldLines(address,
      {filename: line.statement.inc.name.raw, lines: line.statement.linesinfo.lines});
  }
  return content;
}

export {computeLabels, generateLinesBytes, generateSld, ProgramInfo};
