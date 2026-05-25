import { useMemo } from 'react'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import container from 'markdown-it-container'
import attrs from 'markdown-it-attrs'
import hljs from 'highlight.js'
import yaml from 'js-yaml'
import katex from 'katex'
import type { TOCItem, FrontmatterData, MarkdownResult } from '../types'

// ── Frontmatter parser ───────────────────────────────────────────────────────
function parseFrontmatter(raw: string): { data: FrontmatterData; body: string } {
  if (!raw.startsWith('---')) return { data: {}, body: raw }
  const end = raw.indexOf('\n---', 4)
  if (end === -1) return { data: {}, body: raw }
  try {
    const data = (yaml.load(raw.slice(4, end)) as FrontmatterData) || {}
    return { data, body: raw.slice(end + 4).trimStart() }
  } catch { return { data: {}, body: raw } }
}

// ── Callout post-processor ───────────────────────────────────────────────────
const CALLOUT_ICONS: Record<string, string> = {
  note: '📝', tip: '💡', warning: '⚠️', caution: '🔥', important: '❗'
}
function processCallouts(html: string): string {
  return html.replace(
    /<blockquote>\n?<p>\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]([\s\S]*?)<\/blockquote>/gi,
    (_, type: string, rest: string) => {
      const t = type.toLowerCase()
      const icon = CALLOUT_ICONS[t] || '📌'
      const body = rest.replace(/^[ \t]*/, '')
      return `<blockquote class="callout callout-${t}"><div class="callout-title"><span>${icon}</span>${type}</div><div class="callout-body"><p>${body}</div></blockquote>`
    }
  )
}

// ── KaTeX math processor ─────────────────────────────────────────────────────
function processMath(md: MarkdownIt) {
  // Block math: $$...$$
  md.block.ruler.before('fence', 'math_block', (state, start, end, silent) => {
    const pos = state.bMarks[start] + state.tShift[start]
    const max = state.eMarks[start]
    if (state.src.slice(pos, pos + 2) !== '$$') return false
    if (silent) return true
    let nextLine = start + 1
    while (nextLine < end) {
      const linePos = state.bMarks[nextLine] + state.tShift[nextLine]
      const lineMax = state.eMarks[nextLine]
      if (state.src.slice(linePos, lineMax).trim() === '$$') break
      nextLine++
    }
    const content = state.getLines(start + 1, nextLine, 0, false)
    const token = state.push('math_block', 'math', 0)
    token.content = content
    token.map = [start, nextLine + 1]
    state.line = nextLine + 1
    return true
  })

  // Inline math: $...$
  md.inline.ruler.before('escape', 'math_inline', (state, silent) => {
    if (state.src[state.pos] !== '$') return false
    const start = state.pos + 1
    const end = state.src.indexOf('$', start)
    if (end === -1 || end === start) return false
    if (!silent) {
      const token = state.push('math_inline', 'math', 0)
      token.markup = '$'
      token.content = state.src.slice(start, end)
    }
    state.pos = end + 1
    return true
  })

  md.renderer.rules.math_block = (tokens, idx) => {
    try {
      return `<div class="math-block">${katex.renderToString(tokens[idx].content.trim(), { displayMode: true, throwOnError: false })}</div>\n`
    } catch { return `<div class="math-block math-error">${tokens[idx].content}</div>` }
  }

  md.renderer.rules.math_inline = (tokens, idx) => {
    try {
      return katex.renderToString(tokens[idx].content, { displayMode: false, throwOnError: false })
    } catch { return `<code>${tokens[idx].content}</code>` }
  }
}

// ── TOC builder ──────────────────────────────────────────────────────────────
function buildTOC(tokens: ReturnType<MarkdownIt['parse']>): TOCItem[] {
  const flat: TOCItem[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'heading_open') {
      const level = parseInt(t.tag[1])
      const inline = tokens[i + 1]
      // Filter to text-only tokens — exclude html_inline (the anchor link)
      const text = inline?.children
        ?.filter(c => c.type === 'text' || c.type === 'code_inline' || c.type === 'softbreak')
        .map(c => c.content).join('') || ''
      const id = t.attrGet('id') || text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      if (level <= 4) flat.push({ level, text, id, children: [] })
    }
  }
  return buildTree(flat)
}

function buildTree(items: TOCItem[]): TOCItem[] {
  const root: TOCItem[] = []
  const stack: TOCItem[] = []
  for (const item of items) {
    while (stack.length && stack[stack.length - 1].level >= item.level) stack.pop()
    if (!stack.length) { root.push(item) } else { stack[stack.length - 1].children.push(item) }
    stack.push(item)
  }
  return root
}

// ── Markdown-it instance ─────────────────────────────────────────────────────
const mdCache = new Map<string, MarkdownIt>()

function createMd(basePath: string | null) {
  const key = basePath ?? ''
  if (mdCache.has(key)) return mdCache.get(key)!
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
      if (lang === 'mermaid') {
        return `<div class="mermaid-diagram" data-src="${encodeURIComponent(str)}"></div>`
      }
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          return `<pre class="code-block" data-lang="${lang}"><button class="copy-btn" title="Copiar">Copiar</button><code class="hljs language-${lang}">${highlighted}</code></pre>`
        } catch { /* fall through */ }
      }
      const escaped = md.utils.escapeHtml(str)
      return `<pre class="code-block"><button class="copy-btn" title="Copiar">Copiar</button><code class="hljs">${escaped}</code></pre>`
    }
  })

  // Custom image renderer to fix relative paths
  md.renderer.rules.image = (tokens, idx, options, _env, self) => {
    const token = tokens[idx]
    let src = token.attrGet('src') || ''
    if (basePath && src && !src.startsWith('http') && !src.startsWith('file://') && !src.startsWith('data:')) {
      src = `file:///${basePath.replace(/\\/g, '/')}/${src}`.replace(/\/+/g, '/')
      token.attrSet('src', src)
    }
    token.attrSet('loading', 'lazy')
    return self.renderToken(tokens, idx, options)
  }

  // Custom link renderer — open external links
  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens: any, idx: any, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href') || ''
    if (href.startsWith('http')) tokens[idx].attrSet('target', '_blank')
    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  md.use(anchor, {
    permalink: anchor.permalink.linkInsideHeader({ symbol: '#', placement: 'after' }),
    slugify: (s: string) =>
      s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  })
  md.use(taskLists, { enabled: true, label: true })
  md.use(footnote)
  md.use(attrs)
  md.use(container, 'info', { render: containerRender('info', '💡') })
  md.use(container, 'warning', { render: containerRender('warning', '⚠️') })
  md.use(container, 'danger', { render: containerRender('danger', '🔥') })
  md.use(container, 'tip', { render: containerRender('tip', '✅') })

  processMath(md)

  mdCache.set(key, md)
  return md
}

function containerRender(type: string, icon: string) {
  return (tokens: any[], idx: number) => {
    if (tokens[idx].nesting === 1) {
      return `<div class="container-block container-${type}"><div class="container-title">${icon} ${type.toUpperCase()}</div>\n`
    }
    return '</div>\n'
  }
}

// ── Main hook ────────────────────────────────────────────────────────────────
export function useMarkdown(content: string | null, filePath: string | null): MarkdownResult {
  return useMemo(() => {
    if (!content) return { html: '', toc: [], frontmatter: {} }

    const basePath = filePath
      ? filePath.replace(/\\/g, '/').split('/').slice(0, -1).join('/')
      : null

    const { data: frontmatter, body } = parseFrontmatter(content)
    const md = createMd(basePath)
    const tokens = md.parse(body, {})
    const toc = buildTOC(tokens)
    let html = md.render(body)
    html = processCallouts(html)

    return { html, toc, frontmatter }
  }, [content, filePath])
}
