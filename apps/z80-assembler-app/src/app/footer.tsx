/**
 * Z80 Assembler in Typescript
 *
 * File:        footer.tsx
 * Description: Footer of the application
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Footer} from "react-daisyui";
import React from "react";

export default function AppFooter() {
  return (
    <div className="flex-none">
    <Footer className="footer-center sticky mb-0 py-2 bg-neutral-700">
    <a href='https://www.github.com/andrivet/z80-assembler'>Z80 Assembler in Typescript - Copyright &copy; 2023 Sebastien Andrivet</a>
  </Footer>
  </div>);
}
