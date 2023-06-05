
/**
 * Represents a chunk of data to display binary,
 */
interface Chunk {
  // The address of the chunk of data
  address: string;
  // The bytes (converted to strings)
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
  while(address < bytes.length) {
    const chunk = bytes.slice(address, address + perLine);
    data = data.concat({
      address: address.toString(16).padStart(4, '0'),
      bytes: chunk.map(b => b.toString(16).padStart(2, '0')).join(' ')
    });
    address += perLine;
  }
  return data;
}

export {formatBytes, Chunk};
