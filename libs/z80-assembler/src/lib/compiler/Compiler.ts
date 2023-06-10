/**
 * Z80 Assembler in Typescript
 *
 * File:        Compiler.ts
 * Description: Compiler (assembler)
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Line, Parser, PosInfo} from "../grammar/z80";
import {LinesInfo, CompilationInfo} from "../types/Types";
import {CompilationError} from "../types/Error";
import {computeLabels, generateLinesBytes, generateSld} from "./Generator";
import {getUnknownLabels, resetLabels} from "./Labels";
import {
  assetBasicEnd,
  assetBasicLine1,
  assetBasicLine2,
  assetCharacters,
  assetDisplay,
  assetSystemVariables
} from "./Assets";

/**
 * Type of the internal data.
 */
interface ParseDate {
  // The name of the output as declared by the output directive.
  outputName: string,
  // The name of the SLD file as declared by the output directive.
  sldName: string,
  // The name of the device as declared by the device directive.
  deviceName: string,
  // The base path of first file compiled and that will be used to load included files
  basePath: string,
  // The base name of the current file compiled. It changes when a file is included and parsed.
  fileName: string,
  // The function to use when including a file
  getFileCode: (filename: string) => string //
}

/**
 * Internal data (i.e. globals).
 * Unfortunately, tsPEG does not allow to declare a context for the parsing.
 * So instead, we use this ugly global.
 */
const parseData: ParseDate = {
  outputName: "",
  sldName: "",
  deviceName: "",
  basePath: '',
  fileName: '',
  getFileCode: () => ''
};

/**
 * Set the outputs names (output directive)
 * @param filename Filename for the binary.
 * @param sld Filename for the SLD.
 */
function setOutputName(filename: string, sld?: string) {
  parseData.outputName = filename;
  parseData.sldName = sld ? sld : filename + '.sld';
}

/**
 * Set the name of the target (device directive) and do special processing for zx81 targets.
 * @param pos Position of the device directive.
 * @param name The name of the device
 */
function setDeviceName(pos: PosInfo, name: string): LinesInfo[] {
  parseData.deviceName = name.toLowerCase();
  if(name === 'zx81') return specialProcessing(pos);
  return [];
}

function specialProcessing(pos: PosInfo): LinesInfo[] {
  return includeFile(pos, assetCharacters)
    .concat(includeFile(pos, assetSystemVariables))
    .concat(includeFile(pos, assetBasicLine1));
}

function postProcessing(pos: PosInfo, lines: Line[]): LinesInfo[] {
  return [{filename: parseData.fileName, lines}]
    .concat(includeFile(pos, assetBasicLine2))
    .concat(includeFile(pos, assetDisplay))
    .concat(includeFile(pos, assetBasicEnd));
}

/**
 * Include an assembly file (include directive).
 * @param pos Position of the include directive.
 * @param filename The filename of the file to be included.
 */
function includeFile(pos: PosInfo, filename: string): LinesInfo {
  // Ask the code for the file to be included
  const code = parseData.getFileCode(parseData.basePath + filename);

  // It is not possible to attach a context to the parsing, so use this dirty trick
  const oldFileName = parseData.fileName;
  parseData.fileName = filename;
  const parsed = parseCode(code);
  parseData.fileName = oldFileName;

  // Return the lines (AST) and the associated filename
  return {lines: parsed, filename: filename};
}

/**
 * Parse some assembly code
 * @param code The code to parse.
 * @return An array of lines i.e. the AST.
 */
function parseCode(code: string): Line[] {
  // If the code does not end with a new line, add it.
  if(!code.endsWith('\n')) code += '\n';
  // Declare a parser for the code
  const parser = new Parser(code);
  // Parse the code
  const result = parser.parse();
  // If there is an error, raise an exception
  if(result.errs.length > 0)
    throw CompilationError.fromSyntaxErr(parseData.fileName, result.errs[0])
  // Returns the lines, i.e. the AST
  return result.ast?.infos ?? [];
}

/**
 * Get the base path of a file path.
 * @param filepath The file path.
 */
function getBasePath(filepath: string): string {
  let index = filepath.lastIndexOf('/');
  if(index === -1)
    index = filepath.lastIndexOf('\\');
  if(index === -1)
    return '';
  return filepath.substring(0, index + 1);
}

/**
 * Get the base name of a file path.
 * @param filepath The file path.
 */
function getBaseName(filepath: string): string {
  let index = filepath.lastIndexOf('/');
  if(index === -1)
    index = filepath.lastIndexOf('\\');
  if(index === -1)
    return filepath;
  return filepath.substring(index + 1);
}

/**
 * Compile an assembly source code.
 * @param filepath The file path of the source code.
 * @param code The assembly source code.
 * @param getFileCode A function to get the content of included files.
 */
function compile(filepath: string, code: string, getFileCode: (filename: string) => string): CompilationInfo {
  const filename = getBaseName(filepath);
  // Set default values globally
  parseData.outputName = "program.P";
  parseData.basePath = getBasePath(filepath);
  parseData.fileName = filename;
  parseData.getFileCode = getFileCode;

  try {
    // Reset the labels
    resetLabels();
    // Parse this source code
    const parsed = parseCode(code);
    // Compute the value of the labels
    computeLabels(0, parsed);
    // Do we have labels with unknown values?
    const unknowns = getUnknownLabels().join(', ');
    if(unknowns.length > 0)
      throw new CompilationError(parseData.fileName, {line: 1, offset: 0, overallPos: 0},
        `Unknown value for labels: ${unknowns}`);

    // Generate the bytes, the SLD and return them
    return {
      outputName: parseData.outputName,
      bytes: generateLinesBytes(0, parsed),
      sld: generateSld({lines: parsed, filename: filename}),
      errs: []
    };
  }
  catch(ex: any) { // eslint-disable-line
    // Return the errors
    return {
      outputName: parseData.outputName,
      bytes: [],
      sld: '',
      errs: [CompilationError.fromAny(parseData.fileName, ex)]
    };
  }
}

export {parseData, compile, includeFile, setOutputName, setDeviceName};
