/**
 * Z80 Assembler in Typescript
 *
 * File:        Formatter.ts
 * Description: Format bytes to display them easily
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Represents a chunk of data to display binary.
 */
interface Chunk {
  // The address of the chunk of data.
  address: string;
  // The bytes (converted to strings).
  bytes: string;
}

/**
 * Format bytes to display them.
 * @param bytes An array of bytes.
 * @param perLine Number of bytes per line.
 */
function formatBytes(bytes: number[], perLine: number): Chunk[] {
  let data: Chunk[] = [];
  let address = 0;
  // For each byte...
  while(address < bytes.length) {
    // Cut a slice
    const chunk = bytes.slice(address, address + perLine);
    // Format the address and each byte
    data = data.concat({
      address: address.toString(16).padStart(4, '0'),
      bytes: chunk.map(b => b.toString(16).padStart(2, '0')).join(' ')
    });
    address += perLine;
  }
  return data;
}

export {formatBytes, Chunk};
