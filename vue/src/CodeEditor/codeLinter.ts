/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { parse } from 'acorn';
import { translate } from 'CoreHome';
import type { Diagnostic, Extension } from './codeMirrorModules';
import {
  EditorState,
  EditorView,
  ensureSyntaxTree,
  html,
  linter,
} from './codeMirrorModules';

// Checks of the injected code:
// - JavaScript syntax of the <script> blocks with acorn, JSON (eg JSON-LD) with JSON.parse
// - HTML and CSS syntax with the error nodes of the editor syntax tree (Lezer)
// - unclosed <script> and <style> tags, code pasted without any tag
// Problems are only reported in the editor: saving is not blocked.
//
// <script> and <style> elements are located with the HTML syntax tree, not with regular
// expressions: a tag written in a comment, a string or a stylesheet is not an element, and an
// attribute value may contain ">".

const TAG_PATTERN = /<[a-z!/]/i;
const JSON_POSITION_PATTERN = /position (\d+)/;
const SNIPPET_PATTERN = /^\S{1,30}/;
const QUOTES_PATTERN = /^(["'])([\s\S]*)\1$/;
const RAW_TEXT_CLOSING_TAG_PATTERN = /<\/(?:script|style)(?=[\s/>])/gi;

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

interface TreeNode {
  from: number;
  to: number;
  getChild(type: string): TreeNode | null;
  getChildren(type: string): TreeNode[];
}

interface RawTextElement {
  tagName: 'script' | 'style';
  type: string;
  openTag: Range;
  content: Range;
  isClosed: boolean;
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

// error nodes at the very end of a block (eg a missing brace) start at its last position
function isInRanges(position: number, ranges: Range[]): boolean {
  return ranges.some((range) => position >= range.from && position <= range.to);
}

function getTypeAttribute(code: string, openTag: TreeNode): string {
  const typeAttribute = openTag.getChildren('Attribute').find((attribute) => {
    const name = attribute.getChild('AttributeName');
    return name && code.slice(name.from, name.to).toLowerCase() === 'type';
  });
  const value = typeAttribute && (
    typeAttribute.getChild('AttributeValue') || typeAttribute.getChild('UnquotedAttributeValue')
  );
  if (!value) {
    return '';
  }
  return code.slice(value.from, value.to).replace(QUOTES_PATTERN, '$2').trim().toLowerCase();
}

function findRawTextElements(
  code: string,
  tree: NonNullable<ReturnType<typeof ensureSyntaxTree>>,
): RawTextElement[] {
  const elements: RawTextElement[] = [];

  tree.iterate({
    enter: (nodeRef) => {
      if (nodeRef.name !== 'Element') {
        return undefined;
      }
      const element: TreeNode = nodeRef.node;
      const openTag = element.getChild('OpenTag');
      const tagNameNode = openTag && openTag.getChild('TagName');
      if (!openTag || !tagNameNode) {
        return undefined;
      }

      const tagName = code.slice(tagNameNode.from, tagNameNode.to).toLowerCase();
      if (tagName !== 'script' && tagName !== 'style') {
        return undefined;
      }

      const closeTag = element.getChild('CloseTag');
      elements.push({
        tagName,
        type: getTypeAttribute(code, openTag),
        openTag: { from: openTag.from, to: openTag.to },
        content: { from: openTag.to, to: closeTag ? closeTag.from : nodeRef.to },
        isClosed: !!closeTag,
      });

      // the content is raw text (or a nested JavaScript / CSS tree), it holds no element
      return false;
    },
  });

  return elements;
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

function lintScript(code: string, element: RawTextElement): Diagnostic | null {
  const { from, to } = element.content;
  if (JAVASCRIPT_TYPES.includes(element.type)) {
    return lintJavaScript(code.slice(from, to), from, element.type === 'module');
  }
  if (JSON_TYPES.includes(element.type)) {
    return lintJson(code.slice(from, to), from);
  }
  return null;
}

// browsers close <script> and <style> elements whatever the case of the closing tag, the syntax
// tree only with a lowercase one (same length, positions are kept)
function lowercaseClosingTags(code: string): string {
  return code.replace(RAW_TEXT_CLOSING_TAG_PATTERN, (tag) => tag.toLowerCase());
}

// the code around an error, eg "</div>" for a mismatched closing tag
function getSnippet(code: string, position: number): string {
  const match = code.slice(position).trimStart().match(SNIPPET_PATTERN);
  return match ? `"${match[0]}"` : '';
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

  const state = EditorState.create({ doc: lowercaseClosingTags(code), extensions: [htmlSupport] });
  const tree = ensureSyntaxTree(state, code.length, SYNTAX_TREE_TIMEOUT);
  if (!tree) {
    return [];
  }

  const elements = findRawTextElements(code, tree);
  const scripts = elements.filter((element) => element.tagName === 'script');
  const styles = elements.filter((element) => element.tagName === 'style');

  const diagnostics: Diagnostic[] = [];

  // an unclosed <script> or <style> makes the browser read the rest of the Matomo page as its
  // content
  elements.forEach((element) => {
    if (!element.isClosed) {
      diagnostics.push(makeDiagnostic(
        element.openTag.from,
        element.openTag.to,
        translate(element.tagName === 'script'
          ? 'CodeInjector_UnclosedScriptTag'
          : 'CodeInjector_UnclosedStyleTag'),
      ));
    }
  });

  scripts.forEach((script) => {
    const diagnostic = script.isClosed ? lintScript(code, script) : null;
    if (diagnostic) {
      diagnostics.push(diagnostic);
    }
  });

  // HTML and CSS errors found by the parser of the editor (the error nodes of the syntax tree).
  // Errors inside <script> elements are left to acorn and JSON.parse, which give better messages.
  const scriptRanges = scripts.map((script) => script.content);
  const styleRanges = styles.map((style) => style.content);
  const reportedLines = new Set<number>();
  let syntaxDiagnosticCount = 0;

  tree.iterate({
    enter: (node) => {
      if (!node.type.isError || syntaxDiagnosticCount >= MAX_SYNTAX_DIAGNOSTICS
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
      syntaxDiagnosticCount += 1;

      const messageKey = isInRanges(node.from, styleRanges)
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

export function createCodeLinter(onResult: (diagnostics: Diagnostic[]) => void): Extension {
  return linter(
    (view: EditorView) => {
      const diagnostics = lintCode(view.state.doc.toString());
      onResult(diagnostics);
      return diagnostics;
    },
    { delay: 500 },
  );
}
