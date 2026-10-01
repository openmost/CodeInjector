<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <ContentBlock
    :content-title="translate('CodeInjector_CodeInjector')"
    class="ci-manage-code"
  >
    <p>{{ translate('CodeInjector_PageIntro') }}</p>

    <div class="ci-code-field">
      <FieldCodeEditor
        id="bodyTop"
        name="bodyTop"
        :title="translate('CodeInjector_BodyTopTitle')"
        v-model="bodyTop"
      />
      <p class="ci-code-field-help">
        {{ translate('CodeInjector_BodyTopDescription') }}<br>
        {{ translate('CodeInjector_SafeModeNotice') }}
      </p>
    </div>

    <div class="ci-code-field">
      <FieldCodeEditor
        id="bodyBottom"
        name="bodyBottom"
        :title="translate('CodeInjector_BodyBottomTitle')"
        v-model="bodyBottom"
      />
      <p class="ci-code-field-help">
        {{ translate('CodeInjector_BodyBottomDescription') }}<br>
        {{ translate('CodeInjector_SafeModeNotice') }}
      </p>
    </div>

    <SaveButton
      :saving="isSaving"
      @confirm="showPasswordConfirmation = true"
    />

    <PasswordConfirmation
      v-model="showPasswordConfirmation"
      @confirmed="save"
    />
  </ContentBlock>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  AjaxHelper,
  ContentBlock,
  NotificationsStore,
  translate,
} from 'CoreHome';
import { PasswordConfirmation, SaveButton } from 'CorePluginsAdmin';
import FieldCodeEditor from '../CodeEditor/FieldCodeEditor.vue';

interface ManageCodeState {
  bodyTop: string;
  bodyBottom: string;
  isSaving: boolean;
  showPasswordConfirmation: boolean;
}

export default defineComponent({
  props: {
    initialBodyTop: {
      type: String,
      default: '',
    },
    initialBodyBottom: {
      type: String,
      default: '',
    },
  },
  components: {
    ContentBlock,
    FieldCodeEditor,
    PasswordConfirmation,
    SaveButton,
  },
  data(): ManageCodeState {
    return {
      bodyTop: this.initialBodyTop,
      bodyBottom: this.initialBodyBottom,
      isSaving: false,
      showPasswordConfirmation: false,
    };
  },
  methods: {
    save(password: string) {
      this.isSaving = true;

      AjaxHelper.post(
        { method: 'CodeInjector.setCode' },
        {
          bodyTop: this.bodyTop,
          bodyBottom: this.bodyBottom,
          passwordConfirmation: password,
        },
      ).then(() => {
        NotificationsStore.show({
          message: translate('CodeInjector_SaveSuccess'),
          id: 'codeInjectorSaved',
          context: 'success',
          type: 'toast',
        });
      }).finally(() => {
        this.isSaving = false;
      });
    },
  },
});
</script>
