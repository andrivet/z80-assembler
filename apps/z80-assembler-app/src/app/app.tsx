/**
 * Z80 Assembler in Typescript
 *
 * File:
 * Description:
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

import React, {useRef, useState} from 'react';
import {AppOpcodes} from "./opcodes";
import {Chunk, CompilationError, compile, formatBytes} from "@andrivet/z80-assembler";
import AppFooter from "./footer";
import AppHeader from "./header";
import AppBinary from "./binary";
import AppEditor, {AppEditorHandlers} from "./editor";
import Errors from "./errors";
import {closeDropdown} from "./misc";
import {fileSave} from "browser-fs-access";

interface BinaryOrOpCodesProps {
  showOpCodes: boolean,
  chunks: Chunk[] | undefined;
}

function BinaryOrOpCodes({showOpCodes, chunks}: BinaryOrOpCodesProps) {
  return showOpCodes ? <AppOpcodes /> : <AppBinary chunks={chunks} />;
}

export function App() {
  const [code, setCode] = useState<string>('');
  const [filepath, setFilepath] = useState<string>('');
  const [errors, setErrors] = useState<CompilationError[] | undefined>();
  const [bytes, setBytes] = useState<number[] | undefined>();
  const [sld, setSld] = useState<string>('');
  const [chunks, setChunks] = useState<Chunk[] | undefined>();
  const [showOpCodes, setShowOpCodes] = useState<boolean>(false);
  const [outputName, setOutputName] = useState<string | undefined>(undefined);
  const ref = useRef<AppEditorHandlers>(null);

  function handleGetFileCode(filename: string): string {
    if(ref.current == null) throw new Error(`Invalid reference to the editor`);
    return ref.current.getCode(filename);
  }

  function handleCompile() {
    const info = compile(filepath, code, handleGetFileCode);
    if(info.errs.length > 0) {
      setBytes([]);
      setSld('');
      setChunks([]);
      setErrors(info.errs);
    }
    else {
      setShowOpCodes(false);
      setOutputName(info.outputName);
      setBytes(info.bytes);
      setSld(info.sld);
      setChunks(formatBytes(info.bytes, 16));
      setErrors([]);
    }
  }

  async function handleSaveBinary() {
    closeDropdown();
    if (!bytes || !outputName) return;
    const data = Uint8Array.from(bytes);
    const blob = new Blob([data]);
    await fileSave(blob, {
      fileName: outputName,
      extensions: ['.P']
    });
  }

  async function handleSaveSld() {
    closeDropdown();
    if (sld.length <= 0 || !outputName) return;
    const blob = new Blob([sld]);
    await fileSave(blob, {
      fileName: outputName.replace(/\.P$/, ''),
      extensions: ['.sld']
    });
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-600">
      <AppHeader
        onOpenCode={() => ref.current?.openCode()}
        onOpenCodeDirectory={() => ref.current?.openCodeDirectory()}
        onSaveCode={() => ref.current?.saveCode()}
        onSaveBinary={handleSaveBinary}
        onSaveSld={handleSaveSld}
        onClose={() => ref.current?.closeCode()}
        onCloseAll={() => ref.current?.closeAll()}
        onCompile={handleCompile}
        onShowOpCodes={() => setShowOpCodes(true)}
      />
      <div className="flex-1 flex m-4 gap-4">
        <div className="flex flex-col w-2/3">
          <AppEditor
            ref={ref}
            code={code}
            setFilePath={setFilepath}
            setCode={setCode}
            errors={errors}
            setErrors={setErrors} />
        </div>
        <div className="flex flex-col w-1/3 z-0">
          <BinaryOrOpCodes showOpCodes={showOpCodes} chunks={chunks}/>
        </div>
      </div>
      <Errors errors={errors} />
      <AppFooter />
    </div>
  );
}

export default App;
