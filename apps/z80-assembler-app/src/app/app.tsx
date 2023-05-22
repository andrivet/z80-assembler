// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

import React, {useState} from 'react';
import logoUrl from '../assets/images/logo192.png';
import { Footer, Menu, Navbar, Tabs } from "react-daisyui";
import {FolderOpenIcon, CogIcon, ChevronDownIcon, XMarkIcon} from '@heroicons/react/24/solid';
import CodeMirror from '@uiw/react-codemirror';
import { fileOpen, directoryOpen, fileSave, supported, FileWithDirectoryAndFileHandle } from "browser-fs-access";
import { AppZ80Opcodes } from "./z80-opcodes";
import { compile } from "@andrivet/z80-assembler";


type CodeFile = {
  name: string,
  code: string,
  saved: boolean
};

const validExt = ['.asm', '.zx81'];

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

function closeDropdown() {
  const elem = document.activeElement as HTMLElement;
  if(elem) elem?.blur();
}

export function App() {
  const [codeFiles, setCodeFiles] = useState([{name: 'untitled.asm', code: '', saved: false}]);
  const [currentFile, setCurrentFile] = useState(0);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<CompilationError[] | undefined>();
  const [bytes, setBytes] = useState<number[] | undefined>();

  async function onOpenCode() {
    const blob = await fileOpen({
      extensions: validExt
    });
    closeDropdown();
    if(!blob.handle) return;
    const file = await blob.handle.getFile();
    const content = await file.text();
    const code: CodeFile = {name: file.name, code: content, saved: true};
    const files = codeFiles.concat(code);
    setCodeFiles(files);
    setCurrentFile(files.length - 1);
    setCode(code.code);
  }

  async function onOpenCodeDirectory() {
    const blobs = await directoryOpen({
      recursive: false
    });
    closeDropdown();

    const files = codeFiles;
    for (const blob of blobs) {
      if (!isFile(blob) || !blob.handle || !isValidExt(blob.name)) continue;
      const file = await blob.handle.getFile();
      const content = await file.text();
      files.push({ name: file.name, code: content, saved: true});
    }
    const index = files.length - 1;
    setCodeFiles(files);
    setCurrentFile(index);
    setCode(codeFiles[index].code);
  }

  function onChangeTab(index: number) {
    if (index >= codeFiles.length) index = codeFiles.length > 0 ? codeFiles.length - 1 : 0;
    setCurrentFile(index);
    setCode(codeFiles.length > 0 ? codeFiles[index].code : '');
  }

  function onCloseTab(index: number) {
    let files = codeFiles.slice(0, index).concat(codeFiles.slice(index + 1));
    if(files.length <= 0) files = [{name: 'untitled.asm', code: '', saved: false}];
    setCodeFiles(files);
    if(currentFile === index) {
      if (index >= files.length) index = files.length - 1;
      setCurrentFile(index);
      setCode(codeFiles[index].code);
    }
  }

  function onCompile() {
    const code = codeFiles[currentFile].code;
    const info = compile(code);
    setBytes(info.bytes);
    setErrors(info.errs);
  }

  async function onSaveCode() {
    closeDropdown();
    const file = codeFiles[currentFile];
    if (!file) return;
    const blob = new Blob([file.code]);
    await fileSave(blob, {
      fileName: file.name,
      extensions: validExt
    });
  }

  function onSaveBinary() {
    closeDropdown();
  }

  function AppFooter() {
    return (
      <div className="flex-none">
        <Footer className="footer-center sticky mb-0 py-2 bg-neutral-700">
          <a href='https://www.github.com/andrivet/z80-assembler'>Z80 Assembler in Typescript - Copyright &copy; 2023 Sebastien Andrivet</a>
        </Footer>
      </div>);
  }

  function AppHeader() {
    return (
      <div className="flex-none">
        <Navbar className="bg-neutral-700 top-0">
          <Navbar.Start>
            <img src={logoUrl} width={32} className="mx-4" alt="Logo"></img>Z80 Assembler
          </Navbar.Start>
          <Navbar.Center className="flex">
            <Menu horizontal={true} className="px-1">
              <Menu.Item tabIndex={0}>
                <p>
                  <FolderOpenIcon className="h-6 w-6" />
                  File
                  <ChevronDownIcon className="w-4 h-4" />
                </p>
                <Menu className="bg-gray-800 z-10">
                  <Menu.Item onClick={onOpenCode}><p>Open Code...</p></Menu.Item>
                  <Menu.Item onClick={onOpenCodeDirectory}><p>Open Code Directory...</p></Menu.Item>
                  <Menu.Item><p onClick={onSaveCode}>Save Code...</p></Menu.Item>
                  <Menu.Item><p onClick={onSaveBinary}>Save Binary...</p></Menu.Item>
                </Menu>
              </Menu.Item>
              <Menu.Item>
                <p onClick={onCompile}><CogIcon className="h-6 w-6"/>Compile</p>
              </Menu.Item>
            </Menu>
          </Navbar.Center>
          <Navbar.End>
            <Menu horizontal={true} className="px-1">
              <Menu.Item tabIndex={0}>Z80 Opcodes</Menu.Item>
            </Menu>
          </Navbar.End>
        </Navbar>
      </div>
    );
  }

  function AppAssembler() {
    return(
      <>
        <h1 className="font-bold mb-2">Assembler Code</h1>
        <div className="flex flex-col flex-1">
        <Tabs
          variant={"lifted"}
          value={currentFile}
        >{
          codeFiles.map((file, index) => (
            <Tabs.Tab key={index} value={index}>
              <XMarkIcon
                className="border rounded h4- w-4 mr-2 border-slate-500 hover:bg-neutral-600"
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
            value={code}
            onChange={(value) => setCode(value)}
          />
        </div>
      </div>
      </>
    );
  }

  function AppBinary() {
    return(
      <>
        <h1 className="font-bold mb-2">Binary</h1>
        <div className="flex flex-col flex-1">
          <div className="flex-">
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-600">
      <AppHeader />
      <div className="flex-1 flex m-4 gap-4">
        <div className="flex flex-col w-1/2">
          <AppAssembler />
        </div>
        <div className="flex flex-col w-1/2">
          <AppBinary />
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export default App;
