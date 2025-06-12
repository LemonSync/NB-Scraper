# NB Scraper

[![NPM](https://nodei.co/npm/nb-scraper.png)](https://npmjs.org/package/nb-scraper)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f7c79559f8d44dd49ee3fc69bc77aef3)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![CI/CD Pipeline](https://github.com/Chakszzz/NB-Scraper/actions/workflows/ci.yml/badge.svg)](https://github.com/Chakszzz/NB-Scraper/actions/workflows/ci.yml)

A comprehensive TypeScript scraper library by **NB Team** that provides easy-to-use functions for interact with various scraper service from NB Scripts.

## 📦 Installation
**Using npm:**
```bash
npm install nb-scraper
```
**Using yarn:**
```bash
yarn add nb-scraper
```
**Using pnpm:**
```bash
pnpm add nb-scraper
```

## 🛠️ Usage

### ESM (Modern JavaScript/TypeScript)

```typescript
import { blackboxAi, threads } from 'nb-scraper';

// Scrape BlackBox AI
const aiResult = await blackboxAi('What is TypeScript?');
if (aiResult.status) {
  console.log('AI Response:', aiResult.data.response);
  console.log('Sources:', aiResult.data.source);
} else {
  console.error('Error:', aiResult.error);
}

// Scrape Threads media
const mediaResult = await threads('https://www.threads.net/@username/post/123456789');
if (mediaResult.status) {
  console.log('Images:', mediaResult.data.image_urls);
  console.log('Videos:', mediaResult.data.video_urls);
} else {
  console.error('Error:', mediaResult.error);
}
```

### CommonJS (Node.js)

```javascript
const { blackboxAi, threads } = require('nb-scraper');

// Same usage as above
(async () => {
  const result = await blackboxAi('Hello World');
  console.log(result);
})();
```
### See Documentation: [Nb-Scraper-Docs](https://nb-scraper.js.org)
### Success Response Example

```typescript
{
  creator: "...",
  status: true,
  data: {
    response: "TypeScript is a programming language...",
    source: [
      {
        link: "https://example.com",
        title: "TypeScript Documentation",
        snippet: "TypeScript is...",
        position: 1
      }
    ]
  }
}
```

### Error Response Example

```typescript
{
  creator: "NB Team",
  status: false,
  error: "[NETWORK_ERROR] Request timeout after 30000ms"
}
```

## 🛡️ Error Handling

NB Scraper is designed to never throw errors. Instead, all functions return a response object with a `status` field:

```typescript
const result = await blackboxAi('test query');

if (result.status) {
  // Success - use result.data
  console.log(result.data.response);
} else {
  // Error - check result.error
  console.error(result.error);
}
```

Common error types:
- `NETWORK_ERROR`: Connection, timeout, or server issues
- `INVALID_INPUT`: Invalid parameters or URL format
- `INVALID_RESPONSE`: Unexpected response format from API
- `RATE_LIMITED`: Rate limiting or quota exceeded
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

## Available Scrapers
**See The [scrapers folder](app/scrapers)**

## 📄 License

This project is licensed under the The UnlicenseLicense - see the [LICENSE](LICENSE) file for details.

## Resource

**NB Scraper is desaign to work for easy to use**

## 🔗 Links
- [npm Package](https://www.npmjs.com/package/nb-scraper)
- [Documentation](https://nb-scraper.js.org)
- [Issues](https://github.com/chakszzz/nb-scraper/issues)

Made with ☕
