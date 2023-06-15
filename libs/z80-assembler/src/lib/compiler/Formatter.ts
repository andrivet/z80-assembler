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
 * Assembler Z80 en Typescript
 *
 * Fichier:     Formatter.ts
 * Description: Formattage d'octets pour les afficher facilement
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Represents a chunk of data to display binary.
 * Représente un morceau de données pour afficher un binaire.
 */
interface Chunk {
  // The address of the chunk of data.
  // L'adresse de ce morceau de données.
  address: string;
  // The bytes (converted to strings).
  // Les octets (converti en chaines).
  bytes: string;
}

/**
 * Format bytes to display them.
 * Formate des octets pour les afficher.
 * @param bytes An array of bytes.
 *              Un tableau d'octets.
 * @param perLine Number of bytes per line.
 *                Le nombre d'octets par line.
 */
function formatBytes(bytes: number[], perLine: number): Chunk[] {
  let data: Chunk[] = [];
  let address = 0;
  // For each byte...
  // Pour chaque octet...
  while(address < bytes.length) {
    // Cut a slice
    // Couper un morceau
    const chunk = bytes.slice(address, address + perLine);
    // Format the address and each byte
    // Formate l'adresse et chaque octet
    data = data.concat({
      address: address.toString(16).padStart(4, '0'),
      bytes: chunk.map(b => b.toString(16).padStart(2, '0')).join(' ')
    });
    address += perLine;
  }
  return data;
}

export {formatBytes, Chunk};
