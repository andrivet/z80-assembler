import {Parser} from "../grammar/z80";
import {Bytes, bytes} from "./Ast";
import {CompilationError} from "./Error";
import {formatError, generate} from "../generator/Generator";

type CompilationInfo = {
  outputName: string;
  outputSld: boolean;
  bytes: bytes;
  errs: CompilationError[];
};

const parseData= {
  outputName: "",
  outputSld: false
};

function setOutputName(filename: string, sld: boolean) {
  parseData.outputName = filename;
  parseData.outputSld = sld;
}

function setDeviceName(_: string) {
  // For the moment, do nothing
}

function includeFile(_: string): Bytes {
  // For the moment, do nothing
  return [];
}


function compile(code: string): CompilationInfo {
  parseData.outputName = "program.P";
  parseData.outputSld = false;

  const p = new Parser(code + '\n');

  try {
    const result = p.parse();
    if(result.errs.length > 0)
      return {
        outputName: parseData.outputName,
        outputSld: parseData.outputSld,
        bytes: [],
        errs: result.errs.map(e => new CompilationError(e.pos, formatError(e)))
      };

    const bytes = generate(result);
    return {
      outputName: parseData.outputName,
      outputSld: parseData.outputSld,
      bytes: bytes,
      errs: []
    };
  }
  catch(ex: any) {
    const error = (ex instanceof CompilationError) ? ex :
      new CompilationError({line: 1, offset: 0, overallPos: 0}, formatError(ex));

    return {
      outputName: parseData.outputName,
      outputSld: parseData.outputSld,
      bytes: [],
      errs: [error]
    };
  }
}

export {
  compile,
  includeFile,
  setOutputName,
  setDeviceName,
  CompilationInfo
};
