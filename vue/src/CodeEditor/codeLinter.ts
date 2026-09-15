/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { parse } from 'acorn';
import { EditorState } from '@codemirror/state';
import { ensureSyntaxTree } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { Diagnostic, linter } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { translate } from 'CoreHome';

// Checks of the injected code:
// - JavaScript syntax of the <script> blocks with acorn, JSON (eg JSON-LD) with JSON.parse
// - HTML and CSS syntax with the error nodes of the editor syntax tree (Lezer)
// - unclosed <script> and <style> tags, code pasted without any tag
// Problems are only reported in the editor: saving is not blocked.

const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const STYLE_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;
const TAG_PATTERN = /<[a-z!/]/i;
const TYPE_ATTRIBUTE_PATTERN = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const JSON_POSITION_PATTERN = /position (\d+)/;
const SNIPPET_PATTERN = /^\S{1,30}/;

const JAVASCRIPT_TYPES = [
  '',
  'text/javascript',
  'application/javascript',
  'text/ecmascript',
  'application/ecmascript',
  'module',
];
const JSON_TYPES = ['application/json', 'application/ld+json'];

const MAX_SYNTAX_DIAGNOSTICS = 20;
const SYNTAX_TREE_TIMEOUT = 1000;

const htmlSupport = html();

interface AcornSyntaxError extends SyntaxError {
  pos?: number;
  raisedAt?: number;
}

interface Range {
  from: number;
  to: number;
}

function getScriptType(attributes: string): string {
  const match = attributes.match(TYPE_ATTRIBUTE_PATTERN);
  const type = match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
  return type.trim().toLowerCase();
}

function makeDiagnostic(
  from: number,
  to: number,
  message: string,
  severity: Diagnostic['severity'] = 'error',
): Diagnostic {
  return {
    from,
    to: Math.max(to, from),
    severity,
    message,
  };
}

function findElements(code: string, pattern: RegExp): Range[] {
  const ranges: Range[] = [];

  pattern.lastIndex = 0;
  let match = pattern.exec(code);
  while (match) {
    ranges.push({ from: match.index, to: match.index + match[0].length });
    match = pattern.exec(code);
  }

  return ranges;
}

function isInRanges(position: number, ranges: Range[]): boolean {
  return ranges.some((range) => position >= range.from && position < range.to);
}

// an unclosed <script> or <style> makes the browser read the rest of the Matomo page as its content
function findUnclosedTag(code: string, tagName: string): Range | null {
  const openingPattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const closingPattern = new RegExp(`<\\/${tagName}\\s*>`, 'i');

  let match = openingPattern.exec(code);
  while (match) {
    const contentStart = match.index + match[0].length;
    const closing = code.slice(contentStart).search(closingPattern);
    if (closing === -1) {
      return { from: match.index, to: contentStart };
    }
    openingPattern.lastIndex = contentStart + closing;
    match = openingPattern.exec(code);
  }

  return null;
}

function lintJavaScript(code: string, offset: number, isModule: boolean): Diagnostic | null {
  try {
    parse(code, {
      ecmaVersion: 'latest',
      sourceType: isModule ? 'module' : 'script',
    });
    return null;
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      return null;
    }
    const error = e as AcornSyntaxError;
    const position = Math.min(error.pos ?? 0, code.length);
    const end = Math.min(Math.max(error.raisedAt ?? position, position + 1), code.length);
    // acorn appends "(line:column)", the editor already shows the position
    const message = error.message.replace(/\s*\(\d+:\d+\)$/, '');
    return makeDiagnostic(
      offset + position,
      offset + end,
      translate('CodeInjector_JavaScriptSyntaxError', message),
    );
  }
}

function lintJson(code: string, offset: number): Diagnostic | null {
  if (!code.trim()) {
    return null;
  }
  try {
    JSON.parse(code);
    return null;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const positionMatch = message.match(JSON_POSITION_PATTERN);
    const position = positionMatch ? Math.min(parseInt(positionMatch[1], 10), code.length) : 0;
    return makeDiagnostic(
      offset + position,
      offset + Math.min(position + 1, code.length),
      translate('CodeInjector_JsonSyntaxError', message),
    );
  }
}

function lintScripts(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  SCRIPT_PATTERN.lastIndex = 0;
  let match = SCRIPT_PATTERN.exec(code);
  while (match) {
    const [whole, attributes, script] = match;
    const scriptOffset = match.index + whole.indexOf('>') + 1;
    const type = getScriptType(attributes);

    let diagnostic: Diagnostic | null = null;
    if (JAVASCRIPT_TYPES.includes(type)) {
      diagnostic = lintJavaScript(script, scriptOffset, type === 'module');
    } else if (JSON_TYPES.includes(type)) {
      diagnostic = lintJson(script, scriptOffset);
    }

    if (diagnostic) {
      diagnostics.push(diagnostic);
    }
    match = SCRIPT_PATTERN.exec(code);
  }

  return diagnostics;
}

// the code around an error, eg "</div>" for a mismatched closing tag
function getSnippet(code: string, position: number): string {
  const match = code.slice(position).trimStart().match(SNIPPET_PATTERN);
  return match ? `"${match[0]}"` : '';
}

// HTML and CSS errors found by the parser of the editor (the error nodes of the syntax tree).
// Errors inside <script> elements are left to acorn and JSON.parse, which give better messages.
function lintSyntaxTree(code: string, scriptRanges: Range[], styleRanges: Range[]): Diagnostic[] {
  const state = EditorState.create({ doc: code, extensions: [htmlSupport] });
  const tree = ensureSyntaxTree(state, code.length, SYNTAX_TREE_TIMEOUT);
  if (!tree) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];
  const reportedLines = new Set<number>();

  tree.iterate({
    enter: (node) => {
      if (!node.type.isError || diagnostics.length >= MAX_SYNTAX_DIAGNOSTICS
        || isInRanges(node.from, scriptRanges)) {
        return;
      }

      // the parser often flags several nodes for a single mistake, report one error per line
      const from = Math.max(Math.min(node.from, code.length - 1), 0);
      const line = state.doc.lineAt(from).number;
      if (reportedLines.has(line)) {
        return;
      }
      reportedLines.add(line);

      const messageKey = isInRanges(from, styleRanges)
        ? 'CodeInjector_CssSyntaxError'
        : 'CodeInjector_HtmlSyntaxError';
      diagnostics.push(makeDiagnostic(
        from,
        Math.min(Math.max(node.to, from + 1), code.length),
        translate(messageKey, getSnippet(code, from)),
      ));
    },
  });

  return diagnostics;
}

export function lintCode(code: string): Diagnostic[] {
  const trimmed = code.trim();
  if (!trimmed) {
    return [];
  }

  // raw JavaScript or CSS pasted without tags is printed as text in every page
  if (!TAG_PATTERN.test(code)) {
    const from = code.length - code.trimStart().length;
    return [makeDiagnostic(from, from + trimmed.length, translate('CodeInjector_MissingTags'), 'warning')];
  }

  const diagnostics: Diagnostic[] = [];
  const scriptRanges = findElements(code, SCRIPT_PATTERN);
  const styleRanges = findElements(code, STYLE_PATTERN);

  const unclosedScript = findUnclosedTag(code, 'script');
  if (unclosedScript) {
    diagnostics.push(makeDiagnostic(
      unclosedScript.from,
      unclosedScript.to,
      translate('CodeInjector_UnclosedScriptTag'),
    ));
    scriptRanges.push({ from: unclosedScript.from, to: code.length });
  }

  const unclosedStyle = findUnclosedTag(code, 'style');
  if (unclosedStyle) {
    diagnostics.push(makeDiagnostic(
      unclosedStyle.from,
      unclosedStyle.to,
      translate('CodeInjector_UnclosedStyleTag'),
    ));
    styleRanges.push({ from: unclosedStyle.from, to: code.length });
  }

  return [
    ...diagnostics,
    ...lintScripts(code),
    ...lintSyntaxTree(code, scriptRanges, styleRanges),
  ];
}

export function createCodeLinter(onResult: (diagnostics: Diagnostic[]) => void) {
  return linter(
    (view: EditorView) => {
      const diagnostics = lintCode(view.state.doc.toString());
      onResult(diagnostics);
      return diagnostics;
    },
    { delay: 500 },
  );
}
