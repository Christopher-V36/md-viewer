"""Headless CLI wrapper for converting files to Markdown.

Routing:
    .pdf  -> pymupdf4llm (preserves headings, tables, bold/italic, lists)
    other -> MarkItDown (Microsoft's general-purpose converter)

Usage:
    markitdown_cli <input_path> <output_path>

Output (stdout):
    JSON: {"ok": true, "output": "<path>"} on success
    JSON: {"ok": false, "error": "<message>"} on failure

Compiled with PyInstaller to a standalone .exe and bundled inside the
MD Viewer Electron app as an extraResource.
"""
import sys
import json
import os
import re


# Detect "Capítulo 2", "Capitulo 2", "Chapter 2", "Anexo A" — counts as h1.
_CHAPTER_RE = re.compile(
    r"^(?:cap[ií]tulo|chapter|anexo|ap[eé]ndice|parte|unidad|tema)\s+[\divxlcm]+",
    re.IGNORECASE,
)
# Numbering at the start: "2.", "2.1", "2.1.3", "2.1.3.4 ..."
_NUM_RE = re.compile(r"^(\d+(?:\.\d+)*)\.?\s+\S")
# Lettered list items: "a)", "A.", "i)" — common subsection markers.
_LETTER_RE = re.compile(r"^[a-zA-Z]\s*[\)\.]\s+\S")
# A heading line emitted by pymupdf4llm, optionally with leading bold markers.
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


def _infer_level(text: str) -> int | None:
    """Return the desired heading level for `text`, or None to keep as-is.

    Tuned for academic/thesis-style PDFs whose headings follow numeric
    schemes like "2.4 ..." or "2.8.1 ...". Falls back to the original
    level when the text doesn't match any known pattern.
    """
    # Strip leading/trailing markdown emphasis markers (`*`, `_`) that
    # pymupdf4llm wraps headings with (e.g. `_**2.8.1 Foo**_`).
    stripped = re.sub(r"^[\*_]+|[\*_]+$", "", text).strip()
    if _CHAPTER_RE.match(stripped):
        return 1
    m = _NUM_RE.match(stripped)
    if m:
        depth = m.group(1).count(".") + 1
        return min(max(depth, 1), 6)
    if _LETTER_RE.match(stripped):
        return 3
    return None


def _restructure_pdf_headings(md: str) -> str:
    """pymupdf4llm emits every heading as `##`. Re-level by numbering scheme
    so the TOC sidebar can render the natural hierarchy."""
    out = []
    for line in md.splitlines():
        m = _HEADING_RE.match(line)
        if not m:
            out.append(line)
            continue
        body = m.group(2)
        new_level = _infer_level(body)
        if new_level is None:
            out.append(line)
        else:
            # Strip emphasis wrappers from the rendered heading too —
            # CSS handles heading weight, raw markdown emphasis is just noise.
            clean = re.sub(r"^[\*_]+|[\*_]+$", "", body).strip()
            out.append("#" * new_level + " " + clean)
    return "\n".join(out)


def convert_pdf(input_path: str) -> str:
    # Imported lazily so non-PDF conversions don't pay pymupdf's startup cost.
    import pymupdf4llm
    raw = pymupdf4llm.to_markdown(input_path)
    return _restructure_pdf_headings(raw)


def convert_other(input_path: str) -> str:
    from markitdown import MarkItDown
    return MarkItDown().convert(input_path).text_content


def main() -> None:
    if len(sys.argv) != 3:
        print(json.dumps({"ok": False, "error": "Usage: markitdown_cli <input> <output>"}))
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]
    ext = os.path.splitext(input_path)[1].lower()

    try:
        text = convert_pdf(input_path) if ext == ".pdf" else convert_other(input_path)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(json.dumps({"ok": True, "output": output_path}))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
