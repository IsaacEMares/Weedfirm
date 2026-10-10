# Weedfirm — Apartment Days

A fictional Stage 1 sandbox built with strict TypeScript, Vite, and CSS artwork. Start at age 20 in a small apartment. Plant and water a seed, harvest after 45 seconds, accept simulated customer texts, fulfill orders, and reinvest in a second growing slot. Complete five orders and unlock the slot to reach the first milestone.

The apartment, furniture, window light, and plants are drawn in CSS. Stylesheet animations handle light, dust, plant movement, incoming messages, watering, harvests, and sale feedback. Reduced-motion preferences disable animation. Layouts support desktop and mobile without external fonts or art downloads.

## Develop

Requires Node.js 24 and npm. From this checkout:

```sh
npm ci --cache /workspace/.npm-cache
npm start
```

Vite serves the application on port 3001. TypeScript entry points need Vite; do not use a plain static server for source files. Browser saves from the earlier port 3000 prototype are stored under a different origin and do not automatically transfer to port 3001.

Progress saves automatically in browser local storage. New game asks before replacing your save. Growth catches up when you return; orders are capped at three active requests. All messages and currency are simulated locally.

## Publish on Netlify

Import `IsaacEMares/Weedfirm` from GitHub into Netlify and select the `main` branch. The included `netlify.toml` selects Node.js 24, runs `npm run build`, and publishes `dist/`. No environment secrets are required. Once deployed, use the HTTPS site URL to play; progress is saved in that browser for that site.

## Validate the game

```sh
npm test
npm run build
npm run test:browser
```

Game tests cover growth, sales, resource restrictions, message limits, and serialized state. Browser tests exercise the full loop, reloading saved progress, and mobile overflow. They use the environment's installed `/usr/bin/chromium`; set `CHROMIUM_PATH` to another installed Chromium executable when needed. No browser download is required in this cloud environment.

The production build is generated in `dist/`. Screenshots from browser validation appear under ignored `test-results/`.
