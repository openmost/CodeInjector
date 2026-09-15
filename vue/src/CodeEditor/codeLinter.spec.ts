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
    const code = '<style>\n  .card { color: red; }\n</style>\n<div>Hello</div>\n<script>\n  var a = 1;\n</script>';
    expect(lintCode(code)).toEqual([]);
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
    expect(lintCode('<script type="application/ld+json">{"a": }</script>')[0].message)
      .toContain('CodeInjector_JsonSyntaxError');
    expect(lintCode('<script type="text/template">{{ not js</script>')).toEqual([]);
  });

  it('reports an unclosed script tag', () => {
    const code = '<script>var a = 1;</script>\n<script src="https://example.com/a.js">';
    const diagnostics = lintCode(code);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain('CodeInjector_UnclosedScriptTag');
    expect(diagnostics[0].from).toBe(code.lastIndexOf('<script'));
  });

  it('warns when the code is not wrapped in tags', () => {
    const diagnostics = lintCode('\n  .card { color: red; }');

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].message).toContain('CodeInjector_MissingTags');
    expect(diagnostics[0].from).toBe(3);
  });
});
