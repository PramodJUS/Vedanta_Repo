# Brahma Sutra personal-notes conversion guide

Use the Excel workbook as the source for each new pada or adhyaya. The converter
creates `sutra/personal-notes.json`; it does not require a DOCX.

## Prepare the workbook

Use one row per sutra and include these headers:

```text
Adhyaya, Pada, Sutra, pada, पादविषयः, अधिकरणम्, अधिकरणविषयः, विषयवाक्यम्,
शास्त्रसङ्गतिः, अध्यायसङ्गतिः, पादसङ्गतिः, अधिकरणसङ्गतिः, श्रुतिसङ्गतिः,
विषयः, संशयः, पूर्वपक्षः, सिद्धान्तः, सूत्रम्, पदच्छेदः, अन्वयः, सूत्रार्थः
```

`Adhyaya`, `Pada`, and `Sutra` form the JSON key, such as `1.1.1`. Context
columns may be left blank on following rows in the same section; the converter
fills down `Adhyaya`, `Pada`, `pada`, `पादविषयः`, `अधिकरणम्`, and
`अधिकरणविषयः`.

For incremental work, include all previously converted rows as well as the new
pada or adhyaya in the workbook before regenerating. The output is generated
from the workbook provided and does not automatically merge entries from an
earlier `personal-notes.json`.

## Generate the JSON

Install the Excel dependency once:

```powershell
python -m pip install -r dataimport/requirements-excel.txt
```

Then run:

```powershell
python dataimport/excel_to_personal_notes.py "C:\path\to\cumulative-workbook.xlsx"
```

The generated HTML is stored in each sutra's `व्यक्तिगत-टिपाणी.moola` field.
The output includes inline HTML styles so the color and alignment choices are
visible in the JSON itself:

- Blue and centered: pada heading, adhikaraṇa title, `सङ्गतिः`, and
  `अधिकरणशरीरम्`.
- Red and centered: the sutra line.
- Black and left-aligned: the `सूत्रार्थः` heading.
- `सूत्रार्थः` uses the same paragraph formatting as `अन्वयः`.
- Red inline spans: every whole word in `सूत्रार्थः` that also appears in that
  row's `अन्वयः`. For example, if `अन्वयः` is
  `सं अन्वयात् सं अन्वयात् तत् शास्त्रयोनि तु`, each of those words is red
  wherever it appears as a whole word in `सूत्रार्थः`. `कर्तव्या` in sutra
  `1.1.1` is red because it appears in that row's `अन्वयः`.

## Add a one-off formatting exception

Edit the relevant `moola` HTML in `sutra/personal-notes.json`. Use inline styles
so the exception stays explicit in the data:

```html
<p style="text-align:center;color:#0000ff">Centered blue heading</p>
<p style="text-align:center;color:#ff0000">Red sutra line</p>
<span style="color:#ff0000">Red word</span>
```

Keep the JSON valid when editing HTML attributes. Regenerating from Excel replaces
the generated content, so reapply manual exceptions afterward or encode them in
the converter's template.

## Verify

```powershell
python -m unittest discover -s dataimport -p "test_excel_to_personal_notes.py" -v
```

Open the portal through the local web server and check a representative sutra's
personal-notes popup after generating the file.
