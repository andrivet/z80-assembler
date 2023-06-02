/**
 * Z80 Assembler in Typescript
 *
 * File:        misc.ts
 * Description: Helpers
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
export function closeDropdown() {
  const elem = document.activeElement as HTMLElement;
  if(elem) elem?.blur();
}
