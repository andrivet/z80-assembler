import React from "react";
import {Menu, Navbar} from "react-daisyui";
import logoUrl from "../assets/images/logo192.png";
import {ChevronDownIcon, CogIcon, FolderOpenIcon} from "@heroicons/react/24/solid";


interface AppHeaderProps {
  onOpenCode: () => void;
  onOpenCodeDirectory: () => void;
  onSaveCode: () => void;
  onSaveBinary: () => void;
  onSaveSld: () => void;
  onCompile: () => void;
  onShowOpCodes: () => void;
}

export default function AppHeader(props: AppHeaderProps) {

  return (
    <div className="flex-none">
      <Navbar className="bg-neutral-700 top-0">
        <Navbar.Start>
          <img src={logoUrl} width={32} className="mx-4" alt="Logo"></img><span className="text-orange-400">Z80 Assembler</span>
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
                <Menu.Item onClick={props.onOpenCode}><p>Open Code...</p></Menu.Item>
                <Menu.Item onClick={props.onOpenCodeDirectory}><p>Open Code Directory...</p></Menu.Item>
                <Menu.Item><p onClick={props.onSaveCode}>Save Code...</p></Menu.Item>
                <Menu.Item><p onClick={props.onSaveBinary}>Save Binary...</p></Menu.Item>
                <Menu.Item><p onClick={props.onSaveSld}>Save SLD File...</p></Menu.Item>
              </Menu>
            </Menu.Item>
            <Menu.Item>
              <p onClick={props.onCompile}><CogIcon className="h-6 w-6"/>Compile</p>
            </Menu.Item>
          </Menu>
        </Navbar.Center>
        <Navbar.End>
          <Menu horizontal={true} className="px-1">
            <Menu.Item tabIndex={0}><p onClick={props.onShowOpCodes}>Z80 Opcodes</p></Menu.Item>
          </Menu>
        </Navbar.End>
      </Navbar>
    </div>
  );
}
