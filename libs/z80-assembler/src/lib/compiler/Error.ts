import {PosInfo} from "../grammar/z80";

class CompilationError extends Error {
  constructor(public readonly pos: PosInfo, message: string) {
    super(message);
  }
}

export {CompilationError};
