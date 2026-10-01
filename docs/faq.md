## FAQ

__How to install this plugin?__

This plugin is available in the official Matomo Marketplace. Install it the same way as other plugins:

- Go to the administration panel
- Open the Marketplace section and select "Plugins"
- Search for "**CodeInjector**", install and activate the plugin

__Where do I paste my code?__

Go to **Administration > System > Code Injector**.

__Who can edit the injected code?__

Only super users can edit the code. Once saved, the code runs in every page of the Matomo interface, for all users.

__My code is displayed as text at the top of the page, why?__

Your code is not wrapped in tags. Put your CSS in a `<style>` tag and your JavaScript in a `<script>` tag. The editor warns you when the tags are missing.

__My code broke the Matomo interface, how do I fix it?__

The code is never injected on the Code Injector page: open **Administration > System > Code Injector** (`index.php?module=CodeInjector&action=index`) and fix or remove your code.

__Is my code injected in the tracked websites?__

No, the code is only injected in the Matomo interface, not in the JavaScript tracker or the Tag Manager containers.

__Which versions of Matomo are supported?__

Version 5.x of the plugin supports Matomo 5, it requires PHP 7.2.5 or higher. For Matomo 6, use version 6.x of the plugin.

__How can I contribute to this plugin?__

Open an issue or a pull request on [GitHub](https://github.com/openmost/CodeInjector), or contact us at [openmost.com](https://openmost.com).

__How long will this plugin be maintained?__

As long as possible. We use Matomo and this plugin on many projects every day, so issues are fixed as fast as possible.
