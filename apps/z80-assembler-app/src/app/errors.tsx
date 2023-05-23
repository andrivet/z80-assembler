import {CompilationError} from "@andrivet/z80-assembler";

interface ErrorsProps {
  errors: CompilationError[] | undefined;
}

function errorText(errors: CompilationError[] | undefined) {
  if(errors == null) return '';
  if(errors.length <= 0) return 'Successful compilation';
  const error = errors[0];
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
