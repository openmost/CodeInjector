## Documentation

This plugin add two `textarea` fields where you can paste your code.

### Use case

- Add CSS to customize your UI without theming
- Add CSS to fix small issues
- Add JS to enhance experience
- Add JS to put a custom tracker in Matomo UI
- Add external JS libraries to Matomo
- Possibilities are limitless.

### To paste your code in the right place use use the native Matomo hooks :

- `bodyTop` hook is the first line in `<body>`
- `bodyBottom` hook is the last line in `<body>`

### Warning


The code you add in these areas will be automatically added to all pages of your Matomo instance.

<u style="color: red"> Don't copy code you don't understand. </u>