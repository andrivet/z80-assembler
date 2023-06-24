/**
 * Z80 Assembler in Typescript
 *
 * File:        Labels.ts
 * Description: Labels associated to locations in memory
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Assembler Z80 en Typescript
 *
 * Fichier:     Labels.ts
 * Description: Etiquettes associées à des emplacements mémoire.
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Expression, PosInfo} from "../grammar/z80";
import {Address, Position} from '../types/Types';
import {CompilationError} from "../types/Error";


/**
 * A label, i.e. a name associated with a value or an address.
 * Une étiquette, c.-à-d. un nom associé à une valeur ou une adresse.
 */
interface Label {
  // Expression associated with the label.
  // L'expression associée à cette étiquette.
  expression: Expression | null;
  // The value associated with the label.
  // La valeur associée à cette étiquette.
  value: number;
  // Is the value known, or it has to be computed?
  // Est-ce que la valeur est connue, ou elle doit être calculée.
  known: boolean;
  // Is the label used in the program or only declared?
  // Est-ce que l'étiquette est utilisée dans le programme ou seulement déclarée ?
  used: boolean;
}

/**
 * Labels are stored as a map.
 * Les étiquettes sont stoquées dans une table d'associations.
 */
type Labels = Map<string, Label>;

/**
 * A global variable with all the labels of the program.
 * Une variable globale avec toutes les étiquettes du programme.
 */
const labels: Labels = new Map<string, Label>();

/**
 * Reset the labels.
 * Supprime toutes les étiquettes.
 */
function resetLabels() {
  labels.clear();
}

/**
 * Add a label.
 * Ajoute une étiquette.
 * @param pos The position of the label in the source code.
 *            La position de l'étiquette dans le code source.
 * @param name The name of the label.
 *             Le nom de l'étiquette.
 * @param value The value of the label (if known) or null (if unknown).
 *              La valeur de l'étiquette (si connue) ou null (si inconnue).
 */
function addLabel(pos: Position, name: string, value: number | null) {
  // Do we have already a label with this name?
  // Est-ce que l'on a déjà une étiquette avec ce nom ?
  const label = labels.get(name);
  if(!label) {
    // No, so create a new label and record it.
    // Non, alors on crée une nouvelle étiquette et on s'en souvient.
    labels.set(name, {expression: null, value: value ?? 0, known: value != null, used: false});
    return;
  }

  // Yes, we already have a label with this name. Is its value known and it is the same?
  // Oui, on a déjà une étiquette avec ce nom. Est-ce que sa valeur est connue et est la même?
  if(label.known && label.value != value) {
    // The values are not the same, so raise a compilation error.
    // Les valeurs ne sont pas les mêmes alors lève une error de compilation.
    throw new CompilationError(pos,
      `The value of the label '${name}' is redefined (old value: ${label.value}, new value: ${value})`);
  }

  // Set the value.
  // Fixe la valeur.
  label.value = value ?? 0;
  // If the value is not null, it is known.
  // Si la valeur n'est pas nulle, est est connue.
  label.known = value != null;
}

/**
 * Add a label and its associated expression.
 * Ajoute une étiquette et son expression associée.
 * @param _ The position of the label in the source code.
 *          La position de l'étiquette dans le code source.
 * @param name The name of the label.
 *             Le nom de l'étiquette.
 * @param expression The expression that gives that value of the label.
 *                   L'expression qui donne la valeur de l'étiquette.
 */
function addLabelExpression(_: PosInfo, name: string, expression: Expression) {
  // Do we have already a label with this name?
  // Est-ce que l'on a déjà une étiquette avec ce nom ?
  const label = labels.get(name);
  if(!label) {
    // No, so create a new label and record it.
    // Non, alors on crée une nouvelle étiquette et on s'en souvient.
    labels.set(name, {expression: expression, value: 0, known: false, used: false});
    return;
  }

  // Yes, we already have a label with this name. If the value is already known, nothing more to do.
  // Oui, on a déjà une étiquette avec ce nom. Si la valeur est connue, il n'y a rien d'autre à faire.
  if(label.known) return;
  // If the value is unknown, record the expression.
  // Si la valeur est inconnue, on se souvient de l'expression.
  label.expression = expression;
}

/**
 * Get the value associated with a label.
 * Obtient la valeur associée avec une étiquette.
 * @param pc: Current program counter (PC).
 * @param name The name of the label.
 *             Le nom de l'étiquette.
 * @param pos Where this label is used.
 * @param mode Options when getting the value.
 *             Options lorsque l'on récupère la valeur.
 * @return The value associated with a label or null if it is unknown.
 *         La valeur associée avec l'étiquette ou null si elle est inconnue.
 */
function getLabelValue(pc: Address, name: string, pos: Position, setUsed: boolean, mustExist: boolean): number | null {
  // Pseudo label $
  if(name === '$') return pc;

  // Do we have a label with this name?
  // Est-ce que l'on a déjà une étiquette avec ce nom ?
  const label = labels.get(name);
  if(!label) {
    if(mustExist) throw new CompilationError(pos, `Label '${name}' is undefined`);
    // No, so create a new label and record it as unknown.
    // Non, alors on crée une nouvelle étiquette et on s'en souvient. La valeur est inconnue.
    labels.set(name, {expression: null, value: 0, known: false, used: true});
    return null; // Value unknown. Valeur inconnue.
  }

  // Yes, we have a label with this name.
  // Oui, on a une étiquette avec ce nom.

  // If setUsed, record that this label is used in the program.
  // Si setUsed est vrai, on enregistre que cette étiquette est utilisée dans le programme.
  if(setUsed) label.used = true;
  // If the value is already known, return it.
  // Si la valeur est connue, on la retourne.
  if(label.known) return label.value;
  // If the value is unknown and there is no expression, we do not know how to compute the value so return null.
  // Si la valeur est inconnue et qu'il n'y a pas d'expression, on ne sait pas comment calculer cette valeur donc on retourne null.
  if(label.expression == null) {
    if(mustExist) throw new CompilationError(pos, `Label '${name}' is undefined`);
    return null;
  }

  // The value is currently unknown, but we have an expression to compute it. So try to compute it.
  // La valeur est actuellement inconnue mais on a une expression pour la calculer. Donc on essaie de la calculer.
  const value = label.expression.eval(pc, mustExist);
  // It was not possible to compute the value yet, so return null.
  // S'il n'est pas encore possible de calculer la valeur, on retourne null.
  if(value == null) {
    if(mustExist) throw new CompilationError(pos, `Label '${name}' is undefined`);
    return null;
  }

  // We were able to compute the value so record it, and it is now known.
  // On a pu calculer la valeur donc on s'en souvient et la valeur est maintenant connue.
  label.value = value;
  label.known = true;
  return value;
}

/**
 * Is a label used in the program or only declared?
 * Est-ce qu'une étiquette a été utilisée ou seulement déclarée ?
 * @param name The name of the label.
 *             Le nom de l'étiquette.
 * @return true if the label is used, false otherwise.
 *         true si l'étiquette a été utilisée, false sinon.
 */
function isLabelUsed(name: string) {
  const label = labels.get(name);
  return label?.used;
}

/**
 * Get the list of labels with an unknown value.
 * Retourne la liste des étiquettes avec une valeur inconnue.
 */
function getUnknownLabels(): string[] {
  return [...labels.entries()]
    .filter(([, label]) => !label.known && label.value == null)
    .map(([name]) => name);
}

export {resetLabels, addLabel, addLabelExpression, getLabelValue, isLabelUsed, getUnknownLabels}
