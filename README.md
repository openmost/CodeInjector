# Matomo CodeInjector Plugin

Inject your own HTML, CSS and JavaScript into every page of the Matomo interface, from a code editor that checks your syntax as you type.

## Features

- **Two injection points**: right after the opening `<body>` tag and right before the closing `</body>` tag, through the native `Template.bodyTop` and `Template.bodyBottom` hooks
- **Dedicated admin page**: edit the code in **Administration > System > Code Injector**, saving asks for your password like any system setting
- **Code editor**: HTML editor with embedded CSS and JavaScript syntax highlighting, in a light or dark palette that follows the Matomo theme
- **Live syntax checks**: HTML, CSS, JavaScript and JSON-LD (`<script type="application/ld+json">`) errors, unclosed `<script>` and `<style>` tags, and code pasted without any tag. Problems are listed next to the field and never block saving
- **Safe mode**: the code is never injected on the Code Injector page, so a snippet that breaks the interface can always be fixed or removed
- **API**: `CodeInjector.getCode` returns the code and `CodeInjector.setCode` saves it (super user only, password confirmation required)
- Interface translated into 12 languages

## Requirements

- Matomo 5.0.0 or higher, below 6.0.0
- PHP 7.2.5 or higher

## Installation / Configuration

1. Install and activate the plugin from the Matomo Marketplace (**Administration > Platform > Marketplace**).
2. Go to **Administration > System > Code Injector**.
3. Paste your code in one of the two editors. Wrap CSS in a `<style>` tag and JavaScript in a `<script>` tag.
4. Click **Save** and confirm your password.

Only super users can see the page and edit the code. Once saved, the code runs in every page of the Matomo interface, for every user, including the login page. It is not added to the JavaScript tracker or to Tag Manager containers.

## Privacy and data

The code is stored in the Matomo database as a plugin system setting. The plugin itself sends nothing outside your Matomo instance, but the code you inject runs in the browser of every Matomo user: only paste code you understand and trust.

## Need help with Matomo?

Openmost is an official Matomo Implementation Partner. When injected code grows beyond a few tweaks, we turn it into a [custom Matomo plugin](https://openmost.com/matomo/services/plugin-development?utm_source=matomo_marketplace&utm_medium=referral&utm_campaign=services&utm_content=codeinjector), built from a written spec, tested on the Matomo versions you run and maintained over time.

## Support

- Documentation: https://openmost.com/matomo/extensions/code-injector
- Email: ronan@openmost.com
- Issues: https://github.com/openmost/CodeInjector/issues

## Screenshots

See the `screenshots/` folder for the Code Injector page and its code editor.
