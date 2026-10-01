/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// The TypeScript version of the Matomo 5 build cannot parse the type declarations of CodeMirror
// (inline "type" modifiers in export lists). The editor modules are re-exported from this plain
// JavaScript file and typed by codeMirrorModules.d.ts, so the CodeMirror declarations are never
// loaded.

export { basicSetup, EditorView } from 'codemirror';
export { EditorState } from '@codemirror/state';
export { tooltips } from '@codemirror/view';
export { ensureSyntaxTree, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
export { html } from '@codemirror/lang-html';
export { linter, lintGutter, openLintPanel } from '@codemirror/lint';
export { tags } from '@lezer/highlight';
