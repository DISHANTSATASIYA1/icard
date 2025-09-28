# Google Drive Link Extractor & Downloader

A Next.js application that extracts Google Drive links from Excel files and downloads images with automatic renaming.

## Features

- **Excel Upload**: Upload .xlsx or .xls files with Google Drive links
- **Link Extraction**: Automatically extract all Google Drive links row by row
- **Smart Renaming**: Rename downloaded files with custom start/end naming patterns
- **Batch Download**: Download all files as a ZIP archive
- **CORS Handling**: Built-in proxy to handle Google Drive CORS restrictions

## How to Use

### 1. Prepare Your Excel File
Create an Excel file with Google Drive links in any column. The application will scan all cells and extract links row by row.

**Supported Google Drive URL formats:**
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- `https://docs.google.com/document/d/FILE_ID/`

### 2. Upload and Extract
1. Drag and drop your Excel file or click to browse
2. The app will automatically extract all Google Drive links
3. Links will be displayed in the middle column

### 3. Set File Names
1. Enter **Start Name** (e.g., `photo1`)
2. Enter **End Name** (e.g., `photo10`)
3. Only the number part will change in the final file names
4. The count must match the number of extracted links

### 4. Download
1. Click the Download button
2. Files will be downloaded as a ZIP archive
3. Each file will be renamed according to your pattern

## Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Technical Details

### Architecture
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **File Processing**: xlsx library for Excel parsing
- **Downloads**: file-saver and jszip for batch downloading
- **CORS Handling**: Custom API proxy route

### File Structure
```
src/
├── app/
│   ├── api/download/route.ts    # CORS proxy for Google Drive
│   └── page.tsx                 # Main application page
├── components/
│   ├── FileUploadSection.tsx    # Excel file upload
│   ├── DriveLinksSection.tsx    # Display extracted links
│   └── DownloadSection.tsx      # Download configuration
└── services/
    ├── excelService.ts          # Excel parsing and link extraction
    └── downloadService.ts       # File downloading and renaming
```

### Key Features
- **Row-by-row extraction**: Finds the first Google Drive link in each row
- **Multiple URL patterns**: Supports various Google Drive URL formats
- **CORS proxy**: Server-side proxy to bypass browser CORS restrictions
- **Error handling**: Comprehensive error handling and user feedback
- **Responsive design**: Works on desktop and mobile devices

## Troubleshooting

### Common Issues
1. **CORS Errors**: The app includes a built-in proxy to handle CORS issues
2. **Large Files**: Downloads are processed in batches to avoid browser limits
3. **Invalid Links**: Only valid Google Drive links are processed
4. **Popup Blockers**: Disable popup blockers for download functionality

### Excel File Requirements
- Supported formats: .xlsx, .xls
- Google Drive links can be in any column
- One link per row is recommended
- Empty cells are ignored

## License

MIT License - feel free to use for personal or commercial projects.