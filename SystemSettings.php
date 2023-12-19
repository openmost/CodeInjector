<?php
/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\CodeInjector;

use Piwik\Piwik;
use Piwik\Settings\Setting;
use Piwik\Settings\FieldConfig;

/**
 * Defines Settings for CodeInjector.
 *
 * Usage like this:
 * $settings = new SystemSettings();
 * $settings->metric->getValue();
 * $settings->description->getValue();
 */
class SystemSettings extends \Piwik\Settings\Plugin\SystemSettings
{
    public $bodyTop;
    /**
     * @var \Piwik\Settings\Plugin\SystemSetting
     */
    public $bodyBottom;

    protected function init()
    {
        $this->bodyTop = $this->createBodyTopSettings();
        $this->bodyBottom = $this->createBodyBottomSettings();
    }

    private function createBodyTopSettings()
    {
        return $this->makeSetting('bodyTop', '', FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = Piwik::translate('CodeInjector_BodyTopTitle');
            $field->uiControl = FieldConfig::UI_CONTROL_TEXTAREA;
            $field->uiControlAttributes = ['rows' => 10, 'style' => 'min-height: 250px !important; font-family: monospace;'];
            $field->description = Piwik::translate('CodeInjector_BodyTopDescription');
        });
    }

    private function createBodyBottomSettings()
    {
        return $this->makeSetting('bodyBottom', '', FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = Piwik::translate('CodeInjector_BodyBottomTitle');
            $field->uiControl = FieldConfig::UI_CONTROL_TEXTAREA;
            $field->uiControlAttributes = ['rows' => 10, 'style' => 'min-height: 250px !important; font-family: monospace;'];
            $field->description = Piwik::translate('CodeInjector_BodyBottomDescription');
        });
    }
}
