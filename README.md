# GetMoved Landing

## Run locally
- From `getmoved-landing/`, open `index.html` directly in a browser, or run a local server:
  - `python -m http.server 8000`
  - open `http://localhost:8000/index.html`

## Sections + anchors
- `#home` — Hero
- `#how-it-works` — How it works
- `#features` — Key features
- `#demo` — Demo results
- `#use-cases` — Use cases
- `#pricing` — Pricing
- `#faq` — FAQ
- `#contact` — Book a demo

## Content updates
- Main copy lives in `index.html` (Hero, How it works, Features, Demo, Use cases, Pricing, FAQ, Contact).
- Pricing plan bullets and price points are in the `#pricing` section.
- Demo "After" panel data and JSON snippet are in the `#demo` section.

## CTA flow
- `js/getmoved.js` handles the "Try Sample Video" modal and contact form submission.
- Contact form posts to `/api/lead` (placeholder); when no backend exists it falls back to a mocked response.

## Visual placeholders
- `assets/img/hero-mock.svg`
- `assets/img/demo-before.svg`
- `assets/img/demo-after.svg`
