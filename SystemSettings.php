<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

declare(strict_types=1);

namespace Piwik\Plugins\CodeInjector;

use Piwik\Piwik;
use Piwik\Settings\FieldConfig;
use Piwik\Settings\Plugin\SystemSetting;

/**
 * Code injected in every page of the Matomo UI, editable by super users only.
 */
class SystemSettings extends \Piwik\Settings\Plugin\SystemSettings
{
    private const CODE_EDITOR_COMPONENT = ['plugin' => 'CodeInjector', 'name' => 'FieldCodeEditor'];

    /** @var SystemSetting */
    public $bodyTop;

    /** @var SystemSetting */
    public $bodyBottom;

    protected function init()
    {
        $this->bodyTop = $this->createCodeSetting('bodyTop', 'CodeInjector_BodyTopTitle', 'CodeInjector_BodyTopDescription');
        $this->bodyBottom = $this->createCodeSetting('bodyBottom', 'CodeInjector_BodyBottomTitle', 'CodeInjector_BodyBottomDescription');
    }

    private function createCodeSetting(string $name, string $titleKey, string $descriptionKey): SystemSetting
    {
        return $this->makeSetting($name, '', FieldConfig::TYPE_STRING, function (FieldConfig $field) use ($titleKey, $descriptionKey) {
            $field->title = Piwik::translate($titleKey);
            $field->description = Piwik::translate($descriptionKey);
            $field->uiControl = FieldConfig::UI_CONTROL_TEXTAREA;
            $field->customFieldComponent = self::CODE_EDITOR_COMPONENT;
            $field->fullWidth = true;
        });
    }
}
