import React from "react";
import {Menu, Navbar} from "react-daisyui";
import logoUrl from "../assets/images/logo192.png";
import {FaChevronDown, FaCog, FaFile, FaFileAlt, FaCodepen, FaFolderOpen, FaSave, FaTimesCircle} from "react-icons/fa";


interface AppHeaderProps {
  onOpenCode: () => void;
  onOpenCodeDirectory: () => void;
  onSaveCode: () => void;
  onSaveBinary: () => void;
  onSaveSld: () => void;
  onCompile: () => void;
  onShowOpCodes: () => void;
  onClose: () => void;
  onCloseAll: () => void;
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
                <FaFile className="h-5 w-5" />
                File
                <FaChevronDown className="w-4 h-4" />
              </p>
              <Menu className="bg-gray-800 z-10">
                <Menu.Item onClick={props.onOpenCode}><p><FaFileAlt className="h-5 w-5" />Open Code...</p></Menu.Item>
                <Menu.Item onClick={props.onOpenCodeDirectory}><p><FaFolderOpen className="h-5 w-5" />Open Code Directory...</p></Menu.Item>
                <Menu.Item><p onClick={props.onSaveCode}><FaSave className="h-5 w-5" />Save Code...</p></Menu.Item>
                <Menu.Item><p onClick={props.onSaveBinary}><FaSave className="h-5 w-5" />Save Binary...</p></Menu.Item>
                <Menu.Item><p onClick={props.onSaveSld}><FaSave className="h-5 w-5" />Save SLD File...</p></Menu.Item>
                <Menu.Item><p onClick={props.onClose}><FaTimesCircle className="h-5 w-5" />Close Code</p></Menu.Item>
                <Menu.Item><p onClick={props.onCloseAll}><FaTimesCircle className="h-5 w-5" />Close All</p></Menu.Item>
              </Menu>
            </Menu.Item>
            <Menu.Item>
              <p onClick={props.onCompile}><FaCog className="h-5 w-5"/>Compile</p>
            </Menu.Item>
          </Menu>
        </Navbar.Center>
        <Navbar.End>
          <Menu horizontal={true} className="px-1">
            <Menu.Item tabIndex={0}><p onClick={props.onShowOpCodes}><FaCodepen className="h-5 w-5" />
              Z80 Opcodes</p>
            </Menu.Item>
          </Menu>
        </Navbar.End>
      </Navbar>
    </div>
  );
}
