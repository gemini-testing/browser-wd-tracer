# browser-wd-tracer

[![CI](https://github.com/gemini-testing/browser-wd-tracer/actions/workflows/ci.yaml/badge.svg)](https://github.com/gemini-testing/browser-wd-tracer/actions/workflows/ci.yaml)

A browser-based ui-tool for parsing and exploring WebDriver logs. Raw WebDriver logs are large and hard to navigate as plain text — this tool makes it easy to explore commands, responses, console output, and more, all parsed in-browser with no server required.

**[► Try it live with example logs](https://gemini-testing.github.io/browser-wd-tracer/?logUrl=https://gemini-testing.github.io/browser-wd-tracer/examples/webdriver.txt)**

**Supported parsers:**
- ChromeDriver

## Requirements

- Node.js >= 20

## Development

Install dependencies:

```bash
npm ci
```

Start the dev server:

```bash
npm run dev
```

Start the dev server with a bundled example log:

```bash
npm run dev:example
```

## Deployment

Build the app:

```bash
git clone https://github.com/gemini-testing/browser-wd-tracer
cd browser-wd-tracer
npm ci
npm run build
```

After the build, the `dist/` folder contains a ready-to-serve SPA. Serve it with any static HTTP server:

```bash
npx http-server dist/ -p 3000
```

Then open the app and pass a log URL via the query parameter:

```
http://localhost:3000/?logUrl=http://your-log-server/webdriver.txt
```
