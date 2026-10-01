/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Subset of the CodeMirror API used by the code editor, see codeMirrorModules.js

/* eslint-disable max-classes-per-file */

import type { CodeTags, CodeTagStyle } from '../codeTheme';

export type Extension = { extension: Extension } | readonly Extension[];

export interface Line {
  readonly number: number;
  readonly from: number;
  readonly to: number;
}

export interface Text {
  readonly length: number;
  lineAt(position: number): Line;
  toString(): string;
}

export interface SelectionRange {
  readonly from: number;
  readonly to: number;
}

export interface EditorSelection {
  readonly main: SelectionRange;
}

export declare class EditorState {
  readonly doc: Text;

  readonly selection: EditorSelection;

  static create(config?: { doc?: string, extensions?: Extension }): EditorState;
}

export interface ViewUpdate {
  readonly state: EditorState;
  readonly docChanged: boolean;
}

export interface Facet<Input> {
  of(value: Input): Extension;
}

export declare class EditorView {
  constructor(config?: { state?: EditorState, parent?: Element | DocumentFragment });

  readonly state: EditorState;

  readonly dom: HTMLElement;

  dispatch(spec: { changes?: { from: number, to?: number, insert?: string } }): void;

  destroy(): void;

  static theme(spec: Record<string, Record<string, string>>): Extension;

  static readonly lineWrapping: Extension;

  static readonly updateListener: Facet<(update: ViewUpdate) => void>;

  static readonly editorAttributes: Facet<Record<string, string>>;

  static readonly contentAttributes: Facet<Record<string, string>>;
}

export declare const basicSetup: Extension;

export declare function tooltips(config?: { parent?: HTMLElement }): Extension;

export interface NodeType {
  readonly name: string;
  readonly isError: boolean;
}

export interface SyntaxNode {
  readonly name: string;
  readonly type: NodeType;
  readonly from: number;
  readonly to: number;
  getChild(type: string): SyntaxNode | null;
  getChildren(type: string): SyntaxNode[];
}

export interface SyntaxNodeRef {
  readonly name: string;
  readonly type: NodeType;
  readonly from: number;
  readonly to: number;
  readonly node: SyntaxNode;
}

export interface Tree {
  iterate(spec: {
    enter(node: SyntaxNodeRef): boolean | void,
    leave?(node: SyntaxNodeRef): void,
  }): void;
}

export declare function ensureSyntaxTree(
  state: EditorState,
  upto: number,
  timeout?: number,
): Tree | null;

export declare function html(): Extension;

export interface Diagnostic {
  from: number;
  to: number;
  severity: 'hint' | 'info' | 'warning' | 'error';
  message: string;
}

export declare function linter(
  source: (view: EditorView) => readonly Diagnostic[],
  config?: { delay?: number },
): Extension;

export declare function lintGutter(): Extension;

export declare function openLintPanel(view: EditorView): boolean;

export interface Tag {
  readonly id: number;
}

export interface Highlighter {
  readonly module: unknown;
}

export declare const HighlightStyle: {
  define(specs: CodeTagStyle<Tag>[]): Highlighter;
};

export declare function syntaxHighlighting(highlighter: Highlighter): Extension;

export declare const tags: CodeTags<Tag>;
