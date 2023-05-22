import {PosInfo} from "../grammar/z80";

export class AssemblerError extends Error {
  constructor(public readonly pos: PosInfo, message: string) {
    super(message);
  }
}
