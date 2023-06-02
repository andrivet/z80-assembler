/**
 * Z80 Assembler in Typescript
 *
 * File:        opcodes.tsx
 * Description: Help about the Z80 opcodes
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Collapse, Table} from "react-daisyui";


export function AppOpcodes() {
  return(
    <div className="flex flex-auto h-full relative mt-0">
      <div className="absolute top-0 bottom-0 left-0 right-0 overflow-auto">
        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">8-bit Load</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
                <tr><td>LD r1, r2</td><td>r1, r2: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD r, n</td><td>r: A, B, C, D, E, H, L<br />n: 8-bit value</td></tr>
                <tr><td>LD r, (HL)</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD r, (IX+d)</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD r, (IY+d)</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD (HL), r</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD (IX+d), r</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD (IY+d), r</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD (HL), n</td><td>n: 8-bit value</td></tr>
                <tr><td>LD (IX+d), n</td><td>n: 8-bit value</td></tr>
                <tr><td>LD (IY+d), n</td><td>n: 8-bit value</td></tr>
                <tr><td>LD A, (BC)</td><td></td></tr>
                <tr><td>LD A, (DE)</td><td></td></tr>
                <tr><td>LD A, (nn)</td><td></td></tr>
                <tr><td>LD (BC), A</td><td></td></tr>
                <tr><td>LD (DE), A</td><td></td></tr>
                <tr><td>LD (nn), A</td><td>nn: 16-bit value</td></tr>
                <tr><td>LD A, I</td><td></td></tr>
                <tr><td>LD A, R</td><td></td></tr>
                <tr><td>LD I, A</td><td></td></tr>
                <tr><td>LD R, A</td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
            <Collapse.Title className="font-bold">16-bit Load</Collapse.Title>
            <Collapse.Content>
              <table className="table table-zebra w-full">
                <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
                <tbody>
                  <tr><td>LD dd, nn</td><td>dd: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD dd, (nn)</td><td>dd: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD (nn), dd</td><td>dd: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD SP, HL</td><td></td></tr>
                  <tr><td>LD SP, IX</td><td></td></tr>
                  <tr><td>LD SP, IY</td><td></td></tr>
                  <tr><td>PUSH qq</td><td>qq: BC, DE, HL, AF, IX, IY</td></tr>
                  <tr><td>POP qq</td><td>qq: BC, DE, HL, AF, IX, IY</td></tr>
                </tbody>
              </table>
            </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Exchange</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
                <tr><td>EX DE, HL</td><td></td></tr>
                <tr><td>EX AF, AF'</td><td></td></tr>
                <tr><td>EXX</td><td></td></tr>
                <tr><td>EX (SP), dd</td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Block Transfer and Search</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">8-bit Arithmetic</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">16-bit Arithmetic</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Rotate and Shift</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Bit Manipulation</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Jump, Call and Return</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Input and Output</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">CPU Control</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Pseudo Instructions</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Opcode</th><th>Arguments</th></tr></thead>
              <tbody>
              <tr><td></td><td></td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

      </div>
    </div>
  );
}
