How to add greetings

- Open `assets/greetings.txt` and add one greeting per line.
- The site will attempt to load `assets/greetings.txt` on page load and use those lines instead of the internal defaults.
- If you prefer to add greetings at runtime (non-persistent), open the browser console and run:

  window.addGreeting('你的自訂祝福內容');

This will add the greeting for the current page session only.
