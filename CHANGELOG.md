# Changelog

## [1.3.0](https://github.com/Igorcbraz/GitAscii/compare/v1.2.0...v1.3.0) (2026-08-07)


### Features

* export widget embed code using 100% width HTML tags ([e1e52d7](https://github.com/Igorcbraz/GitAscii/commit/e1e52d7d4405d64ce1fd6a932c3b871aec1a4ae8))


### Bug Fixes

* convert string tags to array in blog frontmatter ([3dec848](https://github.com/Igorcbraz/GitAscii/commit/3dec848c26203ff48c3ce89e7b7805a6f4dd01ba))

## [1.2.0](https://github.com/Igorcbraz/GitAscii/compare/v1.1.0...v1.2.0) (2026-08-05)


### Features

* add DevPublisher GitHub Actions workflow ([f6df35d](https://github.com/Igorcbraz/GitAscii/commit/f6df35dd8684b0529b3126c073b62542aebdea09))
* **editor:** add all GIF suggestions to CustomImageControls from TheDudeThatCode repo ([09508d7](https://github.com/Igorcbraz/GitAscii/commit/09508d72d3506029f25864142db36419daa252b6))
* **editor:** add global styles controls to properties panel ([b9025ac](https://github.com/Igorcbraz/GitAscii/commit/b9025acc8c39d2eb1a45fb43f9e7d31290deccb2))
* **editor:** implement animations, update properties panel and fix stories ([295a502](https://github.com/Igorcbraz/GitAscii/commit/295a5021846dd1dc2a362a4d001533d8a7176e79))
* **editor:** improve ghstats integrations controls and support all embed types ([1f17a19](https://github.com/Igorcbraz/GitAscii/commit/1f17a196839cd0f0afe797a3b78a79b069d1656a))
* **editor:** optimize responsive layout for mobile screens ([c5ec825](https://github.com/Igorcbraz/GitAscii/commit/c5ec825ae7d5cd4fba24c23087d08e72296e761d))
* **engine:** add import engine for markdown to widget conversion ([aef722b](https://github.com/Igorcbraz/GitAscii/commit/aef722b2dc0e042137c25d47d36eab746a915473))
* **github:** fetch profile README content ([9a573a3](https://github.com/Igorcbraz/GitAscii/commit/9a573a39b3fed783ddb70783c8d954ab139ddb5a))
* **import:** refactor readme importer and add custom image properties ([c741d53](https://github.com/Igorcbraz/GitAscii/commit/c741d5361894c1270a61d99fd43560c0a9049f5e))
* integrate GitHub App for committing README and layouts ([6e7e791](https://github.com/Igorcbraz/GitAscii/commit/6e7e7914b1991b2d6b737ff1f5a858d84e5bc38f))


### Bug Fixes

* **canvas:** prevent full SVG re-render and animation resets on widget drag ([6f63d0a](https://github.com/Igorcbraz/GitAscii/commit/6f63d0add9a33b37e4c8090fc8cd80808f676c8d))
* **explore:** load community profiles from cloud storage in production ([2844a0b](https://github.com/Igorcbraz/GitAscii/commit/2844a0ba4e190a0162c704ea3ec40ac9e663b7ab))
* remove CodeQL vulnerable regex entirely using skipImage param ([8a13342](https://github.com/Igorcbraz/GitAscii/commit/8a133424531c35e29644ad4891529103f6fabab3))
* resolve CodeQL regex ReDoS and Vercel build conflicts ([db9f187](https://github.com/Igorcbraz/GitAscii/commit/db9f187d9f4f6103ddaa7e15c3b46ad79695f51b))
* resolve remaining github-advanced-security vulnerabilities ([77d6381](https://github.com/Igorcbraz/GitAscii/commit/77d63818aff42710cc494184d83f1a43389c66f4))
* resolve SSRF vulnerabilities in githubApp.ts ([a7f1add](https://github.com/Igorcbraz/GitAscii/commit/a7f1add0d53a60a807e65516e426b87a1b035aa0))
* smooth editor dragging and snapping ([bb818b4](https://github.com/Igorcbraz/GitAscii/commit/bb818b4942db5bcf25e03c5f7bcfe00a1d283339))

## [1.1.0](https://github.com/Igorcbraz/GitAscii/compare/v1.0.1...v1.1.0) (2026-07-31)

### Features

- **editor:** add marquee selection and shortcuts ([45eee18](https://github.com/Igorcbraz/GitAscii/commit/45eee186c2df250c917ae1c0237045a5e966ceea))
- enhance SEO and add new community/template sections ([4da4a60](https://github.com/Igorcbraz/GitAscii/commit/4da4a60225b2288107a1e7635633ae4dc9ef07b8))
- **landing:** replace templates showcase with interactive showcase and update copy ([ec9b73f](https://github.com/Igorcbraz/GitAscii/commit/ec9b73f7baba0e37548c7ca31bb9443369e9e12c))

### Bug Fixes

- show correct favicon ([d56017d](https://github.com/Igorcbraz/GitAscii/commit/d56017d4ec46e1da5c27325967e59fc254e89faf))

## [1.0.1](https://github.com/Igorcbraz/GitAscii/compare/v1.0.0...v1.0.1) (2026-07-31)

### Bug Fixes

- **security:** resolve all CodeQL alerts ([77767bf](https://github.com/Igorcbraz/GitAscii/commit/77767bf637c21f07dc35ef4f8f6fec925ec530d0))

## 1.0.0 (2026-07-31)

### Features

- @vercel/blob ([ffb2724](https://github.com/Igorcbraz/GitAscii/commit/ffb27241f8500783a4d4472c6acc31a724271485))
- add auth session in Navbar and fetch config from GitHub repository ([5f73eeb](https://github.com/Igorcbraz/GitAscii/commit/5f73eebda835ddb2fb160380d1604192927eb8f3))
- add smooth hover transitions, register gitfest-lineup widget, and sanitize profile paths ([1b089ec](https://github.com/Igorcbraz/GitAscii/commit/1b089ecd8caf60a88358c2a073efd4cf8985509a))
- advanced analytics ([bdea902](https://github.com/Igorcbraz/GitAscii/commit/bdea902e0a59c315e276e7667745277f6fe5c3c8))
- better edit working ([32ee617](https://github.com/Igorcbraz/GitAscii/commit/32ee6171cb6ffeac4337ab02db1b03cd2e2ecfa5))
- better export and option to contribute ([ddce214](https://github.com/Igorcbraz/GitAscii/commit/ddce21412fdfb75fc48634633f9bdffcd89d758e))
- better landing ([9ef578a](https://github.com/Igorcbraz/GitAscii/commit/9ef578ae6b649e25c932b8fd71d9a91441b556cc))
- FEATURED WIDGETS ([4c9ed02](https://github.com/Igorcbraz/GitAscii/commit/4c9ed02281d72498671826952846005bec979c21))
- google analytics basics ([7eaa6b1](https://github.com/Igorcbraz/GitAscii/commit/7eaa6b1b29a248a00c29e5fe53fe406d1bbbec92))
- improve cache, snap alignment, validations & translate readme ([96bc5d2](https://github.com/Igorcbraz/GitAscii/commit/96bc5d28db7442bd31673858d094ac044b839f67))
- more templates ([43a6288](https://github.com/Igorcbraz/GitAscii/commit/43a628872fdbf1e50c08b9fbc777a3e863022d82))
- multilanguage ([a9a86d7](https://github.com/Igorcbraz/GitAscii/commit/a9a86d76e3eebcbdd06d77bb358818aa81421136))
- optimize profile cache, compress Vercel blobs, and add new tech icons ([b0db25d](https://github.com/Igorcbraz/GitAscii/commit/b0db25d0684845ba1a21df7a91a1ecd0e37c0ab8))
- save, import and export ([25116c4](https://github.com/Igorcbraz/GitAscii/commit/25116c4f453a83ca7e9cc43480fd4c39519a68c3))
- widget to text ascii ([0999758](https://github.com/Igorcbraz/GitAscii/commit/09997581b4ca1f34bfce8ed60f5face2e1a6ec3d))

### Bug Fixes

- access image with .svg ([cfb8c3f](https://github.com/Igorcbraz/GitAscii/commit/cfb8c3fa9175b4bc8d51c4bfbf46c08955c991f8))
- build ([0000c6d](https://github.com/Igorcbraz/GitAscii/commit/0000c6d0e292e90dc42e1caf7daae0a67243c462))
- exclude info fallback ([0017b53](https://github.com/Igorcbraz/GitAscii/commit/0017b531f051ea9108ca8eafc00fffea1bd8a1cf))
- gitfest preview ([ab911d8](https://github.com/Igorcbraz/GitAscii/commit/ab911d81ad5e5fde6da92a7cf7d0ecddaccc76c2))
- hoist nested svg styles to root to fix readme animations ([c67c89b](https://github.com/Igorcbraz/GitAscii/commit/c67c89b3034d64db2a98439c8cae937828a8441b))
- improve GitHub API stability and limits ([10714f0](https://github.com/Igorcbraz/GitAscii/commit/10714f0e853e62d6dd2605ec4f29f29e5ca24659))
- overwrite existing file ([70903eb](https://github.com/Igorcbraz/GitAscii/commit/70903eb1c391e851c415125ba49b031f1292c728))
- test load image ascii ([912ae00](https://github.com/Igorcbraz/GitAscii/commit/912ae0089cb582ac6767d0c58d81e2e20dcadd95))
