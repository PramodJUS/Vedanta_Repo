#!/usr/bin/env python3
"""Generate the portal's per-sutra personal notes from a structured Excel workbook."""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
PERSONAL_NOTES_KEY = "व्यक्तिगत-टिपाणी"

REQUIRED_HEADERS = (
    "Adhyaya",
    "Pada",
    "Sutra",
    "pada",
    "पादविषयः",
    "अधिकरणम्",
    "अधिकरणविषयः",
    "विषयवाक्यम्",
    "शास्त्रसङ्गतिः",
    "अध्यायसङ्गतिः",
    "पादसङ्गतिः",
    "अधिकरणसङ्गतिः",
    "श्रुतिसङ्गतिः",
    "विषयः",
    "संशयः",
    "पूर्वपक्षः",
    "सिद्धान्तः",
    "सूत्रम्",
    "पदच्छेदः",
    "अन्वयः",
    "सूत्रार्थः",
)

FILL_DOWN_HEADERS = (
    "Adhyaya",
    "Pada",
    "pada",
    "पादविषयः",
    "अधिकरणम्",
    "अधिकरणविषयः",
)

PAGE_FIELDS = (
    ("pada", "personal-note-pada"),
    ("पादविषयः", "personal-note-pada-topic"),
)

SUTRA_DETAIL_FIELDS = (
    ("पदच्छेदः", "पदच्छेदः"),
    ("अन्वयः", "अन्वयः"),
    ("सूत्रार्थः", "सूत्रार्थः"),
)


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def _plain_text(value: str) -> str:
    parser = _TextExtractor()
    parser.feed(value)
    return " ".join(" ".join(parser.parts).split())


def _display_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def _id_component(value: Any, column_name: str, row_number: int) -> str:
    text = _display_value(value)
    if not text:
        raise ValueError(f"Missing {column_name} value on worksheet row {row_number}")
    try:
        number = float(text)
    except ValueError as error:
        raise ValueError(
            f"Invalid {column_name} value {text!r} on worksheet row {row_number}"
        ) from error
    if not number.is_integer():
        raise ValueError(
            f"{column_name} must be a whole number on worksheet row {row_number}: {text!r}"
        )
    return str(int(number))


def _normalize_header(value: Any) -> str:
    return str(value or "").strip().lstrip("\ufeff")


def _find_header_row(workbook: Any) -> tuple[Any, int, dict[str, int]]:
    for worksheet in workbook.worksheets:
        for row_number, row in enumerate(
            worksheet.iter_rows(min_row=1, max_row=30, values_only=True),
            start=1,
        ):
            headers: dict[str, int] = {}
            for column_index, value in enumerate(row):
                header = _normalize_header(value)
                if header:
                    if header in headers:
                        raise ValueError(
                            f"Duplicate column header {header!r} on worksheet "
                            f"{worksheet.title!r}"
                        )
                    headers[header] = column_index
            if all(header in headers for header in REQUIRED_HEADERS):
                return worksheet, row_number, headers

    expected = ", ".join(REQUIRED_HEADERS)
    raise ValueError(
        "No worksheet contains the required personal-notes columns. "
        f"Expected: {expected}"
    )


def _safe_text(value: Any) -> str:
    text = _display_value(value)
    if not text:
        return ""
    return _escape_text(text)


def _escape_text(text: str) -> str:
    safe_text = html.escape(text, quote=True).replace("\r\n", "\n").replace("\r", "\n")
    return safe_text.replace("\n", "<br>")


def _text_terms(value: Any) -> list[str]:
    terms = []
    for token in re.split(r"\s+", _display_value(value)):
        term = token.strip("।॥,;:.!?()[]{}<>–—-")
        if term and not any(character.isdigit() for character in term) and term not in terms:
            terms.append(term)
    return terms


def _is_sanskrit_word_character(character: str) -> bool:
    return unicodedata.category(character)[0] in {"L", "M", "N"}


def _highlight_html_terms(markup: str, terms: list[str]) -> str:
    segments = re.split(r"(<[^>]+>)", markup)
    for index in range(0, len(segments), 2):
        text = segments[index]
        matches: list[tuple[int, int]] = []
        for term in sorted(set(terms), key=len, reverse=True):
            escaped_term = html.escape(term, quote=True)
            start = 0
            while True:
                start = text.find(escaped_term, start)
                if start < 0:
                    break
                end = start + len(escaped_term)
                left_is_word = (
                    start > 0 and _is_sanskrit_word_character(text[start - 1])
                )
                right_is_word = (
                    end < len(text) and _is_sanskrit_word_character(text[end])
                )
                if not left_is_word and not right_is_word:
                    matches.append((start, end))
                start = end

        if not matches:
            continue
        matches.sort(key=lambda item: (item[0], -(item[1] - item[0])))
        rendered: list[str] = []
        position = 0
        for start, end in matches:
            if start < position:
                continue
            rendered.append(text[position:start])
            rendered.append(
                f'<span style="color:#ff0000">{text[start:end]}</span>'
            )
            position = end
        rendered.append(text[position:])
        segments[index] = "".join(rendered)

    return "".join(segments)


def _paragraph(
    value: Any,
    class_name: str,
) -> str | None:
    safe_text = _safe_text(value)
    if not safe_text:
        return None
    return f'<p class="{class_name}">{safe_text}</p>'


def _styled_paragraph(value: Any, class_name: str, style: str) -> str | None:
    safe_text = _safe_text(value)
    if not safe_text:
        return None
    return f'<p class="{class_name}" style="{style}">{safe_text}</p>'


def _adhikarana_title(row: dict[str, Any]) -> str:
    return _display_value(row.get("अधिकरणम्"))


def _render_note(
    row: dict[str, Any],
) -> str:
    blocks: list[str] = []
    for header, class_name in PAGE_FIELDS:
        value = _display_value(row.get(header))
        if header == "पादविषयः" and value and not value.startswith("।।"):
            value = f"।। {value} ।।"
        paragraph = (
            _styled_paragraph(
                value,
                class_name,
                "text-align:center;color:#0000ff",
            )
            if header == "pada"
            else _paragraph(value, class_name)
        )
        if paragraph:
            blocks.append(paragraph)

    sutra = _styled_paragraph(
        row.get("सूत्रम्"),
        "personal-note-sutra",
        "text-align:center;color:#ff0000",
    )
    if sutra:
        blocks.append(sutra)

    for label, header in SUTRA_DETAIL_FIELDS:
        value = _paragraph(row.get(header), "personal-note-detail-content")
        if value and label == "सूत्रार्थः":
            value = _highlight_html_terms(value, _text_terms(row.get("अन्वयः")))
        if value:
            heading = (
                _styled_paragraph(
                    label,
                    "personal-note-detail-heading",
                    "text-align:left;color:#000000",
                )
                if label == "सूत्रार्थः"
                else f'<p class="personal-note-detail-heading">'
                f"{html.escape(label)}</p>"
            )
            if heading:
                blocks.append(heading)
            blocks.append(value)

    return '<div class="personal-note-document">' + "".join(blocks) + "</div>"


def _load_legacy_notes(path: Path | None) -> dict[str, dict[str, Any]]:
    if path is None or not path.exists():
        return {}
    with path.open(encoding="utf-8-sig") as file:
        data = json.load(file)
    if not isinstance(data, dict):
        raise ValueError(f"Legacy sutra data must be a JSON object: {path}")

    notes: dict[str, dict[str, Any]] = {}
    for sutra_id, sutra in data.items():
        if not isinstance(sutra, dict):
            continue
        note = sutra.get(PERSONAL_NOTES_KEY)
        if isinstance(note, str):
            note = {"moola": note}
        if isinstance(note, dict):
            notes[sutra_id] = note
    return notes


def build_personal_notes(
    workbook_path: Path,
    legacy_json_path: Path | None = None,
) -> dict[str, dict[str, Any]]:
    workbook = load_workbook(workbook_path, data_only=True, read_only=True)
    try:
        worksheet, header_row, headers = _find_header_row(workbook)
        notes: dict[str, dict[str, Any]] = {}
        adhikarana_titles: dict[str, str] = {}
        previous_values: dict[str, str] = {}

        for row_number, values in enumerate(
            worksheet.iter_rows(min_row=header_row + 1, values_only=True),
            start=header_row + 1,
        ):
            row = {
                header: values[column_index] if column_index < len(values) else None
                for header, column_index in headers.items()
            }
            if not _display_value(row.get("Sutra")):
                continue

            for header in FILL_DOWN_HEADERS:
                value = _display_value(row.get(header))
                if value:
                    previous_values[header] = value
                elif header in previous_values:
                    row[header] = previous_values[header]

            components = (
                _id_component(row.get("Adhyaya"), "Adhyaya", row_number),
                _id_component(row.get("Pada"), "Pada", row_number),
                _id_component(row.get("Sutra"), "Sutra", row_number),
            )
            sutra_id = ".".join(components)
            if sutra_id in notes:
                raise ValueError(f"Duplicate sutra ID {sutra_id} in worksheet")
            notes[sutra_id] = {"moola": _render_note(row)}
            adhikarana_titles[sutra_id] = _adhikarana_title(row)
    finally:
        workbook.close()

    if not notes:
        raise ValueError("The workbook contains no sutra data rows")

    legacy_notes = _load_legacy_notes(legacy_json_path)
    for sutra_id, note in notes.items():
        existing = legacy_notes.get(sutra_id)
        if not existing:
            continue
        existing_content = existing.get("moola")
        if not isinstance(existing_content, str) or not existing_content.strip():
            continue

        generated = note["moola"]
        if _plain_text(existing_content) != f"अधिकरणम् - {adhikarana_titles[sutra_id]}":
            note["moola"] = generated + "<hr>" + existing_content
        note.update({key: value for key, value in existing.items() if key != "moola"})

    return notes


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build sutra/personal-notes.json from an Excel workbook; no DOCX is needed."
    )
    parser.add_argument("workbook", type=Path, help="Excel workbook with the documented column headers")
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "sutra" / "personal-notes.json",
        help="Output JSON path (default: sutra/personal-notes.json)",
    )
    parser.add_argument(
        "--legacy-json",
        type=Path,
        default=ROOT / "sutra" / "sutra-details.json",
        help="Existing sutra JSON used to preserve any matching personal notes",
    )
    args = parser.parse_args()

    notes = build_personal_notes(args.workbook, args.legacy_json)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary_output = args.output.with_suffix(args.output.suffix + ".tmp")
    temporary_output.write_text(
        json.dumps(notes, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary_output.replace(args.output)
    print(f"Wrote {len(notes)} sutra notes to {args.output}")


if __name__ == "__main__":
    main()
