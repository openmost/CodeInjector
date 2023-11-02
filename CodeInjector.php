<?php
/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\CodeInjector;

class CodeInjector extends \Piwik\Plugin
{

    public function registerEvents()
    {
        return array(
            'Template.bodyTop' => 'addCodeToBodyTop',
            'Template.bodyBottom' => 'addCodeToBodyBottom'
        );
    }

    public function addCodeToBodyTop()
    {
        $settings = new SystemSettings();
        $bodyTop = $settings->bodyTop->getValue();
        echo $bodyTop;
    }

    public function addCodeToBodyBottom()
    {
        $settings = new SystemSettings();
        $bodyBottom = $settings->bodyBottom->getValue();
        echo $bodyBottom;
    }

}
