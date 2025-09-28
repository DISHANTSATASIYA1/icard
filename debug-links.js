const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('1.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

console.log('=== DETAILED LINK ANALYSIS ===');
console.log(`Total range: ${sheet['!ref']}`);
console.log(`Total rows: ${range.e.r - range.s.r + 1} (including header)`);
console.log(`Data rows: ${range.e.r - range.s.r} (excluding header)`);

// Find the passport photo column
let passportPhotoCol = -1;
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
  const cell = sheet[cellAddress];
  if (cell && cell.v) {
    const headerValue = cell.v.toString().toUpperCase();
    if (headerValue.includes('PASSPORT') && headerValue.includes('PHOTO')) {
      passportPhotoCol = col;
      console.log(`Found PASSPORT PHOTO column: ${XLSX.utils.encode_col(col)}`);
      break;
    }
  }
}

if (passportPhotoCol === -1) {
  console.log('PASSPORT SIZE PHOTO column not found!');
  process.exit(1);
}

// Enhanced patterns
const drivePatterns = [
  /https:\/\/drive\.google\.com\/[^\s]*/g,
  /https:\/\/docs\.google\.com\/[^\s]*/g
];

console.log('\n=== ROW BY ROW ANALYSIS ===');
let totalLinksFound = 0;
let rowsWithLinks = 0;
let rowsWithMultipleLinks = 0;
const allLinks = [];
const duplicateLinks = new Set();

// Check each row (starting from row 2, skipping header)
for (let row = range.s.r + 1; row <= range.e.r; row++) {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: passportPhotoCol });
  const cell = sheet[cellAddress];
  
  if (cell) {
    let cellValue = '';
    if (cell.v !== undefined) {
      cellValue = cell.v.toString();
    } else if (cell.w !== undefined) {
      cellValue = cell.w.toString();
    } else if (cell.h !== undefined) {
      cellValue = cell.h.toString();
    }
    
    if (cell.l && cell.l.Target) {
      cellValue += ' ' + cell.l.Target;
    }
    
    if (cellValue.trim()) {
      let linksInThisRow = [];
      
      drivePatterns.forEach(pattern => {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(cellValue)) !== null) {
          const link = match[0];
          linksInThisRow.push(link);
          allLinks.push(link);
          totalLinksFound++;
          
          if (!pattern.global) break;
        }
      });
      
      if (linksInThisRow.length > 0) {
        rowsWithLinks++;
        if (linksInThisRow.length > 1) {
          rowsWithMultipleLinks++;
          console.log(`Row ${row + 1}: ${linksInThisRow.length} links found`);
          linksInThisRow.forEach((link, index) => {
            console.log(`  ${index + 1}. ${link.substring(0, 60)}...`);
          });
        }
      }
    }
  }
}

// Check for duplicates
const uniqueLinks = [...new Set(allLinks)];
const duplicateCount = allLinks.length - uniqueLinks.length;

console.log('\n=== FINAL SUMMARY ===');
console.log(`Total data rows: ${range.e.r - range.s.r}`);
console.log(`Rows with links: ${rowsWithLinks}`);
console.log(`Rows with multiple links: ${rowsWithMultipleLinks}`);
console.log(`Total links found: ${totalLinksFound}`);
console.log(`Unique links: ${uniqueLinks.length}`);
console.log(`Duplicate links: ${duplicateCount}`);

if (duplicateCount > 0) {
  console.log('\nSample duplicate analysis:');
  const linkCounts = {};
  allLinks.forEach(link => {
    linkCounts[link] = (linkCounts[link] || 0) + 1;
  });
  
  let duplicateFound = 0;
  for (const [link, count] of Object.entries(linkCounts)) {
    if (count > 1 && duplicateFound < 5) {
      console.log(`"${link.substring(0, 50)}..." appears ${count} times`);
      duplicateFound++;
    }
  }
}
