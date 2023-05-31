import {Line, Parser, PosInfo} from "../grammar/z80";
import {LinesInfo, CompilationInfo} from "../types/Types";
import {CompilationError} from "../types/Error";
import {computeLabels, generateBytes, generateSld} from "../generator/Generator";
import {getUnknownLabels, resetLabels} from "./Labels";


interface ParseDate {
  outputName: string,
  outputSld: boolean,
  basePath: string,
  fileName: string,
  getFileCode: (filename: string) => string
}

const parseData: ParseDate = {
  outputName: "",
  outputSld: false,
  basePath: '',
  fileName: '',
  getFileCode: () => ''
};

function setOutputName(filename: string, sld: boolean) {
  parseData.outputName = filename;
  parseData.outputSld = sld;
}

function setDeviceName(_: string) {
  // For the moment, do nothing
}

function includeFile(pos: PosInfo, filename: string): LinesInfo {
  const code = parseData.getFileCode(parseData.basePath + filename);

  // It is not possible to attach a context to the parsing, so use this dirty trick
  const oldFileName = parseData.fileName;
  parseData.fileName = filename;
  const parsed = parseCode(code);
  parseData.fileName = oldFileName;

  return {lines: parsed, filename: filename};
}

function parseCode(code: string): Line[] {
  if(!code.endsWith('\n')) code += '\n';
  const parser = new Parser(code);

  const result = parser.parse();
  if(result.errs.length > 0)
    throw CompilationError.fromSyntaxErr(parseData.fileName, result.errs[0])

  return result.ast?.lines ?? [];
}

function getBasePath(filepath: string): string {
  let index = filepath.lastIndexOf('/');
  if(index === -1)
    index = filepath.lastIndexOf('\\');
  if(index === -1)
    return '';
  return filepath.substring(0, index + 1);
}

function getBaseName(filepath: string): string {
  let index = filepath.lastIndexOf('/');
  if(index === -1)
    index = filepath.lastIndexOf('\\');
  if(index === -1)
    return filepath;
  return filepath.substring(index + 1);
}


function compile(filepath: string, code: string, getFileCode: (filename: string) => string): CompilationInfo {
  const filename =  getBaseName(filepath);

  parseData.outputName = "program.P";
  parseData.outputSld = true;
  parseData.basePath = getBasePath(filepath);
  parseData.fileName = filename;
  parseData.getFileCode = getFileCode;

  try {
    resetLabels();
    const parsed = parseCode(code);
    computeLabels(0, parsed);
    const unknowns = getUnknownLabels().join(', ');
    if(unknowns.length > 0)
      throw new CompilationError(parseData.fileName, {line: 1, offset: 0, overallPos: 0},
        `Unknown value for labels: ${unknowns}`);

    return {
      outputName: parseData.outputName,
      outputSld: parseData.outputSld,
      bytes: generateBytes(parsed),
      sld: generateSld({lines: parsed, filename: filename}),
      errs: []
    };
  }
  catch(ex: any) {
    return {
      outputName: parseData.outputName,
      outputSld: parseData.outputSld,
      bytes: [],
      sld: '',
      errs: [CompilationError.fromAny(parseData.fileName, ex)]
    };
  }
}

export {parseData, compile, includeFile, setOutputName, setDeviceName};
