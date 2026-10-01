<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\CodeInjector;

use Piwik\Settings\FieldConfig;
use Piwik\Settings\Plugin\SystemSetting;

/**
 * Code injected in every page of the Matomo UI, editable by super users only.
 *
 * Not named SystemSettings on purpose: the settings are edited on the dedicated System > Code Injector
 * page, not in the General settings. The storage (plugin name and setting names) is unchanged.
 */
class CodeSettings extends \Piwik\Settings\Plugin\SystemSettings
{
    /** @var SystemSetting */
    public $bodyTop;

    /** @var SystemSetting */
    public $bodyBottom;

    protected function init()
    {
        $this->bodyTop = $this->makeSetting('bodyTop', '', FieldConfig::TYPE_STRING, function () {
        });
        $this->bodyBottom = $this->makeSetting('bodyBottom', '', FieldConfig::TYPE_STRING, function () {
        });
    }
}
