## Documentation

This plugin adds two code editors in **Administration > System > Code Injector**, where you can paste your HTML, CSS and JavaScript code.

### Use cases

- Add CSS to customize your UI without creating a theme
- Add CSS to fix small display issues
- Add JavaScript to enhance the user experience
- Add a tracking code to measure how your team uses Matomo
- Add a chat or support widget
- Load external JavaScript libraries in Matomo

### Where the code is injected

The code is injected in every page of the Matomo interface (reporting, dashboard, administration, Tag Manager, login page) using the native Matomo hooks:

- `Template.bodyTop`: right after the opening `<body>` tag, before the page content
- `Template.bodyBottom`: right before the closing `</body>` tag, after the page content

Your code must be wrapped in the right tags, for example:

```html
<style>
  .card { border-radius: 12px; }
</style>

<script>
  console.log('Hello from Code Injector');
</script>
```

### Code editor

Each field is a code editor with HTML, CSS and JavaScript syntax highlighting, in a light or dark palette that follows the Matomo theme. While you type, the editor checks your code and shows a status next to the field title:

- HTML syntax errors, like a closing tag that does not match its opening tag
- CSS syntax errors in `<style>` tags, like a missing or extra brace
- JavaScript syntax errors in `<script>` tags
- JSON syntax errors in `<script type="application/ld+json">` tags
- `<script>` and `<style>` tags that are never closed
- Code pasted without any `<script>` or `<style>` tag, which would be displayed as text

Click the status to list the problems. These checks never block saving.

### Safe mode on the Code Injector page

The code is never injected on the Code Injector page. If a snippet breaks the Matomo interface, go back to this page to fix or remove it.

### Warning

Only super users can edit this code, and it runs for every user of your Matomo instance.

**Don't paste code you don't understand.**
