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
import {addLabel, addLabelExpression, getLabelValue, isLabelUsed, resetLabelsRecursion} from "./Labels";
import {AstElement, AstElements, getByteSize, isAbstract} from "./Ast";
import {parseData} from "./Compiler";


/**
 * Information about a compiled program.
 */
interface ProgramInfo {
  // Bytes of the compiled program.
  bytes: bytes;
  // Name of the binary file.
  outputName: string;
  // Name if the SLD file.
  outputSldName: string;
  // Next address after the compiled bytes.
  address: number;
}

/**
 * Compute, whenever possible, the value associated with labels.
 * @param address The starting address.
 * @param infos The lines (i.e. the AST)
 * @return the address that corresponds to the code after the lines (i.e. the new starting address).
 */
function computeLabels(address: number, infos: LinesInfo[]): number {
  return infos.reduce((r: number, c: LinesInfo) => {
    if(c.lines.length <= 0) return r;
    computeEqualities(c.lines);
    return computeVariableLabels(r, c.lines)
  }, address);
}

/**
 * Compute the value of labels associated with equalities.
 * @param lines The lines (i.e. the AST)
 */
function computeEqualities(lines: Lines) {
  // For each line...
  for (const line of lines) {
    resetLabelsRecursion();
    // If it is an equality, add the label and its value (an expression).
    if(line.kind === ASTKinds.LineEqual)
      addLabelExpression(line.label.pos, line.label.name, line.equal.e);
    // If it is a statement, and it contains an inclusion, compute recursively the labels for those lines.
    else if(line.kind === ASTKinds.LineStatement && line.statement?.kind === ASTKinds.Statement_1)
      computeEqualities(line.statement.inc.info.lines);
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
    // If it is not a line statement, the address remains the same.
    if(line.kind !== ASTKinds.LineStatement) continue;
    // If the line starts with a label, record it (and its address).
    if(line.label) addLabel({filename: parseData.fileName, pos: line.label.pos}, line.label.name, address);
    // If it is a statement, compute the new address (after the statement).
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
    case ASTKinds.Statement_1:
      // If it is an include statement, compute recursively the labels for those lines.
      return computeLabels(address, [statement.info]);

    case ASTKinds.Statement_2:
      // If it is an instruction, increment the address by the number of bytes that will be generated.
      return address + statement.elements.reduce((r: number, c) => r + getByteSize(c), 0);

    case ASTKinds.Statement_3:
      // If it is a directive, take either the address set by the directive (origin) or
      // increment the address by the number of bytes that will be generated.
      return statement.address ?  statement.address :
        address + statement.elements.reduce((r: number, c) => r + getByteSize(c), 0);
  }
}

interface GenerationData {
  bytes: bytes;
  sld: string;
  address: number;
}

/**
 * Generate machine code bytes and SLD for an array of lines (i.e. an AST)
 * @param mainfile Main file name
 * @param address The current address.
 * @param infos The lines (i.e. the AST) with the associated filename
 * @return An array of bytes (numbers), debug data and the next address
 */
function generate(mainfile: string, address: number, infos: LinesInfo[]): GenerationData {
  // Generate the SLD header.
  const header = '|SLD.data.version|1\n' +
    `${mainfile}|1||0|-1|-1|Z|pages.size:65536,pages.count:32,slots.count:1,slots.adr:0\n`;
  const generated = generateLines(address, infos);
  return {bytes: generated.bytes, sld: header + generated.sld, address: address};
}

/**
 * Generate machine code bytes and SLD for an array of lines (i.e. an AST)
 * @param address The current address.
 * @param infos The lines (i.e. the AST) with the associated filename
 * @return An array of bytes (numbers), debug data and the next address
 */
function generateLines(address: number, infos: LinesInfo[]): GenerationData {
  // Start with an empty array of bytes.
  let bytes: bytes = [];
  let sld = '';
  let end = false;

  // For each file...
  for(const info of infos) {
    // Each file starts at line 1.
    let lineNumber = 1;
    // For each line...
    for (const line of info.lines) {
      // If it is not a statement, take the next line.
      if (line.kind !== ASTKinds.LineStatement || !line.statement) {
        sld += generateSld(info.filename, lineNumber, address, line);
        lineNumber += 1; // Next line
        continue;
      }

      switch (line.statement?.kind) {
        case ASTKinds.Statement_1: {
          // If it is an include, generate the bytes for those lines and concatenate the result with the already computed bytes.
          const generated = generateLines(address, [line.statement.info]);
          bytes = bytes.concat(generated.bytes);
          sld += generated.sld;
          address = generated.address;
        }
        break;

        case ASTKinds.Statement_2:
        case ASTKinds.Statement_3: {
          // Generate bytes for the AST elements of the line and concatenate the result with the already computed bytes.
          bytes = bytes.concat(generateElements(address, line.statement.elements));
          sld += generateSld(info.filename, lineNumber, address, line);
          // Compute the address after the line.
          address = computeAddress(address, line.statement);
        }
        break;
      }

      // Special case for end directive
      if(line.statement.kind === ASTKinds.Statement_3 && line.statement.dir.kind === ASTKinds.Directive_5) {
        end = true;
        break;
      }

      if(end) break;
      lineNumber += 1; // Next line
    }
  }

  return {bytes: bytes, sld: sld, address: address};
}

/**
 * Generate machine code bytes for some AST elements.
 * @param address The current address.
 * @param elements The AST elements.
 */
function generateElements(address: number, elements: AstElements): bytes {
  // The element is either concrete (i.e. the raw byte) or abstract. In the later case, ask the abstract
  // AST element to generate its machine code. Concatenate all the generated bytes.
  return elements.reduce((r: bytes, c: AstElement) =>
    r.concat(isAbstract(c) ? c.generate(address) : [c]), [] as bytes)
}

/**
 * Generate debugging information (in Source Level Debugging format) for the lines.
 * @param filename Name of the file parsed
 * @param lineNumber Number of the current line in source code
 * @param address Address for the line
 * @param line Line of code
 * @return The debugging information (in Source Level Debugging format)
 */
function generateSld(filename: string, lineNumber: number, address: number, line: Line): string {
  // Generate SLD for labels and for instruction tracing.
  return generateSldLabel(filename, lineNumber, line, address) +
         generateSldTrace(filename, lineNumber, line, address);
}

/**
 * Generate a SLD Label for an AST line
 * @param filename The current filename
 * @param lineNumber The current line number
 * @param line The AST line
 * @param address Address for the line
 */
function generateSldLabel(filename: string, lineNumber: number, line: Line, address: number): string {
  // If there is no label on the line, there is nothing to generate.
  if(!line.label) return '';
  // Get the value associated with the label.
  const value = getLabelValue(address, line.label.name, {filename: filename,
      pos: {line: lineNumber, offset: 0, overallPos: 0}}, false, true);
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
  // If it is not a statement, there is nothing to generate.
  if(line.kind !== ASTKinds.LineStatement) return '';

  // Generate a SLD line like:
  // main.zx81|23||0|0|16531|T|
  return line.statement?.kind === ASTKinds.Statement_2 ? `${filename}|${lineNumber}||0|0|${address}|T|\n` : '';
}

export {computeLabels, generate, ProgramInfo};
