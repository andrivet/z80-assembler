# z80-assembler

A Z80 assembler library entirely written in Typescript and derived from a PEG grammar.
It optimized for the old ZX81 computer but can also be used with any other Z80 targets.

## Demo application

A demo application is available: https://andrivet.github.io/z80-assembler/.

## Quick guide to use the library

To install the library:

```
$ npm install @andrivet/z80-assembler
```

The main function is simply called `compile`. It takes three arguments:

* the name of the source file
* the Z80 source code to compile
* a function used to return the content of included files

It returns an object of type `CompilationInfo` with the following fields:

* `outputName`: The name of the output as set by the `output` directive.
* `bytes`: A array of numbers. Each element represents a byte of the generated machine code.
* `sld`: The Source Level Debugging data as a string. This is used in order to debug the code.
* `errs`: An array of errors

A typical way to use the function is:

```
const info = compile(filepath, code, handleGetFileCode);
if(info.errs.length > 0)
  displayErrors(info.errs);
else
  saveOutput(info.outputName, info.bytes);
```

You can find a complete example in the [demo application](https://github.com/andrivet/z80-assembler/), in particular in the `app.tsx` file.


## Source code

The source code is published on GitHub: https://github.com/andrivet/z80-assembler/.

## Licence

This library and associated application are released under GPLv3.

## Copyrights

Copyright (C) 2023 Sebastien Andrivet
