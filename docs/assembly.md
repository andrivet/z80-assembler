# Z80 Assembly Source Code Format

## Z80 opcodes

This assembler supports all the official Z80 opcodes as defined in [Zilog Z80 CPU User Manual](https://www.zilog.com/docs/z80/um0080.pdf).
Each z80 opcode has to be on a separate line.

## Z80 non-standard or fake opcodes

Some assemblers (such as [sjasmplus](http://z00m128.github.io/sjasmplus/documentation.html#s_fake_instructions)) support fake opcodes such as `ld bc,de`. This is also the case of this assembler (since version 2.0.0).

* IXh, IXl, IYh, IYl 8 bits registers are supported
* ADC, ADD, AND, CP, DEC, INC, OR, SBC, SUB and XOR with those registers are supported
* LD with those registers are supported
* RL, RLC, RR, RRC, SLA, SRA, SRL with (IX+d) or (IY+d)
* SSL (or SSI) new instruction
* IN F, (C)
* OUT (C), 0

The fake instructions are:

### 16-bit rotate and shift

* rl qq
* rr qq
* sla qq
* sll qq, sli qq
* sra qq
* srl qq

### 16-bit load

* ld qq, qq
* ld qq, ix
* ld qq, iy
* ld qq, (hl)
* ld qq, (ix + nn)
* ld qq, (iy + nn)
* ld ix, qq
* ld iy, qq
* ld iy, ix
* ld ix, iy
* ld (hl), qq
* ld (ix + nn), qq
* ld (iy + nn), qq

### 16-bit load, increment

* ldi qq, (hl)
* ldi qq, (ix + nn)
* ldi qq, (iy + nn)
* ldi (hl), qq
* ldi (ix + nn), qq
* ldi (iy + nn), qq

### 8-bit load, increment

* ldi a, (bc)
* ldi a, (de)
* ldi r, (hl)
* ldi r, (ix + nn)
* ldi r, (iy + nn)
* ldi (bc), a
* ldi (de), a
* ldi (hl), r
* ldi (ix + nn), r
* ldi (iy + nn), r
* ldi (hl), n
* ldi (ix + nn), n
* ldi (iy + nn), n

### 8-bit load, decrement

* ldd a, (bc)
* ldd a, (de)
* ldd r, (hl)
* ldd r, (ix + nn)
* ldd r, (iy + nn)
* ldd (bc), a
* ldd (de), a
* ldd (hl), r
* ldd (ix + nn), r
* ldd (iy + nn), r
* ldd (hl), n
* ldd (ix + nn), n
* ldd (iy + nn), n

### 16-bit arithmetic

* adc de, ss
* add de, ss
* sbc de, ss
* sub de, ss
* sub hl, ss

## Labels

Labels are sequence of characters representing a numerical value. It is often an address but can be something else.
The name of a label has to start with a letter, an underscore or a period and continues with a letter, a digit or one of those characters: `_!?#@.$`.
Case is ignored. Labels have to be unique. There is (currently) no notion of global or local labels.

When they are declared, label have to be at the beginning of a line. They can be optionally followed by a column (`:`). This is not part of the name.
If the label is followed by `equ` (or `.equ`), it takes the value of the expression after this keyword. Otherwise, the value of the label is the address of the next instruction.

```
label1:
  ld a,1
```

```
label2 equ 1234h
```

Labels can be used in expressions by using their name (without the column). This label is replaced by its value when evaluated.
It is possible to use labels before their declaration. This is typically the case in code such as:

```
  jr z,label1
  ...
label1:
  ...
```

The value of a label can't be ambiguous. For example, the following code results in a compilation error because the two labels are dependent of each other (cycle) :

```
label1 equ label2
label2 equ label1
```

Likewise, the following code is ambiguous in a more subtle way (the size of the block depends on label1 and label1 depends on the size of the block):

```
  block label1
  ...
label1:
...
```

## Numeric Constants

Numeric constants can be declared in decimal, hexadecimal, octal or binary using a prefix

| Prefix | Base        | Example   |
|--------|-------------|-----------|
| none   | Decimal     | 123       |
| $      | Hexadecimal | $ab12     |
| #      | Hexadecimal | #ab12     |
| @      | Octal       | @123      |
| &      | Binary      | &00001000 |

It is also possible to use prefixes starting with `0`, similar to the syntax of the C language:

| Prefix | Base        | Example    |
|--------|-------------|------------|
| 0x     | Hexadecimal | 0xab12     |
| 0o     | Octal       | 0o123      |
| 0q     | Octal       | 0q123      |
| 0b     | Binary      | 0b00001000 |

Another possibility is to use a suffix:

| Suffix | Base        | Example     |
|--------|-------------|-------------|
| d      | Decimal     | 123d        |
| h      | Hexadecimal | ab12h       |
| q      | Octal       | 123q        |
| o      | Octal       | 123o        |
| b      | Binary      | 0b00001000b |

Hexadecimal digits, prefixes and suffixes are not case-sensitive. The following constants are all equivalent:

```
AB12H
ab12h
Ab12H
0xAB12
0Xab12
```

> Note: `abh` is ambiguous. It could be the hexadecimal value `ab` or the label `abh`.
> Some assemblers require to start such hexadecimal value with `0`. This is not the case here.
> The sequence of characters is interpreted as an hexadecimal value.

## Character and String Constants

Character and string constants are enclosed in single or double quotes. 
The ASCII (more precisely Latin-1) characters and translated into their ZX81 counterparts if it is possible:

| Latin-1 | Code | ZX81                        | Code | | Latin-1 | Code | ZX81                        | Code |
|---------|------|-----------------------------|------|-|---------|------|-----------------------------|------|
|         | 20h  | ![](./images/ZX81-0x00.png) | 00h  | | _       |      | ![](./images/ZX81-0x80.png) | 80h  |
| "       | 22h  | ![](./images/ZX81-0x0B.png) | 0Bh  | |         |      |                             |      |
| £       | A3h  | ![](./images/ZX81-0x0C.png) | 0Ch  | |         |      |                             |      |
| $       | 24h  | ![](./images/ZX81-0x0D.png) | 0Dh  | |         |      |                             |      |
| :       | 3Ah  | ![](./images/ZX81-0x0E.png) | 0Eh  | |         |      |                             |      |
| ?       | 3Fh  | ![](./images/ZX81-0x0F.png) | 0Fh  | |         |      |                             |      |
| (       | 28h  | ![](./images/ZX81-0x10.png) | 10h  | |         |      |                             |      |
| )       | 29h  | ![](./images/ZX81-0x11.png) | 11h  | |         |      |                             |      |
| >       | 3Ch  | ![](./images/ZX81-0x12.png) | 12h  | |         |      |                             |      |
| <       | 3Eh  | ![](./images/ZX81-0x13.png) | 13h  | |         |      |                             |      |
| =       | 3Dh  | ![](./images/ZX81-0x14.png) | 14h  | |         |      |                             |      |
| +       | 2Bh  | ![](./images/ZX81-0x15.png) | 15h  | |         |      |                             |      |
| -       | 2Dh  | ![](./images/ZX81-0x16.png) | 16h  | |         |      |                             |      |
| *       | 2Ah  | ![](./images/ZX81-0x17.png) | 17h  | |         |      |                             |      |
| /       | 2Fh  | ![](./images/ZX81-0x18.png) | 18h  | |         |      |                             |      |
| ;       | 3Bh  | ![](./images/ZX81-0x19.png) | 19h  | |         |      |                             |      |
| ,       | 2Ch  | ![](./images/ZX81-0x1A.png) | 1Ah  | |         |      |                             |      |
| .       | 2Eh  | ![](./images/ZX81-0x1B.png) | 1Bh  | |         |      |                             |      |
| 0       | 30h  | ![](./images/ZX81-0x1C.png) | 1Ch  | |         |      |                             |      |
| 1       | 31h  | ![](./images/ZX81-0x1D.png) | 1Dh  | |         |      |                             |      |
| 2       | 32h  | ![](./images/ZX81-0x1E.png) | 1Eh  | |         |      |                             |      |
| 3       | 33h  | ![](./images/ZX81-0x1F.png) | 1Fh  | |         |      |                             |      |
| 4       | 34h  | ![](./images/ZX81-0x20.png) | 20h  | |         |      |                             |      |
| 5       | 35h  | ![](./images/ZX81-0x21.png) | 21h  | |         |      |                             |      |
| 6       | 36h  | ![](./images/ZX81-0x22.png) | 22h  | |         |      |                             |      |
| 7       | 37h  | ![](./images/ZX81-0x23.png) | 23h  | |         |      |                             |      |
| 8       | 38h  | ![](./images/ZX81-0x24.png) | 24h  | |         |      |                             |      |
| 9       | 39h  | ![](./images/ZX81-0x25.png) | 25h  | |         |      |                             |      |
| A       | 31h  | ![](./images/ZX81-0x26.png) | 26h  | | a       | 61h  | ![](./images/ZX81-0xA6.png) | A6h  |
| B       | 32h  | ![](./images/ZX81-0x27.png) | 27h  | | b       | 62h  | ![](./images/ZX81-0xA7.png) | A7h  |
| C       | 33h  | ![](./images/ZX81-0x28.png) | 28h  | | c       | 63h  | ![](./images/ZX81-0xA8.png) | A8h  |
| D       | 34h  | ![](./images/ZX81-0x29.png) | 29h  | | d       | 64h  | ![](./images/ZX81-0xA9.png) | A9h  |
| E       | 35h  | ![](./images/ZX81-0x2A.png) | 2Ah  | | e       | 65h  | ![](./images/ZX81-0xAA.png) | AAh  |
| F       | 36h  | ![](./images/ZX81-0x2B.png) | 2Bh  | | f       | 66h  | ![](./images/ZX81-0xAB.png) | ABh  |
| G       | 37h  | ![](./images/ZX81-0x2C.png) | 2Ch  | | g       | 67h  | ![](./images/ZX81-0xAC.png) | ACh  |
| H       | 38h  | ![](./images/ZX81-0x2D.png) | 2Dh  | | h       | 68h  | ![](./images/ZX81-0xAD.png) | ADh  |
| I       | 39h  | ![](./images/ZX81-0x2E.png) | 2Eh  | | i       | 69h  | ![](./images/ZX81-0xAE.png) | AEh  |
| J       | 3Ah  | ![](./images/ZX81-0x2F.png) | 2Fh  | | j       | 6Ah  | ![](./images/ZX81-0xAF.png) | AFh  |
| K       | 3Bh  | ![](./images/ZX81-0x30.png) | 30h  | | k       | 6Bh  | ![](./images/ZX81-0xB0.png) | B0h  |
| L       | 3Ch  | ![](./images/ZX81-0x31.png) | 31h  | | l       | 6Ch  | ![](./images/ZX81-0xB1.png) | B1h  |
| M       | 3Dh  | ![](./images/ZX81-0x32.png) | 32h  | | m       | 6Dh  | ![](./images/ZX81-0xB2.png) | B2h  |
| N       | 3Eh  | ![](./images/ZX81-0x33.png) | 33h  | | n       | 6Eh  | ![](./images/ZX81-0xB3.png) | B3h  |
| O       | 3Fh  | ![](./images/ZX81-0x34.png) | 34h  | | o       | 6Fh  | ![](./images/ZX81-0xB4.png) | B4h  |
| P       | 50h  | ![](./images/ZX81-0x35.png) | 35h  | | p       | 70h  | ![](./images/ZX81-0xB5.png) | B5h  |
| Q       | 51h  | ![](./images/ZX81-0x36.png) | 36h  | | q       | 71h  | ![](./images/ZX81-0xB6.png) | B6h  |
| R       | 52h  | ![](./images/ZX81-0x37.png) | 37h  | | r       | 72h  | ![](./images/ZX81-0xB7.png) | B7h  |
| S       | 53h  | ![](./images/ZX81-0x38.png) | 38h  | | s       | 73h  | ![](./images/ZX81-0xB8.png) | B8h  |
| T       | 54h  | ![](./images/ZX81-0x39.png) | 39h  | | t       | 74h  | ![](./images/ZX81-0xB9.png) | B9h  |
| U       | 55h  | ![](./images/ZX81-0x3A.png) | 3Ah  | | u       | 75h  | ![](./images/ZX81-0xBA.png) | BAh  |
| V       | 56h  | ![](./images/ZX81-0x3B.png) | 3Bh  | | v       | 76h  | ![](./images/ZX81-0xBB.png) | BBh  |
| W       | 57h  | ![](./images/ZX81-0x3C.png) | 3Ch  | | w       | 77h  | ![](./images/ZX81-0xBC.png) | BCh  |
| X       | 58h  | ![](./images/ZX81-0x3D.png) | 3Dh  | | x       | 78h  | ![](./images/ZX81-0xBD.png) | BDh  |
| Y       | 59h  | ![](./images/ZX81-0x3E.png) | 3Eh  | | y       | 79h  | ![](./images/ZX81-0xBE.png) | BEh  |
| Z       | 5Ah  | ![](./images/ZX81-0x3F.png) | 3Fh  | | z       | 7Ah  | ![](./images/ZX81-0xBF.png) | BFh  |

Upper case letters are translated into their black on white counterparts, lower case letters into white on black capital counterparts.

To avoid these translations, use the directive `device` with the value `z80`.

Strings and characters can contain escape sequences:

| Escape | Description      | Code  |
|--------|------------------|-------|
| \n     | New Line         | 76h   |
| \"     | Double quote     | 0Bh   |
| \123   | Octal value      | 53h   |
| \x60   | Hexdecimal value | 60h   |

## Location Counter Symbol

The current value of the location counter (PC) can be used in expressions by using `$`. 
The location counter is the address of the instruction or directive (its first byte) on the line.

## Expressions

Expressions can be used when a numerical value is expected. They are comprised of:

* Labels
* Numerical constants
* Location Counter Symbol
* Operators
* Parenthesis

The available operators are the following, in order of precedence:

| Operator | Type           | Description    |
|----------|----------------|----------------|
| -        | Unary          | Negation       |
| +        | Unary          | No effect      |
| ~        | Unary          | Bits inversion |
| *        | Multiplicative | Multiplication |
| %        | Multiplicative | Modulo         |
| /        | Multiplicative | Division       |
| +        | Additive       | Addition       |
| -        | Additive       | Substraction   |
| <<       | Shift          | Left Shift     |
| \>>      | Shift          | Right Sift     |
| &        | And            | Bitwise And    |
| ^        | Xor            | Bitwise Xor    |
| \|       | Or             | Bitwise Or     |

## Directives

This assembler supports the following directives:

* `equ` (or `.equ`): Define a value for a label
* `org` (or `.org`): Set the current address to compile the code.
* `include` (or `.include`): Include another assembly file.
* `device` (or `.device`): Set the current target (device).
* `byte` (or `db`, `dm`, `defb`, `defm`): Define a list of byte values
* `word` (or `dw`, `defw`): Define a list of word values
* `block` (or `defs`, `ds`): Define a block of byte values.
* `end` (or `.end`): This directive is optional and will stop the generation of binary.

### equ Directive

This directive defines explicitly the value of a label. The formats are the following:

```
label   equ expression
label  .equ expression
label:  equ expression
label: .equ expression
label:    = expression
label:    = expression
```

### org Directive

Set explicitly the value of the program counter (PC). The formats are the following:

```
[label]  org expression
[label] .org expression
```

The label is optional. The program counter is assigned the value of the expression.
For example, to generate code starting at address `4009h`, the following could be done:

```
  org 4009h
```

### include Directive

The include directive reads in and assembles another source file. The formats are the following:

```
   include "filename.zx81"
  .include filename.zx81
```

The double quotes are optional unless there is a space in the filename.

### device Directive

The device directive modifies the binary generated for the given computer. The formats are the following:

```
   device name
  .device name
```

The following values are allowed:

* `zx81`
* `zx81raw`
* `z80`

#### ZX81 device

When `device zx81` is specified in the source code, the assembler performs the following:

* It defines labels for all system variables and it defines appropriate values for those system variables.
* It defines labels for all ZX81 characters.
* It generates bytes for a first BASIC line containing the compiled program (in a `REM` statement).
* It generates bytes for a second BASIC line calling the compiled program.
* It generates bytes for the display file (D_FILE).
* It assigns implicitly 4082h (16514) to the Program Counter.

To summarize, you only have to write the code of your assembly program and the assembler will take care of the rest.

The following labels are created for system variables at the start of the RAM:

| Label  | Value | Size |
|--------|-------|------|
| ERR_NR | 4000h | 1    |
| FLAGS  | 4001h | 1    |
| ERR_SP | 4002h | 2    |
| RAMTOP | 4004h | 2    |
| MODE   | 4006h | 1    |
| PPC    | 4007h | 2    |
| VERSN  | 4009H | 1    |
| E_PPC  | 400AH | 2    |
| D_FILE | 400CH | 2    |
| DF_CC  | 400EH | 2    |
| VARS   | 4010H | 2    |
| DEST   | 4012H | 2    |
| E_LINE | 4014H | 2    |
| CH_ADD | 4016H | 2    |
| X_PTR  | 4018H | 2    |
| STKBOT | 401AH | 2    |
| STKEND | 401CH | 2    |
| BERG   | 401EH | 1    |
| MEM    | 401FH | 2    |
| SPARE1 | 4021H | 1    |
| DF_SZ  | 4022H | 1    |
| S_TOP  | 4023H | 2    |
| LAST_K | 4025H | 2    |
| DB_ST  | 4027H | 1    |
| MARGIN | 4028H | 1    |
| NXTLIN | 4029H | 2    |
| OLDPPC | 402BH | 2    |
| FLAGX  | 402DH | 1    |
| STRLEN | 402EH | 2    |
| T_ADDR | 4030H | 2    |
| SEED   | 4032H | 2    |
| FRAMES | 4034H | 2    |
| COORDS | 4036H | 2    |
| PR_CC  | 4038H | 1    |
| S_POSN | 4039H | 2    |
| CDFLAG | 403BH | 1    |
| PRBUF  | 403CH | 33   |
| MEMBOT | 404DH | 30   |
| SPARE2 | 407DH | 2    |

The following labels are defined for ZX81 printable characters:

| Label | Value | Character                   | | Label | Value | Character                   |
|-------|-------|-----------------------------|-|-------|-------|-----------------------------|
| __    | 00h   | ![](./images/ZX81-0x00.png) | |       |       |                             |
| _SPC  | 00h   | ![](./images/ZX81-0x00.png) | | _SPCV | 80h   | ![](./images/ZX81-0x80.png) |
| _DQT  | 0bh   | ![](./images/ZX81-0x0B.png) | | _DQTV | 8bh   | ![](./images/ZX81-0x8B.png) |
| _PND  | 0ch   | ![](./images/ZX81-0x0C.png) | | _PNDV | 8ch   | ![](./images/ZX81-0x8C.png) |
| _DLR  | 0dh   | ![](./images/ZX81-0x0D.png) | | _DLRV | 8dh   | ![](./images/ZX81-0x8D.png) |
| _CLN  | 0eh   | ![](./images/ZX81-0x0E.png) | | _CLNV | 8eh   | ![](./images/ZX81-0x8E.png) |
| _QMK  | 0fh   | ![](./images/ZX81-0x0F.png) | | _QMKV | 8fh   | ![](./images/ZX81-0x8F.png) |
| _OBR  | 10h   | ![](./images/ZX81-0x10.png) | | _OBRV | 90h   | ![](./images/ZX81-0x90.png) |
| _CBR  | 11h   | ![](./images/ZX81-0x11.png) | | _CBRV | 91h   | ![](./images/ZX81-0x91.png) |
| _GTH  | 12h   | ![](./images/ZX81-0x12.png) | | _GTHV | 92h   | ![](./images/ZX81-0x92.png) |
| _LTH  | 13h   | ![](./images/ZX81-0x13.png) | | _LTHV | 93h   | ![](./images/ZX81-0x93.png) |
| _EQU  | 14h   | ![](./images/ZX81-0x14.png) | | _EQUV | 94h   | ![](./images/ZX81-0x94.png) |
| _PLS  | 15h   | ![](./images/ZX81-0x15.png) | | _PLSV | 95h   | ![](./images/ZX81-0x95.png) |
| _MNS  | 16h   | ![](./images/ZX81-0x16.png) | | _MNSV | 96h   | ![](./images/ZX81-0x96.png) |
| _ASK  | 17h   | ![](./images/ZX81-0x17.png) | | _ASKV | 97h   | ![](./images/ZX81-0x97.png) |
| _SLS  | 18h   | ![](./images/ZX81-0x18.png) | | _SLSV | 98h   | ![](./images/ZX81-0x98.png) |
| _SMC  | 19h   | ![](./images/ZX81-0x19.png) | | _SMCV | 99h   | ![](./images/ZX81-0x99.png) |
| _CMA  | 1ah   | ![](./images/ZX81-0x1A.png) | | _CMAV | 9ah   | ![](./images/ZX81-0x9A.png) |
| _FST  | 1bh   | ![](./images/ZX81-0x1B.png) | | _FSTV | 9bh   | ![](./images/ZX81-0x9B.png) |
| _0    | 1ch   | ![](./images/ZX81-0x1C.png) | | _0V   | 9ch   | ![](./images/ZX81-0x9C.png) |
| _1    | 1dh   | ![](./images/ZX81-0x1D.png) | | _1V   | 9dh   | ![](./images/ZX81-0x9D.png) |
| _2    | 1eh   | ![](./images/ZX81-0x1E.png) | | _2V   | 9eh   | ![](./images/ZX81-0x9E.png) |
| _3    | 1fh   | ![](./images/ZX81-0x1F.png) | | _3V   | 9fh   | ![](./images/ZX81-0x9F.png) |
| _4    | 20h   | ![](./images/ZX81-0x20.png) | | _4V   | a0h   | ![](./images/ZX81-0xA0.png) |
| _5    | 21h   | ![](./images/ZX81-0x21.png) | | _5V   | a1h   | ![](./images/ZX81-0xA1.png) |
| _6    | 22h   | ![](./images/ZX81-0x22.png) | | _6V   | a2h   | ![](./images/ZX81-0xA2.png) |
| _7    | 23h   | ![](./images/ZX81-0x23.png) | | _7V   | a3h   | ![](./images/ZX81-0xA3.png) |
| _8    | 24h   | ![](./images/ZX81-0x24.png) | | _8V   | a4h   | ![](./images/ZX81-0xA4.png) |
| _9    | 25h   | ![](./images/ZX81-0x25.png) | | _9V   | a5h   | ![](./images/ZX81-0xA5.png) |
| _A    | 26h   | ![](./images/ZX81-0x26.png) | | _AV   | a6h   | ![](./images/ZX81-0xA6.png) |
| _B    | 27h   | ![](./images/ZX81-0x27.png) | | _BV   | a7h   | ![](./images/ZX81-0xA7.png) |
| _C    | 28h   | ![](./images/ZX81-0x28.png) | | _CV   | a8h   | ![](./images/ZX81-0xA8.png) |
| _D    | 29h   | ![](./images/ZX81-0x29.png) | | _DV   | a9h   | ![](./images/ZX81-0xA9.png) |
| _E    | 2ah   | ![](./images/ZX81-0x2A.png) | | _EV   | aah   | ![](./images/ZX81-0xAA.png) |
| _F    | 2bh   | ![](./images/ZX81-0x2B.png) | | _FV   | abh   | ![](./images/ZX81-0xAB.png) |
| _G    | 2ch   | ![](./images/ZX81-0x2C.png) | | _GV   | ach   | ![](./images/ZX81-0xAC.png) |
| _H    | 2dh   | ![](./images/ZX81-0x2D.png) | | _HV   | adh   | ![](./images/ZX81-0xAD.png) |
| _I    | 2eh   | ![](./images/ZX81-0x2E.png) | | _IV   | aeh   | ![](./images/ZX81-0xAE.png) |
| _J    | 2fh   | ![](./images/ZX81-0x2F.png) | | _JV   | afh   | ![](./images/ZX81-0xAF.png) |
| _K    | 30h   | ![](./images/ZX81-0x30.png) | | _KV   | b0h   | ![](./images/ZX81-0xB0.png) |
| _L    | 31h   | ![](./images/ZX81-0x31.png) | | _LV   | b1h   | ![](./images/ZX81-0xB1.png) |
| _M    | 32h   | ![](./images/ZX81-0x32.png) | | _MV   | b2h   | ![](./images/ZX81-0xB2.png) |
| _N    | 33h   | ![](./images/ZX81-0x33.png) | | _NV   | b3h   | ![](./images/ZX81-0xB3.png) |
| _O    | 34h   | ![](./images/ZX81-0x34.png) | | _OV   | b4h   | ![](./images/ZX81-0xB4.png) |
| _P    | 35h   | ![](./images/ZX81-0x35.png) | | _PV   | b5h   | ![](./images/ZX81-0xB5.png) |
| _Q    | 36h   | ![](./images/ZX81-0x36.png) | | _QV   | b6h   | ![](./images/ZX81-0xB6.png) |
| _R    | 37h   | ![](./images/ZX81-0x37.png) | | _RV   | b7h   | ![](./images/ZX81-0xB7.png) |
| _S    | 38h   | ![](./images/ZX81-0x38.png) | | _SV   | b8h   | ![](./images/ZX81-0xB8.png) |
| _T    | 39h   | ![](./images/ZX81-0x39.png) | | _TV   | b9h   | ![](./images/ZX81-0xB9.png) |
| _U    | 3ah   | ![](./images/ZX81-0x3A.png) | | _UV   | bah   | ![](./images/ZX81-0xBA.png) |
| _V    | 3bh   | ![](./images/ZX81-0x3B.png) | | _VV   | bbh   | ![](./images/ZX81-0xBB.png) |
| _W    | 3ch   | ![](./images/ZX81-0x3C.png) | | _WV   | bch   | ![](./images/ZX81-0xBC.png) |
| _X    | 3dh   | ![](./images/ZX81-0x3D.png) | | _XV   | bdh   | ![](./images/ZX81-0xBD.png) |
| _Y    | 3eh   | ![](./images/ZX81-0x3E.png) | | _YV   | beh   | ![](./images/ZX81-0xBE.png) |
| _Z    | 3fh   | ![](./images/ZX81-0x3F.png) | | _ZV   | bfh   | ![](./images/ZX81-0xBF.png) |


The following labels are defined for ZX81 non-printable characters and keywords:

| Label      | Value |
|------------|-------|
| _RND       | 40h   |
| _INKEY$    | 41h   |
| _PI        | 42h   |
| _UP        | 70h   |
| _DOWN      | 71h   |
| _LEFT      | 72h   |
| _RIGHT     | 73h   |
| _GRAPHICS  | 74h   |
| _EDIT      | 75h   |
| _NEWLINE   | 76h   |
| _NL        | 76h   |
| _RUBOUT    | 77h   |
| _KL_MODE   | 78h   |
| _FUNCTION  | 79h   |
| _NUMBER    | 7Eh   |
| _CURSOR    | 7Fh   |
| _DQUOTES   | C0h   |
| _AT        | C1h   |
| _TAB       | C2h   |
| _CODE      | C4h   |
| _VAL       | C5h   |
| _LEN       | C6h   |
| _SIN       | C7h   |
| _COS       | C8h   |
| _TAN       | C9h   |
| _ASN       | CAh   |
| _ACS       | CBh   |
| _ATN       | CCh   |
| _LN        | CDh   |
| _EXP       | CEh   |
| _INT       | CFh   |
| _SQR       | D0h   |
| _SGN       | D1h   |
| _ABS       | D2h   |
| _PEEK      | D3h   |
| _USR       | D4h   |
| _STR$      | D5h   |
| _CHR$      | D6h   |
| _NOT       | D7h   |
| _PWR       | D8h   |
| _OR        | D9h   |
| _AND       | DAh   |
| _LESS      | DBh   |
| _GREATER   | DCh   |
| _NOT_EQUAL | DDh   |
| _THEN      | DEh   |
| _TO        | DFh   |
| _STEP      | E0h   |
| _LPRINT    | E1h   |
| _LLIST     | E2h   |
| _STOP      | E3h   |
| _SLOW      | E4h   |
| _FAST      | E5h   |
| _NEW       | E6h   |
| _SCROLL    | E7h   |
| _CONT      | E8h   |
| _DIM       | E9h   |
| _REM       | EAh   |
| _FOR       | EBh   |
| _GOTO      | ECh   |
| _GOSUB     | EDh   |
| _INPUT     | EEh   |
| _LOAD      | EFh   |
| _LIST      | F0h   |
| _LET       | F1h   |
| _PAUSE     | F2h   |
| _NEXT      | F3h   |
| _POKE      | F4h   |
| _PRINT     | F5h   |
| _PLOT      | F6h   |
| _RUN       | F7h   |
| _SAVE      | F8h   |
| _RAND      | F9h   |
| _IF        | FAh   |
| _CLS       | FBh   |
| _UNPLOT    | FCh   |
| _CLEAR     | FDh   |
| _RETURN    | FEh   |
| _COPY      | FFh   |

#### ZX81raw device

When `device zx81raw` is specified in the source code, the assembler does not define labels or emit any code.
It is up to you to define labels and to generate the prefix and postfix bytes.
This device is especially useful when taking an existing ZX81 program that already define labels.
In this mode, strings are still translated, as described previously, between ASCII and the ZX81 characters set.

#### Z80 device

This is similar to `ZX81raw` device, but in this mode, strings are not translated.

### byte Directive

The `byte` directive defines a sequence of bytes and their values. The values are separated by commas and can be expressions, characters or strings.
The formats are the following:

```
[label]  byte expression [, expression ...]
[label] .byte expression [, expression ...]
[label]  db   expression [, expression ...]
[label]  dm   expression [, expression ...]
[label]  defb expression [, expression ...]
[label]  defm expression [, expression ...]
```

Examples:

```
label1:
  byte 'a', $76, "TEST", _NL
```

### word Directive

The `word` directive defines a sequence of 16-bit words and their values. 
The values are separated by commas and can be expressions. 
They are stored in little-endian format with the least significant byte first, followed by the most significant byte.
The formats are the following:

```
[label]  word expression [, expression ...]
[label] .word expression [, expression ...]
[label]  dw   expression [, expression ...]
[label]  defw expression [, expression ...]
```

Examples:

```
label1:
  word 0xABCD, %0100002000000000
```

### block Directive

The `block` directive defines a sequence of bytes that are filled with the same value. The formats are the following:

```
[label]  block expression [, expression]
[label] .block expression [, expression]
[label]  ds    expression [, expression]
[label]  defs  expression [, expression]
```

The first expression gives the number of bytes, the second and optional expression gives the value to used to fill the bytes.
If this value is omitted, the block is filled with zeros.

### end Directive

The `end` directive stopped the generation of the binary. It is optional. If it is omitted, the generation stops at the end of the file.

## Comments

Comments begin with a semicolon (`;`) or two slashes (`//`). The rest of the line from the semicolon to the end of the line is ignored.


## Limitations

* No support for non-official Z80 opcodes.
* No support for fake instructions like `LD BC, DE`. The actual corresponding opcodes are `LD B, D` and  `LD C, E`.
* No support for structures.
* No support for conditional assembly and macros.
* Each instruction has to be on a separate line.
* It is not allowed to declare labels with the same name as an instruction. So, for example, `ld` is not an allowed name for a label.
