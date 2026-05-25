# MD Viewer

A desktop application for viewing, converting, and presenting Markdown documents. Built with Electron, React, and TypeScript.

## Features

### Document Viewing
- **Markdown rendering** with full GFM support (tables, task lists, footnotes, strikethrough).
- **Syntax highlighting** for 190+ languages via highlight.js.
- **Math rendering** with KaTeX (inline `$...$` and block `$$...$$`).
- **Mermaid diagrams** rendered inline.
- **Callouts/admonitions** (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, etc.).
- **YAML frontmatter** parsed and displayed in the sidebar.
- **CSV files** rendered as formatted HTML tables.
- **Plain text files** displayed with preserved whitespace.

### File Conversion
- Convert **PDF, DOCX, XLSX, PPTX, HTML, JSON, XML, images, audio, and ZIP** files to Markdown.
- Powered by a bundled Python CLI that uses [MarkItDown](https://github.com/microsoft/markitdown) (Microsoft) and [pymupdf4llm](https://github.com/pymupdf/RAG) (for PDFs with heading hierarchy preservation).
- Configurable output directory for converted files.
- Cancellable conversions with progress indicator.

### Multi-Tab Interface
- Open multiple documents simultaneously in tabs.
- **Drag-and-drop tab reordering**.
- **Dirty indicator** (pulsing dot) when a file changes on disk while another tab is active.
- **Real-time file watching** — tabs update automatically when the underlying file is modified externally.
- Close tabs individually or navigate home without losing open tabs.

### Navigation & Search
- **Table of Contents sidebar** auto-generated from document headings, with active heading tracking on scroll.
- **In-document search** (`Ctrl+F`) with match highlighting, counter, and keyboard navigation (`Enter` / `Shift+Enter`).
- **Global search across all open tabs** (`Ctrl+Shift+F`) with grouped results by file and line numbers.

### Split View & Presentation
- **Split view** for comparing two documents side by side. The document picker shows open tabs first, then recent files.
- **Presentation mode** that splits Markdown into slides (by `---` horizontal rules or `##` headings) with keyboard navigation, progress bar, and fullscreen overlay.

### Recent Files Panel
- Persistent **right sidebar** showing recently opened files with color-coded file type icons.
- Opens by default on app launch; toggle state is saved to settings.
- Click any recent file to open it instantly.

### Customization
- **Light, dark, and system themes** with smooth transitions.
- **Resizable TOC sidebar** (drag the edge to adjust width).
- **Zoom controls** (`Ctrl+=` / `Ctrl+-` / `Ctrl+0`).
- **PDF export** via the File menu.
- **Keyboard shortcuts** for all major actions.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file |
| `Ctrl+F` | Search in document |
| `Ctrl+Shift+F` | Search across all tabs |
| `Ctrl+\` | Toggle TOC sidebar |
| `Ctrl+P` | Print |
| `Ctrl+W` | Close current tab |
| `Ctrl+=` / `Ctrl+-` | Zoom in / out |
| `Ctrl+0` | Reset zoom |
| `Esc` | Exit presentation / close panels |

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) (included with Node.js)
- **Windows 10/11** (the converter binary is Windows-only; the viewer itself works cross-platform)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/christopheraguilar/md-viewer.git
cd md-viewer

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run dev
```

### Building the Converter (Optional)

The file converter (PDF, DOCX, etc. to Markdown) requires a Python CLI that must be compiled separately. Without it, the app still works for viewing `.md`, `.txt`, and `.csv` files.

```powershell
# Requires Python 3.9+ on PATH
cd python-converter
pip install -r requirements.txt
.\build.ps1
```

This compiles `markitdown_cli.py` into a standalone directory bundle at `resources/bin/markitdown_cli/` using PyInstaller.

### Building for Distribution

```bash
# Build the Electron app (production bundle)
npm run build

# Package as an installer (.exe)
npm run dist

# Package without installer (portable directory)
npm run pack
```

The installer will be generated in the `dist/` folder.

## Project Structure

```
md-viewer/
  src/
    main/           # Electron main process
      index.ts      # Window creation, lifecycle
      ipc.ts        # IPC handlers (file I/O, conversion, watch)
      store.ts      # Persistent settings (JSON in userData)
      menu.ts       # Native menu bar
    preload/
      index.ts      # Context bridge (main <-> renderer)
    renderer/
      src/
        App.tsx              # Root component, state management
        components/          # UI components
          Toolbar.tsx        # Top toolbar with actions
          Sidebar.tsx        # Resizable TOC + frontmatter panel
          TabBar.tsx         # Draggable tab bar
          MarkdownView.tsx   # Markdown renderer with search
          RecentsPanel.tsx   # Right sidebar with recent files
          SplitView.tsx      # Side-by-side document comparison
          PresentationMode.tsx  # Slide presentation overlay
          WelcomeScreen.tsx  # Home screen
          SearchPanel.tsx    # In-document search bar
          GlobalSearchPanel.tsx  # Cross-tab search
          SettingsPanel.tsx  # Theme & settings panel
          ConversionOverlay.tsx  # Conversion progress modal
        hooks/
          useMarkdown.ts     # Markdown-it processing pipeline
          useTheme.ts        # Theme management
        styles/
          main.css           # App layout & component styles
          markdown.css       # Rendered markdown styling
  python-converter/          # MarkItDown CLI source
    markitdown_cli.py        # Converter entry point
    build.ps1                # PyInstaller build script
    requirements.txt         # Python dependencies
  electron-builder.yml       # Electron Builder config
  electron.vite.config.ts    # Vite config for Electron
```

## Tech Stack

- **Electron** v35 — desktop app shell
- **React** v19 — UI framework
- **TypeScript** — type safety
- **Vite** (via electron-vite) — fast builds and HMR
- **Tailwind CSS** v4 — utility styles
- **markdown-it** — Markdown parsing with plugins (anchor, task lists, footnotes, attrs, containers)
- **highlight.js** — syntax highlighting
- **KaTeX** — math rendering
- **Mermaid** — diagram rendering
- **MarkItDown** (Python) — file conversion (Microsoft)
- **pymupdf4llm** (Python) — PDF to Markdown with structure

## Known Issues

- The file converter is currently **Windows-only**. On macOS/Linux, conversion features will be unavailable, but document viewing works normally.
- Some complex PDF layouts may not convert perfectly — headings, tables, and images are best-effort.
- Very large Mermaid diagrams may take a few seconds to render.
- The app has been primarily tested on Windows 11. Minor visual inconsistencies may occur on other platforms.

## License

ISC
