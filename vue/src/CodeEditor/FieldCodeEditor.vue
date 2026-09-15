<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="ci-code-field-header">
    <span
      :id="labelId"
      class="ci-code-field-label"
      v-html="$sanitize(title)"
    />
    <button
      v-if="statusText"
      type="button"
      class="ci-code-status"
      :class="hasProblems ? 'ci-code-status--invalid' : 'ci-code-status--valid'"
      :title="statusTitle"
      :disabled="!hasProblems"
      @click="openProblems()"
    >
      <span :class="hasProblems ? 'icon-warning' : 'icon-ok'" />
      {{ statusText }}
    </button>
  </div>
  <div
    ref="container"
    class="ci-code-field-editor"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { basicSetup, EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { tooltips } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { Diagnostic, lintGutter, openLintPanel } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';
import { translate } from 'CoreHome';
import { createCodeLinter } from './codeLinter';

// Setting field editing HTML with inline JavaScript and CSS in a CodeMirror editor, with syntax
// highlighting and the checks of codeLinter.ts.

export default defineComponent({
  props: {
    name: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  inheritAttrs: false,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const container = ref<HTMLElement | null>(null);
    const diagnostics = ref<Diagnostic[] | null>(null);
    const hasContent = ref(!!(props.modelValue || '').trim());
    const labelId = computed(() => `${props.id || props.name}-label`);

    // the editor is not reactive: CodeMirror objects must not be wrapped in Vue proxies
    let view: EditorView | null = null;
    let isApplyingModelValue = false;

    onMounted(() => {
      view = new EditorView({
        parent: container.value!,
        state: EditorState.create({
          doc: props.modelValue || '',
          extensions: [
            basicSetup,
            html(),
            oneDark,
            createCodeLinter((result) => {
              diagnostics.value = result;
            }),
            lintGutter(),
            // the editor clips its overflow (rounded corners): render tooltips in the body
            tooltips({ parent: document.body }),
            EditorView.lineWrapping,
            // CodeMirror owns the class attribute of its root element, declare the plugin
            // class as an editor attribute or it is dropped on the first update
            EditorView.editorAttributes.of({ class: 'ci-code-editor' }),
            EditorView.contentAttributes.of({
              spellcheck: 'false',
              'aria-labelledby': labelId.value,
            }),
            EditorView.updateListener.of((update) => {
              if (!update.docChanged || isApplyingModelValue) {
                return;
              }
              const value = update.state.doc.toString();
              hasContent.value = !!value.trim();
              emit('update:modelValue', value);
            }),
          ],
        }),
      });
    });

    // values set by the form (load, reset after save) are pushed to the editor
    watch(() => props.modelValue, (newValue) => {
      const text = newValue || '';
      if (!view || text === view.state.doc.toString()) {
        return;
      }
      isApplyingModelValue = true;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
      isApplyingModelValue = false;
      hasContent.value = !!text.trim();
    });

    onBeforeUnmount(() => {
      if (view) {
        view.destroy();
        view = null;
      }
    });

    const hasProblems = computed(() => !!diagnostics.value?.length);

    const statusText = computed(() => {
      if (!hasContent.value || diagnostics.value === null) {
        return '';
      }
      return translate(hasProblems.value
        ? 'CodeInjector_SyntaxMayContainErrors'
        : 'CodeInjector_SyntaxValid');
    });

    const statusTitle = computed(
      () => (diagnostics.value || []).map((diagnostic) => diagnostic.message).join('\n'),
    );

    function openProblems() {
      if (view && hasProblems.value) {
        openLintPanel(view);
      }
    }

    return {
      container,
      labelId,
      hasProblems,
      statusText,
      statusTitle,
      openProblems,
    };
  },
});
</script>
