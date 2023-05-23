import {Tabs} from "react-daisyui";
import {XMarkIcon} from "@heroicons/react/24/solid";
import CodeMirror, {basicSetup} from "@uiw/react-codemirror";
import {linter, lintGutter} from '@codemirror/lint'
import React, {useState, useImperativeHandle} from "react";
import {directoryOpen, fileOpen, fileSave, FileWithDirectoryAndFileHandle} from "browser-fs-access";
import {closeDropdown} from "./misc";
import {CompilationError} from "@andrivet/z80-assembler";

const validExt = ['.asm', '.zx81'];

type CodeFile = {
  name: string,
  code: string,
  saved: boolean
};

function isFile(file: FileWithDirectoryAndFileHandle | FileSystemDirectoryHandle): file is FileWithDirectoryAndFileHandle {
  return (file as FileWithDirectoryAndFileHandle).handle !== undefined;
}

function getExt(name: string) {
  return /(?:\.([^.]+))?$/.exec(name);
}

function isValidExt(name: string){
  const ext = getExt(name)?.[1];
  if(!ext) return false;
  return validExt.indexOf('.' + ext) !== -1
}

interface AppEditorProps {
  code: string,
  setCode: React.Dispatch<React.SetStateAction<string>>;
  errors: CompilationError[] | undefined;
  setErrors: React.Dispatch<React.SetStateAction<CompilationError[] | undefined>>;
}

interface AppEditorHandle {
  openCode: () => void;
  openCodeDirectory: () => void;
  saveCode: () => void;
}

function AppEditor(props: AppEditorProps, ref: React.ForwardedRef<AppEditorHandle>) {
  const [codeFiles, setCodeFiles] = useState([{name: 'untitled.asm', code: '', saved: false}]);
  const [currentFile, setCurrentFile] = useState(0);

  useImperativeHandle(ref, () => {
    return {
      async openCode() {
        const blob = await fileOpen({extensions: validExt});
        closeDropdown();
        if (!blob.handle) return;
        const file = await blob.handle.getFile();
        const content = await file.text();
        const code: CodeFile = {name: file.name, code: content, saved: true};
        const files = codeFiles.concat(code);
        setCodeFiles(files);
        setCurrentFile(files.length - 1);
        props.setCode(code.code);
        props.setErrors(undefined);
      },

      async openCodeDirectory() {
        const blobs = await directoryOpen({
          recursive: false
        });
        closeDropdown();

        const files = codeFiles;
        for (const blob of blobs) {
          if (!isFile(blob) || !blob.handle || !isValidExt(blob.name)) continue;
          const file = await blob.handle.getFile();
          const content = await file.text();
          files.push({name: file.name, code: content, saved: true});
        }
        const index = files.length - 1;
        setCodeFiles(files);
        setCurrentFile(index);
        props.setCode(codeFiles[index].code);
        props.setErrors(undefined);
      },

      async saveCode() {
        closeDropdown();
        const file = codeFiles[currentFile];
        if (!file) return;
        const blob = new Blob([file.code]);
        await fileSave(blob, {
          fileName: file.name,
          extensions: validExt
        });
      }
    }
  });

  function onChangeTab(index: number) {
    if (index >= codeFiles.length) index = codeFiles.length > 0 ? codeFiles.length - 1 : 0;
    setCurrentFile(index);
    props.setCode(codeFiles.length > 0 ? codeFiles[index].code : '');
    props.setErrors(undefined);
  }

  function onCloseTab(index: number) {
    let files = codeFiles.slice(0, index).concat(codeFiles.slice(index + 1));
    if(files.length <= 0) files = [{name: 'untitled.asm', code: '', saved: false}];
    setCodeFiles(files);
    if(currentFile === index) {
      if (index >= files.length) index = files.length - 1;
      setCurrentFile(index);
      props.setCode(codeFiles[index].code);
      props.setErrors(undefined);
    }
  }

  const asmLinter = linter(view => {
    return props.errors == null ? [] : props.errors?.map(value => {
      const from = view.state.doc.line(value.pos.line).from + value.pos.offset;
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
              <XMarkIcon
                className="border rounded h-4 w-4 mr-2 border-slate-500 hover:bg-neutral-600"
                onClick={() => onCloseTab(index)} />
              <p onClick={() => onChangeTab(index)}>{file.name}</p>
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
export {AppEditorHandle};
