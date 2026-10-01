/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

// Openmost CodeMirror theme: the code palette of the ChatGPT plugin chat, light and dark.
//
// Canonical source: TagManagerExtended for Matomo 6, vue/src/codeTheme.ts, with its colours in
// stylesheets/codeTheme.less. Identical copies live in CodeInjector (Matomo 5 and 6),
// CustomWidgets (Matomo 6) and TagManagerExtended (Matomo 5): edit the canonical files, then
// copy them over unchanged.
//
// The theme only references the --om-code-* CSS variables, which switch with the Matomo theme
// mode, so one editor configuration serves both modes. The file imports nothing because the
// Matomo 5 build cannot load the CodeMirror type declarations: each plugin passes its own
// CodeMirror modules to createCodeTheme().

export type CodeTagStyle<Tag> = {
  tag: Tag | Tag[];
  color?: string;
  fontStyle?: string;
};

export interface CodeTags<Tag> {
  comment: Tag;
  keyword: Tag;
  self: Tag;
  string: Tag;
  regexp: Tag;
  escape: Tag;
  attributeValue: Tag;
  number: Tag;
  bool: Tag;
  null: Tag;
  atom: Tag;
  propertyName: Tag;
  attributeName: Tag;
  tagName: Tag;
  variableName: Tag;
  className: Tag;
  typeName: Tag;
  invalid: Tag;
  special(tag: Tag): Tag;
  definition(tag: Tag): Tag;
  function(tag: Tag): Tag;
}

export interface CodeThemeModules<Extension, Tag, Highlighter> {
  EditorView: {
    theme(spec: Record<string, Record<string, string>>): Extension;
  };
  HighlightStyle: {
    define(specs: CodeTagStyle<Tag>[]): Highlighter;
  };
  syntaxHighlighting(highlighter: Highlighter): Extension;
  tags: CodeTags<Tag>;
}

const lintUnderline = (color: string) => ({
  backgroundImage: 'none',
  textDecoration: `underline wavy ${color}`,
  textDecorationSkipInk: 'none',
  textUnderlineOffset: '3px',
});

// selectors mirror the CodeMirror base theme ones, so they win on specificity in both modes
const SELECTION_SELECTOR = [
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground',
  '.cm-selectionBackground',
  '.cm-content ::selection',
].join(', ');

const editorTheme: Record<string, Record<string, string>> = {
  '&': {
    color: 'var(--om-code-fg)',
    backgroundColor: 'var(--om-code-bg)',
    border: '1px solid var(--om-code-border)',
    borderRadius: 'var(--om-code-radius)',
  },
  '.cm-scroller': {
    fontFamily: 'var(--om-code-font)',
  },
  '.cm-content': {
    caretColor: 'var(--om-code-fg)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--om-code-fg)',
  },
  [SELECTION_SELECTOR]: {
    backgroundColor: 'var(--om-code-selection)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--om-code-active-line)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--om-code-bg)',
    color: 'var(--om-code-comment)',
    borderRight: '1px solid var(--om-code-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--om-code-active-line)',
    color: 'var(--om-code-fg)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--om-code-active-line)',
    border: '1px solid var(--om-code-border)',
    color: 'var(--om-code-comment)',
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--om-code-selection)',
    outline: '1px solid var(--om-code-number)',
  },
  '&.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: 'transparent',
    outline: '1px solid var(--om-code-error)',
  },
  '.cm-selectionMatch, .cm-searchMatch, .cm-lintRange-active': {
    backgroundColor: 'var(--om-code-highlight)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--om-code-selection)',
    outline: '1px solid var(--om-code-number)',
  },
  '.cm-lintRange-error': lintUnderline('var(--om-code-error)'),
  '.cm-lintRange-warning': lintUnderline('var(--om-code-warning)'),
  '.cm-lintRange-info, .cm-lintRange-hint': lintUnderline('var(--om-code-comment)'),
  '.cm-diagnostic-error': { borderLeftColor: 'var(--om-code-error)' },
  '.cm-diagnostic-warning': { borderLeftColor: 'var(--om-code-warning)' },
  '.cm-diagnostic-info, .cm-diagnostic-hint': { borderLeftColor: 'var(--om-code-comment)' },
  '.cm-tooltip, .cm-panels': {
    backgroundColor: 'var(--om-code-surface)',
    color: 'var(--om-code-fg)',
    border: '1px solid var(--om-code-border)',
  },
  '.cm-tooltip': {
    borderRadius: '6px',
    overflow: 'hidden',
  },
  '.cm-panels.cm-panels-bottom': {
    borderTop: '1px solid var(--om-code-border)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected], .cm-panel.cm-panel-lint ul [aria-selected]': {
    backgroundColor: 'var(--om-code-selection)',
    color: 'var(--om-code-fg)',
  },
  '.cm-textfield, .cm-button': {
    backgroundColor: 'var(--om-code-bg)',
    backgroundImage: 'none',
    color: 'var(--om-code-fg)',
    border: '1px solid var(--om-code-border)',
  },
};

function highlightRules<Tag>(tags: CodeTags<Tag>): CodeTagStyle<Tag>[] {
  return [
    { tag: tags.comment, color: 'var(--om-code-comment)', fontStyle: 'italic' },
    { tag: [tags.keyword, tags.self], color: 'var(--om-code-keyword)' },
    {
      tag: [tags.string, tags.regexp, tags.escape, tags.special(tags.string), tags.attributeValue],
      color: 'var(--om-code-string)',
    },
    { tag: tags.number, color: 'var(--om-code-number)' },
    { tag: [tags.bool, tags.null, tags.atom], color: 'var(--om-code-literal)' },
    {
      tag: [tags.propertyName, tags.definition(tags.propertyName), tags.attributeName],
      color: 'var(--om-code-property)',
    },
    { tag: tags.tagName, color: 'var(--om-code-tag)' },
    {
      tag: [
        tags.function(tags.variableName),
        tags.function(tags.propertyName),
        tags.className,
        tags.typeName,
      ],
      color: 'var(--om-code-function)',
    },
    { tag: tags.invalid, color: 'var(--om-code-error)' },
  ];
}

let isSchemeWatched = false;

// Matomo 5 theme plugins such as DarkTheme force dark colours whatever the theme mode: the token
// palette then follows the luminance of the rendered code background instead of the mode alone.
function syncCodeScheme() {
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.backgroundColor = 'var(--om-code-bg)';
  document.body.appendChild(probe);
  const channels = (window.getComputedStyle(probe).backgroundColor.match(/[\d.]+/g) || [])
    .map(Number);
  probe.remove();

  const root = document.documentElement;
  if (channels.length < 3 || channels[3] === 0) {
    delete root.dataset.omCodeScheme;
    return;
  }
  const [red, green, blue] = channels;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  root.dataset.omCodeScheme = luminance < 0.5 ? 'dark' : 'light';
}

function watchCodeScheme() {
  if (isSchemeWatched || !document.body) {
    return;
  }
  isSchemeWatched = true;
  syncCodeScheme();
  new MutationObserver(syncCodeScheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme-mode'],
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncCodeScheme);
}

// one style module for every editor of the page, instead of one per editor
let cachedTheme: { view: unknown, extensions: unknown[] } | null = null;

export function createCodeTheme<Extension, Tag, Highlighter>(
  modules: CodeThemeModules<Extension, Tag, Highlighter>,
): Extension[] {
  watchCodeScheme();

  if (!cachedTheme || cachedTheme.view !== modules.EditorView) {
    cachedTheme = {
      view: modules.EditorView,
      extensions: [
        modules.EditorView.theme(editorTheme),
        modules.syntaxHighlighting(modules.HighlightStyle.define(highlightRules(modules.tags))),
      ],
    };
  }

  return cachedTheme.extensions as Extension[];
}
