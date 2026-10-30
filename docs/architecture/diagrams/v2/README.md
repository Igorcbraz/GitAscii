# Archify source and artifacts

`candidate.json` is the repository-backed architecture source. The HTML contains the interactive viewer; `../../../images/architecture/gitascii-v2.svg` is its SVG export embedded by the Mintlify architecture page.

From the repository root, with the installed Archify skill:

```sh
node .agents/skills/archify/bin/archify.mjs finalize architecture docs/architecture/diagrams/v2/candidate.json docs/architecture/diagrams/v2/gitascii-v2.html --repo-root . --quality showcase --json
```

If the installed package keeps its CLI elsewhere, substitute that package's `bin/archify.mjs` path. Open the generated HTML, use **Export → SVG → Auto**, and save the download as `docs/images/architecture/gitascii-v2.svg`. Recheck the embedded image after exporting.

The finalize, delivery and browser-check receipts record automated validation and SHA-256 hashes. Keep the candidate frozen during finalization. Do not format generated HTML or receipts afterward: that invalidates their provenance. Regenerate after changing the candidate.

The delivered diagram passed all four finalize gates (validate, deliver, strict check, browser-check). A separate screenshot inspection checked readable routes and labels in light and dark views; screenshots are local scratch output, not documentation assets. The automated receipt's `visualReview: not-requested` refers to the CLI run, not that subsequent manual inspection.
