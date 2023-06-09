/**
 * Z80 Assembler in Typescript
 *
 * File:        errors.tsx
 * Description: Compilation errors
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {CompilationError} from "@andrivet/z80-assembler";

interface ErrorsProps {
  errors: CompilationError[] | undefined;
}

function errorText(errors: CompilationError[] | undefined) {
  if(errors == null) return '';
  if(errors.length <= 0) return 'Successful compilation';
  return errors[0].toString();
}

function Errors({errors}: ErrorsProps) {
  const hasError = errors && errors?.length > 0;
  const text = errorText(errors);
  return (
    <div className=" h-8 mx-3 mb-4">
      <p className={`px-2 pt-0.5 ${hasError ? 'text-red-300' : ' text-green-300'}`}>{text}</p>
    </div>);
}

export default Errors;
