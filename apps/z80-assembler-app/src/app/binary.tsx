import React from "react";
import {Table} from "react-daisyui";
import {Chunk} from "@andrivet/z80-assembler";

interface AppBinaryProps {
  chunks: Chunk[] | undefined;
}

export default function AppBinary({chunks}: AppBinaryProps) {
  return (chunks == null || chunks.length <= 0) ? null : (
    <>
      <h1 className="font-bold mb-2 text-orange-400">Machine Code</h1>
      <div className="flex flex-auto h-full relative mt-0">
        <div className="absolute top-0 bottom-0 left-0 right-0 overflow-auto">
          <Table compact={true} zebra={true}>
            <Table.Head>{['Address', 'Bytes']}</Table.Head>
            <Table.Body>
              {chunks?.map((data, index) => (
                <Table.Row key={data.address} className="font-mono">{[
                  <strong className="text-orange-400">{data.address}</strong>,
                  <span>{data.bytes}</span>
                ]}</Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </>
  );
}
