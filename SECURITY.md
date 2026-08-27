<div align="center">
  <a href="https://gitascii.com">
    <img src="src/app/icon-512.png" width="80" height="80" alt="GitAscii Logo" />
  </a>
  <h1>Security Policy</h1>
  <p>Our commitment to user privacy, data security, and responsible disclosure.</p>
</div>

---

## Supported Versions

We actively release security patches and stability updates for the following versions:

| Version           | Supported | Status                          |
| :---------------- | :-------: | :------------------------------ |
| `1.x.x` (current) |    ✅     | Active support & security fixes |
| `< 1.0.0`         |    ❌     | End of Life (Please upgrade)    |

---

## Reporting a Vulnerability

We take the security of GitAscii and its users very seriously. If you believe you have discovered a security vulnerability in GitAscii, please report it responsibly by following these steps:

### 🔒 Where to Report

> **IMPORTANT:** Please do **NOT** open public GitHub issues, discussions, or pull requests for security vulnerabilities.

Please report security issues directly via:

- **Email:** 📧 [`igorcbraz1@gmail.com`](mailto:igorcbraz1@gmail.com) with the subject line `[SECURITY] Vulnerability Report in GitAscii`.
- **GitHub Advisory:** If available, submit a [Private Vulnerability Report](https://github.com/Igorcbraz/GitAscii/security/advisories/new).

### 📋 What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:

1. **Description:** Clear summary of the potential vulnerability and its estimated severity.
2. **Steps to Reproduce:** Step-by-step instructions or proof-of-concept (PoC) scripts/payloads.
3. **Affected Components:** Specific API routes, components, or edge functions involved (e.g. `/api/...` SVG renderer, image conversion canvas, etc.).
4. **Potential Impact:** What an attacker could achieve if the vulnerability were exploited.
5. **Mitigation Suggestions:** Any ideas for potential patches or fixes (optional but welcomed).

---

## Response Timeline & SLA

We are committed to handling all vulnerability reports promptly:

- **Initial Acknowledgment:** Within **48 hours** of report receipt.
- **Triage & Assessment:** We will assess the severity and impact within **3 to 5 business days**.
- **Fix & Patch Release:** Once validated, a patch will be prepared, reviewed, tested, and released as quickly as possible.
- **Public Disclosure:** We coordinate public disclosure with the reporter once a patched version has been deployed.
- **Credit:** We gladly credit security researchers in release notes (unless anonymity is requested).

---

## Security Architecture & Best Practices

GitAscii incorporates several security layers by design:

- **SVG Sanitization & Anti-XSS:** All dynamic SVG endpoints escape and sanitize input parameters (usernames, bio text, custom labels) to prevent stored or reflected SVG XSS injections in GitHub README previews.
- **Rate Limiting & Token Protection:** Edge routes protect upstream GitHub API rate limits using caching headers and token rotation where applicable.
- **Dependency Auditing:** Automated daily scanning via **GitHub CodeQL** and **Dependabot** to identify and remediate known vulnerabilities in dependencies.
- **Privacy by Default:** GitAscii does not persist or store your GitHub credentials, access tokens, or personal repository contents on central databases.

Thank you for helping keep GitAscii and the developer community safe! 🛡️
