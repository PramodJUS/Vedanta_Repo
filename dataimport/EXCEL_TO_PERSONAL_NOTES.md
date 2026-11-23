# Excel personal notes

Generate the portal's separate personal-notes data file from an Excel workbook:

```powershell
python -m pip install -r dataimport/requirements-excel.txt
python dataimport/excel_to_personal_notes.py "C:\path\to\workbook.xlsx"
```

The workbook must contain the column headers used by `1st pada.xlsx`. The converter
uses those columns and its built-in template to create `sutra/personal-notes.json`;
it does not read or require a DOCX. Rows may cover any adhyaya, pada, and sutra.
Existing personal notes in `sutra/sutra-details.json` are preserved when a
matching sutra is present in the workbook.

The generated JSON includes inline HTML styles for centered blue headings and
the red sutra line. The `सूत्रार्थः` heading is black and left-aligned, and its
content uses the same paragraph formatting as `अन्वयः`. Whole words in
`सूत्रार्थः` that also appear in that row's `अन्वयः` are shown in red.

The Excel workbook is the source of truth for generated note content. After
editing notes in the admin panel, download `personal-notes.json` to save those
changes. If the workbook is regenerated later, update the workbook first so
those changes are retained.

See [personal_note_convert.md](./personal_note_convert.md) for the repeatable
workflow and how to add one-off color or alignment exceptions in the JSON.
