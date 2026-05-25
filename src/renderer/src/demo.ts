export const DEMO_PATH = '/demo/example.md'

export const DEMO_CONTENT = `---
title: MD Viewer — Feature Demo
author: MD Viewer
date: 2026-05-17
tags: [markdown, demo, features]
---

# MD Viewer — Feature Demo

A professional Markdown viewer with all the features you expect from tools like Obsidian and Claude.

## Typography

Paragraphs render with comfortable line height for long reading sessions. Text can be **bold**, *italic*, ~~strikethrough~~, or \`inline code\`. You can also write [external links](https://example.com) that open in the browser.

## Code Blocks

\`\`\`typescript
interface MarkdownResult {
  html: string
  toc: TOCItem[]
  frontmatter: FrontmatterData
}

function parseDocument(content: string): MarkdownResult {
  const { data, body } = parseFrontmatter(content)
  const html = md.render(body)
  return { html, toc: buildTOC(tokens), frontmatter: data }
}
\`\`\`

\`\`\`python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

## Callouts (GitHub/Obsidian Style)

> [!NOTE]
> This is a **note** callout. Useful for supplementary information that enhances understanding.

> [!WARNING]
> This is a **warning** callout. Use it to highlight potential issues or risks.

> [!TIP]
> This is a **tip** callout. Great for best practices and helpful suggestions.

> [!IMPORTANT]
> This is an **important** callout. Use sparingly for critical information.

## Math (KaTeX)

Inline math: the famous equation $E = mc^2$ by Einstein.

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

The quadratic formula: $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Syntax highlighting | ✅ | 190+ languages via highlight.js |
| Mermaid diagrams | ✅ | Flowcharts, sequence, gantt, etc. |
| KaTeX math | ✅ | Inline and block |
| GitHub callouts | ✅ | NOTE, TIP, WARNING, CAUTION, IMPORTANT |
| Task lists | ✅ | Checkboxes |
| Frontmatter | ✅ | YAML metadata in sidebar |
| Dark / Light mode | ✅ | Syncs with OS |
| File watching | ✅ | Auto-reload on save |
| Search | ✅ | Ctrl+F to find in page |

## Task Lists

- [x] Render markdown with syntax highlighting
- [x] Table of contents with active heading tracking
- [x] Mermaid diagram support
- [x] KaTeX math rendering
- [x] GitHub-style callouts
- [x] Dark and light themes
- [ ] Plugin system (planned)
- [ ] Export to HTML (planned)

## Mermaid Diagrams

\`\`\`mermaid
flowchart LR
    A[Open .md file] --> B{Has frontmatter?}
    B -->|Yes| C[Parse YAML]
    B -->|No| D[Skip]
    C --> E[Show in Sidebar]
    D --> E
    E --> F[Render Markdown]
    F --> G[Build TOC]
    G --> H[Display]
\`\`\`

## Blockquotes

> "The best tools disappear into the work."
> — Anonymous

## Container Blocks

:::info
This is an **info** container using the \`:::type\` syntax.
:::

:::warning
This is a **warning** container.
:::

## Footnotes

Here is some text with a footnote.[^1]
Another sentence with another footnote.[^2]

[^1]: This is the first footnote content.
[^2]: This is the second footnote. It can contain **formatted** text too.

---

*MD Viewer — built with Electron, React, and markdown-it.*
`
