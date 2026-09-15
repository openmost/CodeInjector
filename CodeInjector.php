<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\CodeInjector;

use Piwik\Container\StaticContainer;
use Piwik\Request;

class CodeInjector extends \Piwik\Plugin
{
    public function registerEvents()
    {
        return [
            'Template.bodyTop' => 'addCodeToBodyTop',
            'Template.bodyBottom' => 'addCodeToBodyBottom',
            'AssetManager.getStylesheetFiles' => 'getStylesheetFiles',
            'Translate.getClientSideTranslationKeys' => 'getClientSideTranslationKeys',
        ];
    }

    public function shouldLoadUmdOnDemand()
    {
        // The UMD bundles the code editor, it is only needed by the settings form
        return true;
    }

    public function addCodeToBodyTop(&$out): void
    {
        $out .= $this->getCodeToInject('bodyTop');
    }

    public function addCodeToBodyBottom(&$out): void
    {
        $out .= $this->getCodeToInject('bodyBottom');
    }

    public function getStylesheetFiles(&$files): void
    {
        $files[] = 'plugins/CodeInjector/stylesheets/codeEditor.less';
    }

    public function getClientSideTranslationKeys(&$translationKeys): void
    {
        $translationKeys[] = 'CodeInjector_JavaScriptSyntaxError';
        $translationKeys[] = 'CodeInjector_JsonSyntaxError';
        $translationKeys[] = 'CodeInjector_CssSyntaxError';
        $translationKeys[] = 'CodeInjector_HtmlSyntaxError';
        $translationKeys[] = 'CodeInjector_UnclosedScriptTag';
        $translationKeys[] = 'CodeInjector_UnclosedStyleTag';
        $translationKeys[] = 'CodeInjector_MissingTags';
        $translationKeys[] = 'CodeInjector_SyntaxValid';
        $translationKeys[] = 'CodeInjector_SyntaxMayContainErrors';
    }

    private function getCodeToInject(string $settingName): string
    {
        if ($this->isSettingsPage()) {
            return '';
        }

        $settings = StaticContainer::get(SystemSettings::class);

        return (string) $settings->$settingName->getValue();
    }

    /**
     * The code is not injected on the page where it is edited, so a snippet breaking the interface
     * can always be fixed.
     */
    private function isSettingsPage(): bool
    {
        try {
            $request = Request::fromGet();

            return $request->getStringParameter('module', '') === 'CoreAdminHome'
                && $request->getStringParameter('action', '') === 'generalSettings';
        } catch (\InvalidArgumentException $e) {
            // module or action is not a string, this is not the settings page
            return false;
        }
    }
}
