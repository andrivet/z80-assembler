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
import {Address, Position} from '../types/Types';
import {CompilationError} from "../types/Error";


/**
 * A label, i.e. a name associated with a value or an address.
 */
interface Label {
  // Expression associated with the label.
  expression: Expression | null;
  // The value associated with the label.
  value: number;
  // Is the value known, or it has to be computed?
  known: boolean;
  // Is the label used in the program or only declared?
  used: boolean;
}

/**
 * Labels are stored as a map.
 */
type Labels = Map<string, Label>;

/**
 * A global variable with all the labels of the program.
 */
const labels: Labels = new Map<string, Label>();

let getLabelValueRecursion = 0;

/**
 * Reset the labels.
 */
function resetLabels() {
  labels.clear();
}

function resetLabelsRecursion() {
  getLabelValueRecursion = 0;
}

/**
 * Add a label.
 * @param pos The position of the label in the source code.
 * @param name The name of the label.
 * @param value The value of the label (if known) or null (if unknown).
 */
function addLabel(pos: Position, name: string, value: number | null) {
  // Do we have already a label with this name?
  const label = labels.get(name);
  if(!label) {
    // No, so create a new label and record it.
    labels.set(name, {expression: null, value: value ?? 0, known: value != null, used: false});
    return;
  }

  // Yes, we already have a label with this name. Is its value known and it is the same?
  if(label.known && label.value != value) {
    // The values are not the same, so raise a compilation error.
    throw new CompilationError(pos,
      `The value of the label '${name}' is redefined (old value: ${label.value}, new value: ${value})`);
  }

  // Set the value.
  label.value = value ?? 0;
  // If the value is not null, it is known.
  label.known = value != null;
}

/**
 * Add a label and its associated expression.
 * @param _ The position of the label in the source code.
 * @param name The name of the label.
 * @param expression The expression that gives that value of the label.
 */
function addLabelExpression(_: PosInfo, name: string, expression: Expression) {
  // Do we have already a label with this name?
  const label = labels.get(name);
  if(!label) {
    // No, so create a new label and record it.
    labels.set(name, {expression: expression, value: 0, known: false, used: false});
    return;
  }

  // Yes, we already have a label with this name. If the value is already known, nothing more to do.
  if(label.known) return;
  // If the value is unknown, record the expression.
  label.expression = expression;
}

/**
 * Get the value associated with a label.
 * @param pc Current program counter (PC).
 * @param name The name of the label.
 * @param pos Where this label is used.
 * @param setUsed If set, mark the label as used.
 * @param mustExist If set, the value of the label has to be known (not null).
 * @return The value associated with a label or null if it is unknown.
 */
function getLabelValue(pc: Address, name: string, pos: Position, setUsed: boolean, mustExist: boolean): number | null {
  if(getLabelValueRecursion > 20)
    throw new CompilationError(pos, `Label '${name}' is undetermined (too many recursions)`);

  // Pseudo label $
  if(name === '$') return pc;

  // Do we have a label with this name?
  const label = labels.get(name);
  if(!label) {
    if(mustExist) throw new CompilationError(pos, `Label '${name}' is undefined`);
    // No, so create a new label and record it as unknown.
    labels.set(name, {expression: null, value: 0, known: false, used: true});
    return null; // Value unknown. Valeur inconnue.
  }

  // Yes, we have a label with this name.

  // If setUsed, record that this label is used in the program.
  if(setUsed) label.used = true;
  // If the value is already known, return it.
  if(label.known) return label.value;
  // If the value is unknown and there is no expression, we do not know how to compute the value so return null.
  if(label.expression == null) {
    if(mustExist) throw new CompilationError(pos, `Label '${name}' is undefined`);
    return null;
  }

  // The value is currently unknown, but we have an expression to compute it. So try to compute it.
  getLabelValueRecursion += 1;
  const value = label.expression.eval(pc, mustExist);
  getLabelValueRecursion -= 1;
  // It was not possible to compute the value yet, so return null.
  if(value == null) {
    if(mustExist) throw new CompilationError(pos, `Label '${name}' is undefined`);
    return null;
  }

  // We were able to compute the value so record it, and it is now known.
  label.value = value;
  label.known = true;
  return value;
}

/**
 * Is a label used in the program or only declared?
 * @param name The name of the label.
 * @return true if the label is used, false otherwise.
 */
function isLabelUsed(name: string) {
  const label = labels.get(name);
  return label?.used;
}

export {resetLabels, resetLabelsRecursion, addLabel, addLabelExpression, getLabelValue, isLabelUsed}
