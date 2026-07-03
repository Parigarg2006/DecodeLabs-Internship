# Project 3 — Signal Lab · Interactive Web Elements

Built for the DecodeLabs Frontend Development internship (Batch 2026).

**Live concept:** the page is framed as a control console. A signature
**IPO Trace** panel at the top narrates, in real time, the exact
Input → Process → Output loop taught in the Project 3 brief — every
module on the page reports into it when you use it.

## What it demonstrates (per the task brief)

- **Buttons / toggles** — dark mode switch, task complete/remove buttons,
  signal +/− controls, carousel prev/next & dots.
- **Basic user interaction** — form submission, live text input, click
  handling via `addEventListener` throughout (no inline `onclick`).
- **Dynamic content update** — tasks are created with `createElement`/
  `appendChild` and removed with `removeChild`; all text is written with
  `textContent` (never `innerHTML`, to avoid XSS as covered in the deck).

## Modules

| Module | Concepts |
|---|---|
| Theme toggle | `classList.toggle`, `localStorage` persistence, `prefers-color-scheme` |
| Task Queue | DOM node creation, per-item event listeners, empty-state handling |
| Signal Strength | state-driven `classList` bands (idle/mid/high), inline style mutation |
| Field Notes carousel | array-driven dynamic content, `role="tablist"` dot navigation |
| Handoff Note form | live character count, validation state, `aria-live` status |

## Conventions followed

- `const` by default; `let` only where a value must mutate (counters, indices).
- `var` is never used.
- `js-` prefixed classes are DOM hooks only; `is-` prefixed classes represent
  state only — CSS and JS never fight over the same class.
- No `innerHTML` anywhere in the codebase.

## Run it locally

Just open `index.html` in a browser — no build step or dependencies.

```bash
# or, for live-reload while editing in VS Code:
# install the "Live Server" extension, then right-click index.html → "Open with Live Server"
```

## Files

```
project-3/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```