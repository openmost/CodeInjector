# Matomo CodeInjector Plugin

## Description

Inject HTML, CSS and JavaScript code in every page of your Matomo instance, using native Matomo hooks.

- Two code areas: at the top and at the bottom of the `<body>` tag
- Code editor with HTML, CSS and JavaScript syntax highlighting
- Live checks: HTML, CSS, JavaScript and JSON-LD syntax errors, unclosed `<script>` and `<style>` tags, code pasted without tags
- Safe by design: the code is never injected on the settings page, so a snippet breaking the interface can always be fixed

## Requirements

- Matomo 6.x
- PHP 8.1 or higher
- MySQL 8.0 or MariaDB 10.6 or higher

## Documentation

See the [plugin page](https://openmost.com/matomo/extensions/code-injector).
