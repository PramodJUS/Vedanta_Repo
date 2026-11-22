from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook

from excel_to_personal_notes import REQUIRED_HEADERS, build_personal_notes


class ExcelToPersonalNotesTests(unittest.TestCase):
    def _write_workbook(self, path: Path, rows: list[list[object]]) -> None:
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.append(list(REQUIRED_HEADERS))
        for row in rows:
            worksheet.append(row)
        workbook.save(path)

    def _row(self, sutra_number: int, **overrides: object) -> list[object]:
        values: dict[str, object] = {header: None for header in REQUIRED_HEADERS}
        values.update(
            {
                "Adhyaya": 1,
                "Pada": 1,
                "Sutra": sutra_number,
                "pada": "प्रथमाध्याये प्रथमः पादः",
                "पादविषयः": "पादविषयः",
                "अधिकरणम्": "जिज्ञासाधिकरणम्",
                "अधिकरणविषयः": "अधिकरणविषयः",
                "विषयवाक्यम्": "श्रुतिः",
                "विषयः": "विषयः",
                "संशयः": "संशयः",
                "पूर्वपक्षः": "पूर्वपक्षः",
                "सिद्धान्तः": "सिद्धान्तः",
                "सूत्रम्": "सूत्रम्",
                "पदच्छेदः": "पदच्छेदः",
                "अन्वयः": "अन्वयः",
                "सूत्रार्थः": "सूत्रार्थः",
            }
        )
        values.update(overrides)
        return [values[header] for header in REQUIRED_HEADERS]

    def test_builds_notes_and_preserves_matching_legacy_note(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            legacy_path = Path(directory) / "sutra-details.json"
            self._write_workbook(workbook_path, [self._row(1)])
            legacy_path.write_text(
                '{"1.1.1":{"व्यक्तिगत-टिपाणी":{"moola":'
                '"<p style=\\"text-align: center;\\">अधिकरणम् - जिज्ञासाधिकरणम्</p>"}}}',
                encoding="utf-8",
            )

            notes = build_personal_notes(workbook_path, legacy_path)

            self.assertIn("1.1.1", notes)
            content = notes["1.1.1"]["moola"]
            self.assertTrue(content.startswith('<div class="personal-note-document">'))
            self.assertIn(
                'class="personal-note-section-title" '
                'style="text-align:center;color:#0000ff">सङ्गतिः',
                content,
            )
            self.assertIn(
                'class="personal-note-detail-heading" '
                'style="text-align:left;color:#000000">सूत्रार्थः',
                content,
            )
            self.assertEqual(content.count("जिज्ञासाधिकरणम्"), 1)
            self.assertNotIn("अधिकरणम् - जिज्ञासाधिकरणम्", content)

    def test_fills_down_adhikarana_context_and_escapes_excel_text(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            first = self._row(1, **{"सूत्रार्थः": "x < y & z"})
            second = self._row(
                2,
                **{
                    "Adhyaya": None,
                    "Pada": None,
                    "pada": None,
                    "पादविषयः": None,
                    "अधिकरणम्": None,
                    "अधिकरणविषयः": None,
                    "सूत्रार्थः": "अर्थः",
                },
            )
            self._write_workbook(workbook_path, [first, second])

            notes = build_personal_notes(workbook_path, None)

            self.assertIn("जिज्ञासाधिकरणम्", notes["1.1.2"]["moola"])
            self.assertIn("x &lt; y &amp; z", notes["1.1.1"]["moola"])

    def test_rejects_duplicate_sutra_ids(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            self._write_workbook(workbook_path, [self._row(1), self._row(1)])

            with self.assertRaisesRegex(ValueError, "Duplicate sutra ID 1.1.1"):
                build_personal_notes(workbook_path, None)

    def test_formats_adhikarana_sequence_separately(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            row = self._row(1, **{"अधिकरणम्": "जन्माधिकरणम् – 2 (1)"})
            self._write_workbook(workbook_path, [row])

            note = build_personal_notes(workbook_path, None)["1.1.1"]["moola"]

            self.assertIn('class="personal-note-adhikarana-name">जन्माधिकरणम्', note)
            self.assertIn('class="personal-note-adhikarana-index"> – 2 (1)', note)

    def test_colors_anvaya_terms_only_in_sutra_artha(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            row = self._row(
                3,
                **{
                    "सूत्रम्": "ओम् शास्त्रयोनित्वात् ओम् – 1.3",
                    "अन्वयः": "सं अन्वयात् सं अन्वयात् तत् शास्त्रयोनि तु",
                    "सूत्रार्थः": (
                        "सं अन्वयात् सं अन्वयात् तत् शास्त्रयोनि तु "
                        "शास्त्रयोनित्वात्"
                    ),
                },
            )
            self._write_workbook(workbook_path, [row])

            note = build_personal_notes(workbook_path, None)["1.1.3"]["moola"]

            for term in ("सं", "अन्वयात्", "तत्", "शास्त्रयोनि", "तु"):
                self.assertIn(
                    f'<span style="color:#ff0000">{term}</span>',
                    note,
                )
            self.assertEqual(
                note.count('<span style="color:#ff0000">अन्वयात्</span>'),
                2,
            )
            self.assertIn("शास्त्रयोनित्वात्</p>", note)
            self.assertNotIn(
                '<span style="color:#ff0000">शास्त्रयोनित्वात्</span>',
                note,
            )

    def test_embeds_requested_color_and_center_styles(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            self._write_workbook(workbook_path, [self._row(1)])

            note = build_personal_notes(workbook_path, None)["1.1.1"]["moola"]

            self.assertIn(
                'class="personal-note-pada" style="text-align:center;color:#0000ff"',
                note,
            )
            self.assertIn(
                'class="personal-note-adhikarana-title" '
                'style="text-align:center;color:#0000ff"',
                note,
            )
            self.assertIn(
                'class="personal-note-section-title" '
                'style="text-align:center;color:#0000ff">सङ्गतिः',
                note,
            )
            self.assertIn(
                'class="personal-note-section-title" '
                'style="text-align:center;color:#0000ff">अधिकरणशरीरम्',
                note,
            )
            self.assertIn(
                'class="personal-note-sutra" '
                'style="text-align:center;color:#ff0000"',
                note,
            )
            self.assertIn(
                'class="personal-note-detail-heading" '
                'style="text-align:left;color:#000000">सूत्रार्थः',
                note,
            )
            self.assertIn(
                '<p class="personal-note-detail-content">अन्वयः</p>',
                note,
            )
            self.assertIn(
                '<p class="personal-note-detail-content">सूत्रार्थः</p>',
                note,
            )

    def test_colors_kartavya_when_present_in_anvaya(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            workbook_path = Path(directory) / "source.xlsx"
            self._write_workbook(
                workbook_path,
                [
                    self._row(
                        1,
                        **{
                            "अन्वयः": "अथ अतः ब्रह्मजिज्ञासा कर्तव्या",
                            "सूत्रार्थः": "कर्तव्या",
                        },
                    )
                ],
            )

            note = build_personal_notes(workbook_path, None)["1.1.1"]["moola"]

            self.assertIn(
                '<span style="color:#ff0000">कर्तव्या</span>',
                note,
            )


if __name__ == "__main__":
    unittest.main()
