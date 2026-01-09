# Vedanta Database CSV Export

Generated: 2026-01-09T15:05:26.956Z

## Files

| # | Table | Rows | File |
|---|-------|------|------|
| 1 | authors | 12 | authors.csv |
| 2 | adhikaranas | 223 | adhikaranas.csv |
| 3 | sutras | 562 | sutras.csv |
| 4 | commentaries | 6193 | commentaries.csv |
| 5 | adhikarana_details | 1328 | adhikarana_details.csv |
| 6 | commentary_translations | 1129 | commentary_translations.csv |
| 7 | commentaries_author_lnk | 6193 | commentaries_author_lnk.csv |
| 8 | commentaries_sutra_lnk | 6193 | commentaries_sutra_lnk.csv |
| 9 | commentary_translations_commentary_lnk | 1129 | commentary_translations_commentary_lnk.csv |

## Import Order (MSSQL)

**IMPORTANT:** Import in this exact order to respect foreign key constraints:

```sql
-- 1. Run vedanta-mssql-schema.sql first to create tables

-- 2. Import data in this order:
-- 1. authors.csv
-- 2. adhikaranas.csv
-- 3. sutras.csv
-- 4. commentaries.csv
-- 5. adhikarana_details.csv
-- 6. commentary_translations.csv
-- 7. commentaries_author_lnk.csv
-- 8. commentaries_sutra_lnk.csv
-- 9. sutras_adhikarana_lnk.csv
-- 10. commentary_translations_commentary_lnk.csv
```

## MSSQL Bulk Insert Example

```sql
BULK INSERT authors
FROM 'C:\\path\\to\\authors.csv'
WITH (
  FIELDTERMINATOR = ',',
  ROWTERMINATOR = '\n',
  FIRSTROW = 2,  -- Skip header
  TABLOCK
);
```
