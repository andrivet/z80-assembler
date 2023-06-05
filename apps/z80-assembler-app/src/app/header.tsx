/**
 * Z80 Assembler in Typescript
 *
 * File:        header.tsx
 * Description: Header of the application
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import React from "react";
import {Button, Dropdown, Navbar} from "react-daisyui";
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
          <Dropdown hover={true}  className="z-10">
            <Dropdown.Toggle color="ghost"><FaFile className="h-5 w-5" />File<FaChevronDown className="w-4 h-4" /></Dropdown.Toggle>
            <Dropdown.Menu className="w-56">
              <Dropdown.Item onClick={props.onOpenCode}><FaFileAlt className="h-5 w-5" />Open Code...</Dropdown.Item>
              <Dropdown.Item onClick={props.onOpenCodeDirectory}><FaFolderOpen className="h-5 w-5" />Open Code Directory...</Dropdown.Item>
              <Dropdown.Item onClick={props.onSaveCode}><FaSave className="h-5 w-5" />Save Code...</Dropdown.Item>
              <Dropdown.Item onClick={props.onSaveBinary}><FaSave className="h-5 w-5" />Save Binary...</Dropdown.Item>
              <Dropdown.Item onClick={props.onSaveSld}><FaSave className="h-5 w-5" />Save SLD File...</Dropdown.Item>
              <Dropdown.Item onClick={props.onClose}><FaTimesCircle className="h-5 w-5" />Close Code</Dropdown.Item>
              <Dropdown.Item onClick={props.onCloseAll}><FaTimesCircle className="h-5 w-5" />Close All</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button color="ghost" onClick={props.onCompile}><FaCog className="h-5 w-5"/>Compile</Button>
        </Navbar.Center>
        <Navbar.End>
          <Button color="ghost" onClick={props.onShowOpCodes}><FaCodepen className="h-5 w-5" />Z80 Opcodes</Button>
        </Navbar.End>
      </Navbar>
    </div>
  );
}
