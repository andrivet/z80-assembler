import { Collapse, Table } from "react-daisyui";


export function AppOpcodes() {
  return(
    <div className="flex flex-auto h-full relative mt-0">
      <div className="absolute top-0 bottom-0 left-0 right-0 overflow-auto">
        <h1 className="font-bold mb-2 text-orange-400">Z80 Instructions</h1>
        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">8-bit Load</Collapse.Title>
          <Collapse.Content>
            <Table compact={true} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span>LD r1, r2</span>, <span>r1 = r2</span>, <span>r1, r2: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD r, n</span>, <span>r = n</span>, <span>r: A, B, C, D, E, H, L<br />n: 8-bit value</span>]}</Table.Row>
                <Table.Row>{[<span>LD r, (HL)</span>, <span>r = *HL</span>, <span>r: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD r, (IX+d)</span>, <span>r = IX[d]</span>, <span>r: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD r, (IY+d)</span>, <span>r = IY[d]</span>, <span>r: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD (HL), r</span>, <span>*HL = r</span>, <span>r: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD (IX+d), r</span>, <span>IX[d] = r</span>, <span>r: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD (IY+d), r</span>, <span>IY[d] = r</span>, <span>r: A, B, C, D, E, H, L</span>]}</Table.Row>
                <Table.Row>{[<span>LD (HL), n</span>, <span>*HL = n</span>, <span>n: 8-bit value</span>]}</Table.Row>
                <Table.Row>{[<span>LD (IX+d), n</span>, <span>IX[d] = n</span>, <span>n: 8-bit value</span>]}</Table.Row>
                <Table.Row>{[<span>LD (IY+d), n</span>, <span>IY[d] = n</span>, <span>n: 8-bit value</span>]}</Table.Row>
                <Table.Row>{[<span>LD A, (BC)</span>, <span>A = *BC</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD A, (DE)</span>, <span>A = *DE</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD A, (nn)</span>, <span>A = *nn</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD (BC), A</span>, <span>*BC = A</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD (DE), A</span>, <span>*DE = A</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD (nn), A</span>, <span>*nn = A</span>, <span>nn: 16-bit value</span>]}</Table.Row>
                <Table.Row>{[<span>LD A, I</span>, <span>A = I</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD A, R</span>, <span>A = R</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD I, A</span>, <span>I = A</span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>LD R, A</span>, <span>R = A</span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
            <Collapse.Title className="font-bold">16-bit Load</Collapse.Title>
            <Collapse.Content>
              <Table compact={true} zebra={true} width="100%">
                <Table.Head>
                  {['Opcode', 'Equivalent in C', 'Arguments']}
                </Table.Head>
                <Table.Body>
                  <Table.Row>{[<span>LD dd, nn</span>, <span>dd = nn</span>, <span>dd: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</span>]}</Table.Row>
                  <Table.Row>{[<span>LD dd, (nn)</span>, <span>low(dd) = nn[0], high(dd) = nn[1]</span>, <span>dd: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</span>]}</Table.Row>
                  <Table.Row>{[<span>LD (nn), dd</span>, <span>nn[0] = low(dd), nn[1] = high(dd)</span>, <span>dd: BC, DE, HL, SP, IX, IY<br />nn: 16-bit value</span>]}</Table.Row>
                  <Table.Row>{[<span>LD SP, HL</span>, <span>SP = HL</span>, <span></span>]}</Table.Row>
                  <Table.Row>{[<span>LD SP, IX</span>, <span>SP = IX</span>, <span></span>]}</Table.Row>
                  <Table.Row>{[<span>LD SP, IY</span>, <span>SP = IY</span>, <span></span>]}</Table.Row>
                  <Table.Row>{[<span>PUSH qq</span>, <span>*(--SP) = high(qq), *(--SP) = low(qq)</span>, <span>qq: BC, DE, HL, AF, IX, IY</span>]}</Table.Row>
                  <Table.Row>{[<span>POP qq</span>, <span>qql = *(SP++), qqh = *(SP++)</span>, <span>qq: BC, DE, HL, AF, IX, IY</span>]}</Table.Row>
                </Table.Body>
              </Table>
            </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Exchange</Collapse.Title>
          <Collapse.Content>
            <Table compact={true} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span>EX DE, HL</span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>EX AF, AF'</span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>EXX</span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span>EX (SP), dd</span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Block Transfer and Search</Collapse.Title>
          <Collapse.Content>
            <Table compact={true} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">8-bit Arithmetic</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">16-bit Arithmetic</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Rotate and Shift</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Bit Manipulation</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Bit Manipulation</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Jump, Call and Return</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">Input and Output</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

        <Collapse checkbox={true} icon="arrow">
          <Collapse.Title className="font-bold">CPU Control</Collapse.Title>
          <Collapse.Content>
            <Table compact={false} zebra={true} width="100%">
              <Table.Head>
                {['Opcode', 'Equivalent in C', 'Arguments']}
              </Table.Head>
              <Table.Body>
                <Table.Row>{[<span></span>, <span></span>, <span></span>]}</Table.Row>
              </Table.Body>
            </Table>
          </Collapse.Content>
        </Collapse>

      <h1 className="font-bold mb-2 text-orange-400">Pseudo-Instructions</h1>
    </div>
    </div>
  );
}
