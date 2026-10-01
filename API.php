<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\CodeInjector;

use Piwik\Common;
use Piwik\Piwik;

/**
 * Reads and saves the code injected in every page of the Matomo UI.
 *
 * @method static \Piwik\Plugins\CodeInjector\API getInstance()
 */
class API extends \Piwik\Plugin\API
{
    /**
     * @var CodeSettings
     */
    private $settings;

    public function __construct(CodeSettings $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @return array{bodyTop: string, bodyBottom: string}
     */
    public function getCode(): array
    {
        Piwik::checkUserHasSuperUserAccess();

        return [
            'bodyTop' => (string) $this->settings->bodyTop->getValue(),
            'bodyBottom' => (string) $this->settings->bodyBottom->getValue(),
        ];
    }

    /**
     * The code runs in every page of every user, so saving it requires the password like any system setting.
     */
    public function setCode(
        string $bodyTop = '',
        string $bodyBottom = '',
        #[\SensitiveParameter]
        $passwordConfirmation = false
    ): void {
        Piwik::checkUserHasSuperUserAccess();

        $this->confirmCurrentUserPassword($passwordConfirmation);

        // API parameters are HTML-escaped by the proxy, the code must be stored verbatim
        $this->settings->bodyTop->setValue(Common::unsanitizeInputValue($bodyTop));
        $this->settings->bodyBottom->setValue(Common::unsanitizeInputValue($bodyBottom));
        $this->settings->save();
    }
}
