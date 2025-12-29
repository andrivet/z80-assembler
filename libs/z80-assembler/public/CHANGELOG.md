# Changelog

## 2.0.0 - December 29, 2025

* Fix propagation or source file name in case of compilation error.
* Allowed device names are now:
  - zx81: automatic generation of system variables, BASIC REM lines, etc. for the ZX81
  - zx81-raw: without automatic generation of code but with translation for the ZX81 (characters)
  - z80: Generic Z80 code without any generation or translation specific to the ZX81. Characters are treated as ASCII (i.e. they are not translated).
* Strings are translated only for zx81 or zx81raw devices, not z80.
* Add undocumented instructions
  - Add support for IXh, IXl, IYh, IYl 8 bits registers
  - Add support of these registers for ADC, ADD, AND, CP, DEC, INC, OR, SBC, SUB and XOR
  - Add support of these registers for LD
  - Add support of (IX+d), (IY+d) to RL, RLC, RR, RRC, SLA, SRA, SRL
  - Add new instruction SSL
  - Add IN F, (C)
  - Add OUT (C), 0
* Add fake instructions
  - 16-bit rotate and shift
    * rl qq
    * rr qq
    * sla qq
    * sll qq, sli qq
    * sra qq
    * srl qq
  - 16-bit load
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
  - 16-bit load, increment
    * ldi qq, (hl)
    * ldi qq, (ix + nn)
    * ldi qq, (iy + nn)
    * ldi (hl), qq
    * ldi (ix + nn), qq
    * ldi (iy + nn), qq
  - 8-bit load, increment
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
  - 8-bit load, decrement
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
  - 16-bit arithmetic
    * adc de, ss
    * add de, ss
    * sbc de, ss
    * sub de, ss
    * sub hl, ss

## 1.4.1 - December 22, 2025

* Fix wrong publication

## 1.4.0 - December 22, 2025

* Fix #8: 'Invalid ZX81 character' when using '9', 'Z' or 'z' in a string.

## 1.3.2 - November 20, 2024

* Fix bugs introduced in commit 4bcb12ea82d38f83ce2079f8635909d0c5b5c57a
* Add more compilation tests

## 1.3.1 - November 20, 2024

* Remove french comments
* Fix issue #6 Labels are not generated in SLD when alone on a line

## 1.3.0 - June 28, 2023

* **1** - Allow (IX) and (IY) without an explicit offset. 
* **2** - Define the pseudo value $ for PC.
* **3** - Be more specific when an expression can't be evaluated.
* **5** - Recursive labels are now properly detected (max 20 recursions).

## 1.2.0 - June 20, 2023

* Solve issue with expression starting with an open parenthesis
* More comment (english and french)

## 1.1.0 - June 13, 2023

* Add special handling of ZX81 device
* Only allow ZX81 string (ASCII string do not make sense)
* Publication on GitHub Pages using GitHub Actions

## 1.0.0 - June 5, 2023

* First public version


