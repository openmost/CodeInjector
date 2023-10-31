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
            'Template.bodyTop' => 'addCodeToBodyTop'
        );
    }

    public function addCodeToBodyTop()
    {
        $settings = new SystemSettings();
        $bodyTop = $settings->bodyTop->getValue();

        echo $bodyTop;
    }

}
