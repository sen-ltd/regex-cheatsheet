# 正規表現チートシート | Regex Cheatsheet

正規表現チートシート。全パターンにライブテスター付き、40+ カテゴリ別パターン + 20+ 実用パターン。

Interactive regex cheatsheet with live tester on every entry. 40+ syntax examples + 20+ ready-to-use patterns.

**Demo**: https://sen.ltd/portfolio/regex-cheatsheet/

## Features

- 40+ syntax entries across 8 categories (character classes, quantifiers, anchors, groups, alternation, lookaround, flags, special characters)
- Live regex tester on every entry — edit the pattern or test string in real time
- Match highlighting with color-coded marks
- Capture group display (positional and named)
- Pattern description (human-readable tokenized explanation)
- 20+ common patterns (email, URL, phone JP, date, hex color, IPv4, UUID, credit card, etc.)
- One-click "Load" to drop common patterns into the playground tester
- Copy button on every pattern
- Japanese / English UI toggle
- Dark / light theme

## Tech

- Vanilla JS (ES modules, no framework, no build step)
- Zero runtime dependencies

## Run locally

```sh
npm run serve
# open http://localhost:8080
```

## Test

```sh
npm test
```

## Structure

```
index.html          Entry point
style.css           All styles (dark/light theme via CSS variables)
src/
  main.js           DOM, events, live regex evaluation
  patterns.js       All 40+ pattern entries with pre-filled test data
  regex.js          Pure helpers: safeCompile, findMatches, highlightMatches, describePattern
  i18n.js           Japanese/English translations
tests/
  regex.test.js     Unit tests for pure helpers (Node built-in test runner)
```

## License

MIT © 2026 SEN LLC (SEN 合同会社)
