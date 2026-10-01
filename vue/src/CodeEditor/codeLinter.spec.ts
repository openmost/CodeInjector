/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import {
  describe, expect, it, vi,
} from 'vitest';
import { lintCode } from './codeLinter';

vi.mock('CoreHome', () => ({
  translate: (key: string, ...values: string[]) => `${key}: ${values.join(', ')}`,
}));

describe('lintCode', () => {
  it('accepts empty code', () => {
    expect(lintCode('')).toEqual([]);
    expect(lintCode('  \n ')).toEqual([]);
  });

  it('accepts valid JavaScript, CSS and HTML', () => {
    const code = '<style>\n  .card { border-radius: 12px; }\n</style>\n<div>Hello</div>\n<script>\n  var a = 1;\n</script>';
    expect(lintCode(code)).toEqual([]);
  });

  it('accepts modern CSS and loose HTML', () => {
    const css = '<style>:root { --brand: #3450a3; }\n.a { width: clamp(1rem, 2vw, 3rem); &:hover { color: var(--brand); } }\n'
      + '@supports (display: grid) { .a { display: grid; } }\n@layer base { :is(.a, .b) > .c::before { content: "x"; } }</style>';
    const html = '<!-- comment --><p>one<p>two<ul><li>a<li>b</ul><input type=text disabled>'
      + '<div style="margin: 0 auto"><svg viewBox="0 0 10 10"><path d="M0 0L10 10"/></svg></div>';
    expect(lintCode(css)).toEqual([]);
    expect(lintCode(html)).toEqual([]);
  });

  it('reports a JavaScript syntax error at its position in the document', () => {
    const code = '<p>x</p><script>var a = ;</script>';
    const diagnostics = lintCode(code);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].severity).toBe('error');
    expect(diagnostics[0].message).toContain('CodeInjector_JavaScriptSyntaxError');
    expect(diagnostics[0].message).not.toMatch(/\(\d+:\d+\)$/);
    expect(code.substring(diagnostics[0].from, diagnostics[0].from + 1)).toBe(';');
  });

  it('parses module scripts as modules', () => {
    expect(lintCode('<script type="module">import a from "./a.js";</script>')).toEqual([]);
    expect(lintCode('<script>import a from "./a.js";</script>')).toHaveLength(1);
  });

  it('checks JSON-LD and ignores other script types', () => {
    expect(lintCode('<script type="application/ld+json">{"a": 1}</script>')).toEqual([]);
    const jsonDiagnostics = lintCode('<script type="application/ld+json">{"a": }</script>');
    expect(jsonDiagnostics).toHaveLength(1);
    expect(jsonDiagnostics[0].message).toContain('CodeInjector_JsonSyntaxError');
    expect(lintCode('<script type="text/template">{{ not js <div> }}</script>')).toEqual([]);
  });

  it('only checks real script elements', () => {
    expect(lintCode('<!-- <script> -->\n<script>var a = 1;</script>')).toEqual([]);
    expect(lintCode('<!-- disabled: <script>old(</script> -->')).toEqual([]);
    expect(lintCode('<script>var css = \'<style>.a { color: red; }\';</script>')).toEqual([]);
    expect(lintCode('<style>.a::after { content: "<script>"; }</style>')).toEqual([]);
  });

  it('reads the script content after an opening tag containing ">"', () => {
    const code = '<script src="a.js" onload="if (a > b) run()">var ok = 1;</script>';
    expect(lintCode(code)).toEqual([]);

    const broken = '<script data-a="x>y">var a = ;</script>';
    const [diagnostic] = lintCode(broken);
    expect(diagnostic.message).toContain('CodeInjector_JavaScriptSyntaxError');
    expect(broken.substring(diagnostic.from, diagnostic.from + 1)).toBe(';');
  });

  it('reads the type attribute only', () => {
    const diagnostics = lintCode('<script data-type="text/plain">var a = ;</script>');

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('CodeInjector_JavaScriptSyntaxError');
    expect(lintCode('<SCRIPT TYPE=text/template>{{ not js }}</SCRIPT>')).toEqual([]);
    expect(lintCode('<SCRIPT>var a = ;</SCRIPT>')).toHaveLength(1);
  });

  it('reports a CSS rule missing its closing brace', () => {
    const code = '<style>\nhtml {\n scrollbar-width: none;\n\n</style>';
    const diagnostics = lintCode(code);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('CodeInjector_CssSyntaxError');
  });

  it('reports an extra brace and a missing colon in CSS', () => {
    const extraBrace = lintCode('<style>\nhtml {\n scrollbar-width: none;\n}}\n</style>');
    const missingColon = lintCode('<style>\nhtml {\n scrollbar-width none;\n}\n</style>');

    expect(extraBrace).toHaveLength(1);
    expect(extraBrace[0].message).toContain('CodeInjector_CssSyntaxError');
    expect(missingColon.length).toBeGreaterThan(0);
    expect(missingColon[0].message).toContain('CodeInjector_CssSyntaxError');
  });

  it('reports a mismatched HTML closing tag', () => {
    const code = '<div class="a">\n<span>test</div>';
    const diagnostics = lintCode(code);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('CodeInjector_HtmlSyntaxError');
    expect(diagnostics[0].message).toContain('</div>');
  });

  it('reports unclosed script and style tags', () => {
    const script = '<script>var a = 1;</script>\n<script src="https://example.com/a.js">';
    const scriptDiagnostics = lintCode(script);
    const style = '<style>\nhtml { top: 0; }\n';
    const styleDiagnostics = lintCode(style);

    expect(scriptDiagnostics).toHaveLength(1);
    expect(scriptDiagnostics[0].message).toContain('CodeInjector_UnclosedScriptTag');
    expect(scriptDiagnostics[0].from).toBe(script.lastIndexOf('<script'));
    expect(styleDiagnostics).toHaveLength(1);
    expect(styleDiagnostics[0].message).toContain('CodeInjector_UnclosedStyleTag');
    expect(styleDiagnostics[0].from).toBe(0);
  });

  it('warns when the code is not wrapped in tags', () => {
    const diagnostics = lintCode('\n  .card { color: red; }');

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].message).toContain('CodeInjector_MissingTags');
    expect(diagnostics[0].from).toBe(3);
  });
});
