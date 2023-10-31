<?php
/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\CodeInjector;

use Piwik\Settings\Setting;
use Piwik\Settings\FieldConfig;
use Piwik\Validators\NotEmpty;

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
    /** @var Setting */
    public $head;

    protected function init()
    {
        $this->bodyTop = $this->createBodyTopSettings();
    }

    private function createBodyTopSettings()
    {
        return $this->makeSetting('bodyTop', '', FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = 'Add code to Matomo';
            $field->uiControl = FieldConfig::UI_CONTROL_TEXTAREA;
            $field->description = 'Add code to the <body> section of the page';
            $field->validators[] = new NotEmpty();
        });
    }
}
