/**
 * Z80 Assembler in Typescript
 *
 * File:        Labels.ts
 * Description: Labels associated to locations in memory
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Expression, PosInfo} from "../grammar/z80";

type Label = {
  expression: Expression | null;
  value: number;
  known: boolean;
  used: boolean;
};

type Labels = Map<string, Label>;

const labels: Labels = new Map<string, Label>();

function resetLabels() {
  labels.clear();
}

function addLabel(_: PosInfo, name: string, value: number | null) {
  const label = labels.get(name);
  if(!label) {
    labels.set(name, {expression: null, value: value ?? 0, known: value != null, used: false});
    return;
  }

  if(label.known) {
   label.value = value ?? 0;
   label.known = value != null;
   return;
  }

  label.value = value ?? 0;
  label.known = value != null;
}

function addLabelExpression(_: PosInfo, name: string, expression: Expression) {
  const label = labels.get(name);
  if(!label) {
    labels.set(name, {expression: expression, value: 0, known: false, used: false});
    return;
  }

  if(label.known) return;
  label.expression = expression;
}

function getLabelValue(name: string, setUsed = true): number | null {
  const label = labels.get(name);
  if(!label) {
    labels.set(name, {expression: null, value: 0, known: false, used: true});
    return null;
  }

  if(setUsed) label.used = true;
  if(label.known) return label.value;
  if(label.expression == null) return null;

  const value = label.expression.eval();
  if(value == null) return null;

  label.value = value;
  label.known = true;
  return value;
}

function isLabelUsed(name: string) {
  const label = labels.get(name);
  return label && label.used;
}

function getUnknownLabels(): string[] {
  return [...labels.entries()]
    .filter(([, label]) => !label.known && label.value == null)
    .map(([name]) => name);
}

export {resetLabels, addLabel, addLabelExpression, getLabelValue, isLabelUsed, getUnknownLabels}
