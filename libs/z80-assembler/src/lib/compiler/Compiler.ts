import {Parser} from "../grammar/z80";
import {Bytes, bytes} from "./Ast";
import {CompilationError} from "./Error";
import {generate} from "../generator/Generator";

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
        errs: result.errs.map(e => CompilationError.fromSyntaxErr(e))
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
    return {
      outputName: parseData.outputName,
      outputSld: parseData.outputSld,
      bytes: [],
      errs: [CompilationError.fromAny(ex)]
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
