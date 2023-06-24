/**
 * Z80 Assembler in Typescript
 *
 * File:        Compiler.ts
 * Description: Compiler (assembler)
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */

/**
 * Assembler Z80 en Typescript
 *
 * Fichier:     Compiler.ts
 * Description: Compilateur (assembleur)
 * Author:			Sebastien Andrivet
 * License:			GPLv3
 * Copyrights: 	Copyright (C) 2023 Sebastien Andrivet
 */
import {Parser, PosInfo} from "../grammar/z80";
import {CompilationInfo, LinesInfo} from "../types/Types";
import {CompilationError} from "../types/Error";
import {computeLabels, generate} from "./Generator";
import {getUnknownLabels, resetLabels} from "./Labels";
import {
  assetBasicEnd,
  assetBasicLine1,
  assetBasicLine2,
  assetCharacters,
  assetDisplay,
  assetSystemVariables
} from "./Assets";

/**
 * Type of the internal data.
 * Type pour l'état interne.
 */
interface ParseDate {
  // The name of the output file as declared by the output directive.
  // Le nom du fichier de sortie comme déclaré par la directive output.
  outputName: string,
  // The name of the SLD file as declared by the output directive.
  // Le nom du fichier SLD comme déclaré par la directive output.
  sldName: string,
  // The name of the device as declared by the device directive.
  // Le nom d'appareil comme déclaré par la directive device.
  deviceName: string,
  // The base path of first file compiled. It is used to load included files.
  // Le chemin de base du premier fichier compilé. It est utilisé pour charger les fichiers inclus.
  basePath: string,
  // The name of the current file compiled. It changes when a file is included and parsed.
  // Le nom du fichier en train d'être compilé. Il change lorsqu'un fichier est inclus et analysé.
  fileName: string,
  // The function to use when including a file to get its source code.
  // La fonction à utiliser quand un fichier est inclus pour obtenir son code source.
  getFileCode: (filename: string) => string //
}

/**
 * Internal data (i.e. globals).
 * Unfortunately, tsPEG does not allow to declare a context for the parsing.
 * So instead, we use this ugly global.
 * Données internes (c.-à-d. globales).
 * Malheureusement, tsPEG ne permet pas de déclarer un contexte pour l'analyse.
 * Donc à la place, j'utilise ces données globales assez horribles.
 */
const parseData: ParseDate = {
  outputName: "",
  sldName: "",
  deviceName: "",
  basePath: '',
  fileName: '',
  getFileCode: () => ''
};

/**
 * Set the outputs names (output directive).
 * Définit les noms des fichiers de sortie (directive output).
 * @param filename Filename for the binary.
 *                 Nom de fichier pour le binaire.
 * @param sld Filename for the SLD.
 *            Nom de fichier pour le SLD.
 */
function setOutputName(filename: string, sld?: string) {
  parseData.outputName = filename;
  parseData.sldName = sld ? sld : filename.replace(/\.P$/, '.sld');
}

/**
 * Set the name of the target (device directive)
 * Définit le nom de la cible (directive device).
 * @param name The name of the device
 *             Le nom de l'appareil.
 */
function setDevice(name: string) {
  parseData.deviceName = name.toLowerCase();
}

/**
 * Include an assembly file (include directive).
 * Inclut un fichier assembleur (directive include).
 * @param pos Position of the include directive.
 *            Position de la directive.
 * @param filename The filename of the file to be included.
 *                 Le nom du fichier à inclure.
 */
function includeFile(pos: PosInfo, filename: string): LinesInfo {
  const filepath = parseData.basePath + filename;
  // Ask the code for the file to be included
  // Demande le code du fichier à inclure.
  const code = parseData.getFileCode(filepath);
  // Return the lines (AST) and the associated filename.
  // Retourne les lignes (AST) et le nom de fichier associé.
  return parseCode(filepath, code);
}

/**
 * Parse some assembly code.
 * Analyse du code assembleur.
 * @param filename Name of the file corresponding to the code.
 *                 Nom du fichier correspondant au code.
 * @param code The code to parse.
 *             Le code à analyser.
 */
function parseCode(filename: string, code: string): LinesInfo {
  // It is not possible to attach a context to the parsing, so use this dirty trick.
  // Il n'est pas possible d'attacher un contexte à l'analyse, donc utilise cette astuce sale.
  const oldFileName = parseData.fileName;
  parseData.fileName = filename;

  // If the code does not end with a new line, add it.
  // Si le code ne se termine pas par une fin de ligne, ajoutons la.
  if(!code.endsWith('\n')) code += '\n';
  // Declare a parser for the code.
  // Déclare un analyseur pour le code.
  const parser = new Parser(code);
  // Parse the code.
  // Analyse le code.
  const result = parser.parse();
  parseData.fileName = oldFileName;

  // If there is an error, raise an exception.
  // S'il y a une erreur, on lève une exception.
  if(result.errs.length > 0)
    throw CompilationError.fromSyntaxErr(filename, result.errs[0])
  // Returns the lines, i.e. the AST
  // On retourne les lignes.
  return {lines: result.ast?.lines ?? [], filename: filename};
}

/**
 * Get the file name of a file path.
 * Obtient le nom de fichier depuis un chemin
 * @param filepath The file path.
 *                 Le chemin.
 */
function getBasePath(filepath: string): string {
  let index = filepath.lastIndexOf('/');
  if(index === -1)
    index = filepath.lastIndexOf('\\');
  if(index === -1)
    return '';
  return filepath.substring(0, index + 1);
}

/**
 * Compile an assembly source code.
 * Compile un fichier source assembleur.
 * @param filepath The file path of the source code.
 *                 Le chemin du code source.
 * @param code The assembly source code.
 *             Le code source assembleur.
 * @param getFileCode A function to get the content of included files.
 *                    Une fonction pour obtenir le contenu d'un fichier inclus.
 */
function compile(filepath: string, code: string, getFileCode: (filename: string) => string): CompilationInfo {
  // Set default values globally
  // Définit les valeurs globales par défaut.
  parseData.outputName = filepath.replace(/\..*$/, '') + '.P';
  parseData.sldName = parseData.outputName.replace(/\.P$/, '.sld');
  parseData.basePath = getBasePath(filepath);
  parseData.getFileCode = getFileCode;

  try {
    // Reset the labels.
    // Réinitialisation des étiquettes.
    resetLabels();
    // Parse this source code.
    // Analyse du code source.
    const parsed = postProcessing(parseCode(filepath, code));
    // Compute the value of the labels.
    // Calcul de la valeur des étiquettes.
    computeLabels(0, parsed);
    // Do we have labels with unknown values?
    // Est-ce que des étiquettes n'ont pas de valeur ?
    const unknowns = getUnknownLabels().join(', ');
    if(unknowns.length > 0)
      throw new CompilationError({filename: parseData.fileName, pos: {line: 1, offset: 0, overallPos: 0}},
        `Unknown value for labels: ${unknowns}`);

    const generated = generate(filepath, 0, parsed);

    // Generate the bytes, the SLD and return them.
    // Génère les octets et le SLD et les retourne.
    return {
      outputName: parseData.outputName,
      bytes: generated.bytes,
      sld: generated.sld,
      errs: []
    };
  }
  catch(ex: any) { // eslint-disable-line
    // Return the errors.
    // Retourne les erreurs.
    return {
      outputName: parseData.outputName,
      bytes: [],
      sld: '',
      errs: [CompilationError.fromAny(parseData.fileName, ex)]
    };
  }
}

/**
 * Processing of the AST after the parsing. This is used to inject code specific to the ZX81.
 * Traitement de l'AST après analyse. C'est utilisé pour injecter du code spécifique au ZX81.
 * @param info The parsed AST (lines).
 *             L'AST analysée (les lignes).
 */
function postProcessing(info: LinesInfo): LinesInfo[] {
  if(parseData.deviceName !== 'zx81') return [info];

  return [
    parseCode('@internal/characters.zx81', assetCharacters),
    parseCode('@internal/system-variables.zx81', assetSystemVariables),
    parseCode('@internal/basic-line1.zx81', assetBasicLine1),
    info,
    parseCode('@internal/basic-line2.zx81', assetBasicLine2),
    parseCode('@internal/display.zx81', assetDisplay),
    parseCode('@internal/basic-end.zx81', assetBasicEnd)
  ];
}

export {parseData, compile, includeFile, setOutputName, setDevice};
