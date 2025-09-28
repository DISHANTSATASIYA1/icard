import * as XLSX from 'xlsx';

/**
 * Extracts Google Drive links from an Excel file
 * Searches through all cells in all sheets for Google Drive URLs
 */
export const extractDriveLinks = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const driveLinks: string[] = [];
        
        // Google Drive URL patterns
        const drivePatterns = [
          /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/g,
          /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/g,
          /https:\/\/docs\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/g,
          // Pattern for incomplete links with file ID at the end
          /https:\/\/drive\.google\.com\/u\/\d+\/open\?usp=forms_web&id=([a-zA-Z0-9_-]+)/g
        ];
        
        // Process each sheet
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
          
          // Go through each row
          for (let row = range.s.r; row <= range.e.r; row++) {
            let rowHasLink = false;
            
            // Check each column in the current row
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = sheet[cellAddress];
              
              if (cell && cell.v) {
                const cellValue = cell.v.toString();
                
                // Check each pattern
                drivePatterns.forEach(pattern => {
                  const matches = cellValue.match(pattern);
                  if (matches && !rowHasLink) {
                    // Extract the file ID and create a proper Google Drive link
                    const fileId = extractFileIdFromMatch(matches[0]);
                    if (fileId) {
                      const properLink = `https://drive.google.com/open?id=${fileId}`;
                      driveLinks.push(properLink);
                      rowHasLink = true;
                    }
                  }
                });
                
                // If we found a link in this row, move to next row
                if (rowHasLink) break;
              }
            }
          }
        });
        
        // Remove duplicates and filter valid links
        const uniqueLinks = [...new Set(driveLinks)]
          .filter(link => isValidDriveLink(link));
        
        resolve(uniqueLinks);
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Extracts file ID from a matched Google Drive URL
 */
const extractFileIdFromMatch = (url: string): string | null => {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Validates if a string is a valid Google Drive link
 */
const isValidDriveLink = (link: string): boolean => {
  const validPatterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
    /^https:\/\/drive\.google\.com\/open\?id=[a-zA-Z0-9_-]+/,
    /^https:\/\/docs\.google\.com\/.*\/d\/[a-zA-Z0-9_-]+/
  ];
  
  return validPatterns.some(pattern => pattern.test(link));
};

/**
 * Extracts the file ID from a Google Drive URL
 */
export const extractFileId = (driveUrl: string): string | null => {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = driveUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Converts a Google Drive link to a direct download URL
 */
export const convertToDirectDownloadUrl = (driveUrl: string): string => {
  const fileId = extractFileId(driveUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL: ' + driveUrl);
  }
  
  // Use the direct download format that bypasses some CORS issues
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};



