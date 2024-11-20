/**
 * Z80 Assembler in Typescript
 *
 * File:        editor.tsx
 * Description: Code editor
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Tabs} from "react-daisyui";
import {FaWindowClose} from "react-icons/fa";
import CodeMirror, {basicSetup} from "@uiw/react-codemirror";
import {linter, lintGutter} from '@codemirror/lint'
import React, {useState, useImperativeHandle} from "react";
import {directoryOpen, fileOpen, fileSave, FileWithDirectoryAndFileHandle} from "browser-fs-access";
import {closeDropdown} from "./misc";
import {CompilationError} from "@andrivet/z80-assembler";

const validExt = ['.asm', '.zx81'];

interface AppEditorHandlers {
  openCode: () => void;
  openCodeDirectory: () => void;
  saveCode: () => void;
  closeCode: () => void;
  closeAll: () => void;
  getCode: (filename: string) => string;
}

interface AppEditorProps {
  code: string,
  setFilePath: React.Dispatch<React.SetStateAction<string>>,
  setCode: React.Dispatch<React.SetStateAction<string>>,
  errors: CompilationError[] | undefined,
  setErrors: React.Dispatch<React.SetStateAction<CompilationError[] | undefined>>
}

type CodeFile = {
  filepath: string,
  name: string | undefined,
  code: string
};

function getExt(name: string) {
  return /(?:\.([^.]+))?$/.exec(name);
}

function isValidExt(name: string){
  const ext = getExt(name)?.[1];
  if(!ext) return false;
  return validExt.indexOf('.' + ext) !== -1
}


function AppEditor(props: AppEditorProps, ref: React.ForwardedRef<AppEditorHandlers>) {
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([{filepath: '', name: undefined, code: ''}]);
  const [currentFile, setCurrentFile] = useState<number>(0);

  async function handleOpenCode() {
    const blob = await fileOpen({extensions: validExt});
    closeDropdown();
    const content = await blob.text();

    let files: CodeFile[];
    let current = codeFiles[currentFile];
    if(current.name == null && current.code.length <= 0) {
      files = [...codeFiles]; // Have to be a copy
      current = files[currentFile];
      current.filepath = blob.name;
      current.name = blob.name;
      current.code = content;
    }
    else
      files = [...codeFiles, {filepath: blob.name, name: blob.name, code: content}]; // Must be a copy

    setCodeFiles(files);
    setCurrentFile(files.length - 1);
    props.setCode(content);
    props.setFilePath(blob.name);
    props.setErrors(undefined);
  }

  async function handleOpenDirectory() {
    const blobs = await directoryOpen({
      recursive: true
    });
    closeDropdown();

    const files = [...codeFiles]; // Have to be a copy
    for (const blob of blobs) {
      if (!isValidExt(blob.name)) continue;
      const file = blob as FileWithDirectoryAndFileHandle;
      const content = await file.text();
      files.push({filepath: file.webkitRelativePath, name: blob.name, code: content});
    }
    const index = files.length - 1;
    setCodeFiles(files);
    setCurrentFile(index);
    props.setCode(files[index].code);
    props.setFilePath(files[index].filepath);
    props.setErrors(undefined);
  }

  async function handleSaveCode() {
    closeDropdown();
    const file = codeFiles[currentFile];
    if (!file) return;
    const blob = new Blob([file.code]);
    await fileSave(blob, {
      fileName: file.name ?? 'untitled.asm',
      extensions: validExt
    });
  }

  function handleGetCode(filename: string) {
    const file = codeFiles.find(f => f.filepath.endsWith(filename));
    if(file == null) throw new Error(`File ${filename} not found`);
    return file.code;
  }

  function handleCloseCode() {
    closeDropdown();
    handleCloseTab(currentFile);
  }

  function handleCloseAll() {
    closeDropdown();
    setCodeFiles([{filepath: '', name: undefined, code: ''}]);
    setCurrentFile(0);
    props.setCode('');
    props.setFilePath('');
    props.setErrors(undefined);
  }

  useImperativeHandle(ref, () => {
    return {
      openCode: handleOpenCode,
      openCodeDirectory: handleOpenDirectory,
      saveCode: handleSaveCode,
      getCode: handleGetCode,
      closeCode: handleCloseCode,
      closeAll: handleCloseAll
    }
  });

  function handleChangeTab(index: number) {
    if (index >= codeFiles.length) index = codeFiles.length > 0 ? codeFiles.length - 1 : 0;
    setCurrentFile(index);
    if(codeFiles.length > 0) {
      const file = codeFiles[index];
      props.setCode(file.code);
      props.setFilePath(file.filepath);
    }
    else {
      props.setCode('');
      props.setFilePath('');
    }
    props.setErrors(undefined);
  }

  function handleCloseTab(index: number) {
    const files = codeFiles.slice(0, index).concat(codeFiles.slice(index + 1));
    if(files.length <= 0) {
      setCodeFiles([{filepath: '', name: undefined, code: ''}]);
      setCurrentFile(0);
      props.setCode('');
      props.setFilePath('');
      props.setErrors(undefined);
    }
    else {
      setCodeFiles(files);
      if (index >= files.length) index = files.length - 1;
      setCurrentFile(index);
      const file = files[index];
      props.setCode(file.code);
      props.setFilePath(file.filepath);
      props.setErrors(undefined);
    }
  }

  const asmLinter = linter(view => {
    return props.errors == null ? [] : props.errors
      ?.filter(value => codeFiles[currentFile].filepath === value.position.filename)
      .map(value => {
      const from = view.state.doc.line(value.position.pos.line).from + value.position.pos.offset;
      return {
        from: from,
        to: from + 1,
        severity: "error",
        message: value.message
      }
    })
  });

  return(
    <>
      <h1 className="font-bold mb-2 text-orange-400">Assembler Code</h1>
      <div className="flex flex-col flex-1">
        <Tabs
          variant={"lifted"}
          value={currentFile}
        >{
          codeFiles.map((file, index) => (
            <Tabs.Tab key={index} value={index}>
              <FaWindowClose
                className="h-4 w-4 mr-2"
                onClick={() => handleCloseTab(index)} />
              <p onClick={() => handleChangeTab(index)}>{file.name ?? 'untitled.asm'}</p>
            </Tabs.Tab>
          ))}
        </Tabs>
        <div className="flex flex-auto h-full relative mt-0">
          <CodeMirror
            className="absolute top-0 bottom-0 left-0 right-0"
            theme="dark"
            height="100%"
            value={props.code}
            onChange={(value) => props.setCode(value)}
            extensions={[basicSetup(), asmLinter, lintGutter()]}
          />
        </div>
      </div>
    </>
  );
}

export default React.forwardRef(AppEditor);
export {AppEditorHandlers};
