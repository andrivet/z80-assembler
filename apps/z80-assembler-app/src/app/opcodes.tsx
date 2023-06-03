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
                <tr><td>LD r, (IX+d)</td><td>r: A, B, C, D, E, H, L<br />d: 8-bit signed value</td></tr>
                <tr><td>LD r, (IY+d)</td><td>r: A, B, C, D, E, H, L<br />d: 8-bit signed value</td></tr>
                <tr><td>LD (HL), r</td><td>r: A, B, C, D, E, H, L</td></tr>
                <tr><td>LD (IX+d), r</td><td>r: A, B, C, D, E, H, L<br />d: 8-bit signed value</td></tr>
                <tr><td>LD (IY+d), r</td><td>r: A, B, C, D, E, H, L<br />d: 8-bit signed value</td></tr>
                <tr><td>LD (HL), n</td><td>n: 8-bit value</td></tr>
                <tr><td>LD (IX+d), n</td><td>n: 8-bit value<br />d: 8-bit signed value</td></tr>
                <tr><td>LD (IY+d), n</td><td>n: 8-bit value<br />d: 8-bit signed value</td></tr>
                <tr><td>LD A, (rr)</td><td>rr: BC, DE</td></tr>
                <tr><td>LD A, (nn)</td><td></td></tr>
                <tr><td>LD (rr), A</td><td>rr: BC, DE</td></tr>
                <tr><td>LD (nn), A</td><td>nn: 16-bit value</td></tr>
                <tr><td>LD A, r</td><td>r: I, R</td></tr>
                <tr><td>LD r, A</td><td>r: I, R</td></tr>
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
                  <tr><td>LD rr, nn</td><td>rr: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD rr, (nn)</td><td>rr: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD HL, (nn)</td><td>nn: 16-bit value</td></tr>
                  <tr><td>LD rr, (nn)</td><td>rr: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD (nn), HL</td><td>nn: 16-bit value</td></tr>
                  <tr><td>LD (nn), rr</td><td>rr: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</td></tr>
                  <tr><td>LD SP, rr</td><td>rr: HL, IX, IY</td></tr>
                  <tr><td>PUSH rr</td><td>rr: BC, DE, HL, AF, IX, IY</td></tr>
                  <tr><td>POP rr</td><td>rr: BC, DE, HL, AF, IX, IY</td></tr>
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
                <tr><td>EX (SP), rr</td><td>rr: HL, IX, IY</td></tr>
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
                <tr><td>LDI</td><td></td></tr>
                <tr><td>LDIR</td><td></td></tr>
                <tr><td>LDD</td><td></td></tr>
                <tr><td>LDDR</td><td></td></tr>
                <tr><td>CPI</td><td></td></tr>
                <tr><td>CPIR</td><td></td></tr>
                <tr><td>CPD</td><td></td></tr>
                <tr><td>CPDR</td><td></td></tr>
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
              <tr><td>ADD A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>ADD A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>ADD A, (HL)</td><td></td></tr>
              <tr><td>ADD A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>ADD A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>ADC A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>ADC A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>ADC A, (HL)</td><td></td></tr>
              <tr><td>ADC A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>ADC A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SUB A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>SUB A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>SUB A, (HL)</td><td></td></tr>
              <tr><td>SUB A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SUB A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SBC A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>SBC A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>SBC A, (HL)</td><td></td></tr>
              <tr><td>SBC A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SBC A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>AND A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>AND A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>AND A, (HL)</td><td></td></tr>
              <tr><td>AND A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>AND A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>OR A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>OR A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>OR A, (HL)</td><td></td></tr>
              <tr><td>OR A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>OR A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>XOR A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>XOR A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>XOR A, (HL)</td><td></td></tr>
              <tr><td>XOR A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>XOR A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>CP A, r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>CP A, n</td><td>n: 8-bit value</td></tr>
              <tr><td>CP A, (HL)</td><td></td></tr>
              <tr><td>CP A, (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>CP A, (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>INC r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>INC (HL)</td><td></td></tr>
              <tr><td>INC (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>INC (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>DEC r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>DEC (HL)</td><td></td></tr>
              <tr><td>DEC (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>DEC (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>DAA</td><td></td></tr>
              <tr><td>CPL</td><td></td></tr>
              <tr><td>NEG</td><td></td></tr>
              <tr><td>CCF</td><td></td></tr>
              <tr><td>SCF</td><td></td></tr>
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
              <tr><td>ADD HL, rr</td><td>rr: BC, DE, HL, SP</td></tr>
              <tr><td>ADC HL, rr</td><td>rr: BC, DE, HL, SP</td></tr>
              <tr><td>SBC HL, rr</td><td>rr: BC, DE, HL, SP</td></tr>
              <tr><td>ADD IX, rr</td><td>rr: BC, DE, IX, SP</td></tr>
              <tr><td>ADD IY, rr</td><td>rr: BC, DE, IY, SP</td></tr>
              <tr><td>INC rr</td><td>rr: BC, DE; HL, SP, IX, IY</td></tr>
              <tr><td>DEC rr</td><td>rr: BC, DE; HL, SP, IX, IY</td></tr>
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
              <tr><td>RLCA</td><td></td></tr>
              <tr><td>RLA</td><td></td></tr>
              <tr><td>RRCA</td><td></td></tr>
              <tr><td>RRA</td><td></td></tr>
              <tr><td>RLC r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>RLC (HL)</td><td></td></tr>
              <tr><td>RLC (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RLC (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RL r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>RL (HL)</td><td></td></tr>
              <tr><td>RL (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RL (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RRC r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>RRC (HL)</td><td></td></tr>
              <tr><td>RRC (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RRC (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RR r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>RR (HL)</td><td></td></tr>
              <tr><td>RR (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RR (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SLA r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>SLA (HL)</td><td></td></tr>
              <tr><td>SLA (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SLA (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SRA r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>SRA (HL)</td><td></td></tr>
              <tr><td>SRA (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SRA (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SRL r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>SRL (HL)</td><td></td></tr>
              <tr><td>SRL (IX+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>SRL (IY+d)</td><td>d: 8-bit signed value</td></tr>
              <tr><td>RLD</td><td></td></tr>
              <tr><td>RRD</td><td></td></tr>
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
              <tr><td>BIT b, r</td><td>r: A, B, C, D, E, F, H, L<br/>b: 0 to 7</td></tr>
              <tr><td>BIT b, (HL)</td><td>b: 0 to 7</td></tr>
              <tr><td>BIT b, (IX+d)</td><td>b: 0 to 7<br/>d: 8-bit signed value</td></tr>
              <tr><td>BIT b, (IY+d)</td><td>b: 0 to 7<br/>d: 8-bit signed value</td></tr>
              <tr><td>SET b, r</td><td></td></tr>
              <tr><td>SET b, r</td><td>r: A, B, C, D, E, F, H, L<br/>b: 0 to 7</td></tr>
              <tr><td>SET b, (HL)</td><td>b: 0 to 7</td></tr>
              <tr><td>SET b, (IX+d)</td><td></td></tr>
              <tr><td>SET b, (IY+d)</td><td></td></tr>
              <tr><td>RES b, r</td><td>r: A, B, C, D, E, F, H, L<br/>b: 0 to 7</td></tr>
              <tr><td>RES b, (HL)</td><td>b: 0 to 7</td></tr>
              <tr><td>RES b, (IX+d)</td><td>b: 0 to 7<br/>d: 8-bit signed value</td></tr>
              <tr><td>RES b, (IY+d)</td><td>b: 0 to 7<br/>d: 8-bit signed value</td></tr>
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
              <tr><td>JP nn</td><td>nn: 16-bit value</td></tr>
              <tr><td>JP cc, nn</td><td>cc: NZ, Z, NC, C, PO, PE, P, M<br/>nn: 16-bit value</td></tr>
              <tr><td>JR e</td><td>e: -126 to 129</td></tr>
              <tr><td>JR cc, e</td><td>cc: Z, NZ, C, NC<br/>e: -126 to 129</td></tr>
              <tr><td>JP (rr)</td><td>rr: HL, IX, IY</td></tr>
              <tr><td>DJNZ e</td><td>e: -126 to 129</td></tr>
              <tr><td>CALL nn</td><td>nn: 16-bit value</td></tr>
              <tr><td>CALL cc, nn</td><td>cc:  NZ, Z, NC, C, PO, PE, P, M<br/>nn: 16-bit value</td></tr>
              <tr><td>RET</td><td></td></tr>
              <tr><td>RET cc</td><td>cc: NZ, Z, NC, C, PO, PE, P, M</td></tr>
              <tr><td>RETI</td><td></td></tr>
              <tr><td>RETN</td><td></td></tr>
              <tr><td>RST n</td><td>n: $00, $08, $10, $18, $20, $28, $30, $38</td></tr>
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
              <tr><td>IN A, (n)</td><td>n: 8-bit value</td></tr>
              <tr><td>IN r, (C)</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>INI</td><td></td></tr>
              <tr><td>INIR</td><td></td></tr>
              <tr><td>IND</td><td></td></tr>
              <tr><td>INDR</td><td></td></tr>
              <tr><td>OUT (n), A</td><td>n: 8-bit value</td></tr>
              <tr><td>OUT (C), r</td><td>r: A, B, C, D, E, H, L</td></tr>
              <tr><td>OUTI</td><td></td></tr>
              <tr><td>OTIR</td><td></td></tr>
              <tr><td>OUTD</td><td></td></tr>
              <tr><td>OTDR</td><td></td></tr>
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
              <tr><td>NOP</td><td></td></tr>
              <tr><td>HALT</td><td></td></tr>
              <tr><td>DI</td><td></td></tr>
              <tr><td>EI</td><td></td></tr>
              <tr><td>IM n</td><td>n: 0, 1, 2</td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Pseudo Instructions</Collapse.Title>
          <Collapse.Content>
            <table className="table table-zebra w-full">
              <thead><tr className="bg-neutral-900"><th>Instr.</th><th>Aliases</th></tr></thead>
              <tbody>
              <tr><td>equ</td><td>.equ</td></tr>
              <tr><td>org</td><td>.org</td></tr>
              <tr><td>include</td><td>.include</td></tr>
              <tr><td>output</td><td>.output</td></tr>
              <tr><td>device</td><td>.device</td></tr>
              <tr><td>byte</td><td>db, dm, defb, defm</td></tr>
              <tr><td>word</td><td>dw, defw</td></tr>
              <tr><td>block</td><td>defs, ds</td></tr>
              </tbody>
            </table>
          </Collapse.Content>
        </Collapse>

      </div>
    </div>
  );
}
