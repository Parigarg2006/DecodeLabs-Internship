# Form Design & Validation — Project 4 (DecodeLabs Internship)

A fully client-side sign-up form built with vanilla **HTML5, CSS3, and JavaScript**, demonstrating real-time input validation, regex-based pattern matching, and accessible error handling.

## Features
- Semantic HTML structure (`<form>`, `<label>`, `<input>`, `<button type="submit">`)
- Custom JavaScript validation with `event.preventDefault()` to stop native page refresh
- Regex-based checks:
  - Name: letters, spaces, hyphens only
  - Email: basic syntax validation
  - Password: 8+ chars, uppercase, lowercase, number, special character
  - Confirm Password: cross-field match check
- Live password strength meter with animated bar + checklist
- Show/hide password toggle
- Dynamic error and success messages
- Full accessibility support: `aria-invalid`, `aria-describedby`, `role="alert"`, and a `aria-live="polite"` status region (announces only on blur/submit, not every keystroke)
- Dark glassmorphism UI with gradient animation and micro-interactions

## File Structure
```
form-validation-project/
├── index.html   → Semantic form markup
├── style.css    → Dark theme, animations, responsive layout
├── script.js    → Validation engine, regex logic, ARIA handling
└── README.md    → This file
```

## Run Locally
1. Open the folder in VS Code.
2. Install the "Live Server" extension (if not already installed).
3. Right-click `index.html` → "Open with Live Server".
4. The form opens in your browser at `http://127.0.0.1:5500/`.

## What to Check When Testing
- Submit an empty form → all fields should show errors, focus jumps to the first invalid field.
- Type a weak password → strength bar is red, checklist shows unmet items.
- Type a strong password (e.g. `Test@1234`) → strength bar turns green, checklist ticks off.
- Mismatch confirm password → error shows instantly.
- Fill everything correctly → loading spinner briefly appears, then a green success message shows and the form resets.