## Changelog

### v5.1.0

- Requires Matomo 5.0.0 or higher (`>=5.0.0,<6.0.0-b1`). The code editor falls back to the Matomo light theme colors when the theme color variables are not available (before Matomo 5.10.0).
- The code is edited on a dedicated **Administration > System > Code Injector** page instead of the General settings, existing code is kept
- New `CodeInjector.getCode` and `CodeInjector.setCode` API methods (super user only, saving requires the password confirmation)
- Code editor with HTML, CSS and JavaScript syntax highlighting, in a light and dark palette that follows the Matomo theme
- Live syntax checks: HTML, CSS, JavaScript and JSON-LD errors, unclosed `<script>` and `<style>` tags, code pasted without tags
- The code is not injected on the Code Injector page, so a snippet breaking the interface can always be fixed
- Interface translated into 12 languages
- Shorter Marketplace description that fits the plugin cards, and campaign parameters on the Openmost links of the README.

### v5.0.10

- update: marketplace category and cover

### v5.0.9

- Update documentation

### v5.0.8

- Fix compatibility with Matomo v5.0

### v5.0.6

- Support Matomo v5

### v4.0.6

- Support Matomo v4.0.0 instead of 4.15.1

### v4.0.5

- Update FAQ (remove unnecessary API method)

### v4.0.4

- Fix FAQ syntax

### v4.0.3

- Support body bottom code

### v4.0.2

- Add readme
- Release on Marketplace

### v4.0.1

- Fix input validators

### v4.0.0

- Init plugin
