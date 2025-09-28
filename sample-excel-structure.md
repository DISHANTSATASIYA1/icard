# Sample Excel File Structure

## Example Layout

Your Excel file can have Google Drive links in any column. Here's an example structure:

| Row | Column A | Column B | Column C |
|-----|----------|----------|----------|
| 1 | Image 1 | https://drive.google.com/file/d/1ABC123.../view | Description 1 |
| 2 | Image 2 | https://drive.google.com/file/d/2DEF456.../view | Description 2 |
| 3 | Image 3 | https://drive.google.com/file/d/3GHI789.../view | Description 3 |

## Supported URL Formats

The application recognizes these Google Drive URL patterns:

1. **File sharing links:**
   - `https://drive.google.com/file/d/FILE_ID/view`
   - `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`

2. **Open links:**
   - `https://drive.google.com/open?id=FILE_ID`

3. **Document links:**
   - `https://docs.google.com/document/d/FILE_ID/edit`
   - `https://docs.google.com/spreadsheets/d/FILE_ID/edit`
   - `https://docs.google.com/presentation/d/FILE_ID/edit`

## Important Notes

- **One link per row**: The app extracts the first valid Google Drive link found in each row
- **Any column**: Links can be in any column (A, B, C, etc.)
- **Multiple sheets**: The app will scan all sheets in your Excel file
- **Mixed content**: You can have other data in the same row as the links

## Creating Your Excel File

1. Open Excel or Google Sheets
2. Add your Google Drive links in any column
3. You can add additional information in other columns
4. Save as .xlsx or .xls format
5. Upload to the application

The application will automatically find and extract all valid Google Drive links!



