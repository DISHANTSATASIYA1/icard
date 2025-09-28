import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { convertToDirectDownloadUrl } from './excelService';

/**
 * Downloads files from Google Drive links and renames them according to the pattern
 */
export const downloadFilesWithRename = async (
  driveLinks: string[],
  startName: string,
  endName: string,
  onProgress?: (status: string) => void
): Promise<void> => {
  if (driveLinks.length === 0) {
    throw new Error('No drive links provided');
  }

  // Extract base name and numbers - support both "photo1" and "1" formats
  let startMatch, endMatch;
  
  // Check if pure numbers first
  if (/^\d+$/.test(startName)) {
    startMatch = ['', '', startName]; // [full, base, number] - empty base for pure numbers
  } else {
    startMatch = startName.match(/^(.+?)(\d+)$/);
  }
  
  if (/^\d+$/.test(endName)) {
    endMatch = ['', '', endName];
  } else {
    endMatch = endName.match(/^(.+?)(\d+)$/);
  }

  if (!startMatch || !endMatch) {
    throw new Error('Invalid name format. Names must end with numbers.');
  }

  const baseName = startMatch[1];
  const startNum = parseInt(startMatch[2]);
  const endNum = parseInt(endMatch[2]);

  if (baseName !== endMatch[1]) {
    throw new Error('Base names must be the same');
  }

  if (startNum >= endNum) {
    throw new Error('End number must be greater than start number');
  }

  const expectedCount = endNum - startNum + 1;
  if (expectedCount > driveLinks.length) {
    throw new Error(`Range too large: Need ${expectedCount} files but only have ${driveLinks.length} links`);
  }

  // Only process the number of files that match the range
  const linksToProcess = driveLinks.slice(0, expectedCount);

  onProgress?.('Creating download archive...');

  const zip = new JSZip();
  const downloadPromises: Promise<void>[] = [];

  // Process each link sequentially for better row-by-row tracking
  for (let index = 0; index < linksToProcess.length; index++) {
    const link = linksToProcess[index];
    const currentNum = startNum + index;
    const fileName = `${baseName}${currentNum}.jpg`;
    
    onProgress?.(`📥 Row ${index + 1}/${linksToProcess.length}: Downloading ${fileName}...`);

    try {
      const blob = await downloadSingleFile(link, fileName, index + 1, linksToProcess.length, onProgress);
      
      if (blob) {
        zip.file(fileName, blob);
        onProgress?.(`✅ Row ${index + 1}/${linksToProcess.length}: Successfully added ${fileName}`);
      } else {
        console.warn(`Failed to download: ${link}`);
        // Add a placeholder text file for failed downloads
        zip.file(`${fileName}.failed.txt`, `Failed to download from: ${link}`);
        onProgress?.(`❌ Row ${index + 1}/${linksToProcess.length}: Failed to download ${fileName}`);
      }
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error);
      // Add error info to zip
      zip.file(`${fileName}.error.txt`, `Error downloading from: ${link}\nError: ${(error as Error).message}`);
      onProgress?.(`❌ Row ${index + 1}/${linksToProcess.length}: Error downloading ${fileName}`);
    }

    // Small delay to prevent overwhelming the server
    if (index < linksToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Generate and download the zip file
  onProgress?.('Generating zip file...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  const zipFileName = `${baseName}${startNum}-${endNum}.zip`;
  saveAs(zipBlob, zipFileName);
  
  onProgress?.(`Downloaded ${zipFileName} successfully!`);
};

/**
 * Downloads a single file from Google Drive
 */
const downloadSingleFile = async (
  driveUrl: string, 
  fileName: string, 
  currentIndex?: number, 
  totalCount?: number, 
  onProgress?: (status: string) => void
): Promise<Blob | null> => {
  try {
    const directUrl = convertToDirectDownloadUrl(driveUrl);
    
    // Use a proxy approach to handle CORS
    const response = await fetchWithCorsProxy(directUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Validate that we got an image
    if (blob.size === 0) {
      throw new Error('Empty file received');
    }

    return blob;
  } catch (error) {
    console.error(`Failed to download ${fileName}:`, error);
    return null;
  }
};

/**
 * Attempts to fetch with CORS handling using our API proxy
 */
const fetchWithCorsProxy = async (url: string): Promise<Response> => {
  // First, try using our API proxy (primary method for Vercel)
  try {
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*,*/*',
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });
    
    if (response.ok) {
      console.log('✅ Proxy fetch successful');
      return response;
    } else {
      console.warn(`Proxy fetch failed with status: ${response.status}`);
      const errorText = await response.text();
      console.warn('Proxy error details:', errorText);
    }
  } catch (error) {
    console.warn('Proxy fetch failed with error:', error);
  }

  // Fallback to direct fetch with better error handling
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      mode: 'cors',
    });
    
    if (response.ok) {
      console.log('✅ Direct fetch successful');
      return response;
    } else {
      console.warn(`Direct fetch failed with status: ${response.status}`);
    }
  } catch (error) {
    console.warn('Direct fetch failed with error:', error);
  }

  // Last resort: try with no-cors mode (limited functionality)
  try {
    console.log('Trying no-cors mode as last resort...');
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
    });
    
    // Note: no-cors mode doesn't allow reading response status or body
    // This is mainly for triggering browser download behavior
    return response;
  } catch (error) {
    console.error('All fetch methods failed:', error);
    throw new Error(`Unable to download file due to CORS restrictions. URL: ${url}`);
  }
};

/**
 * Alternative download method using a hidden iframe (fallback)
 */
export const downloadFileDirectly = (url: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Batch download using multiple methods
 */
export const downloadFilesAlternative = async (
  driveLinks: string[],
  startName: string,
  endName: string,
  onProgress?: (status: string) => void
): Promise<void> => {
  const startMatch = startName.match(/^(.+?)(\d+)$/);
  if (!startMatch) throw new Error('Invalid start name format');
  
  const baseName = startMatch[1];
  const startNum = parseInt(startMatch[2]);

  onProgress?.('Starting individual downloads...');

  driveLinks.forEach((link, index) => {
    const currentNum = startNum + index;
    const fileName = `${baseName}${currentNum}.jpg`;
    const directUrl = convertToDirectDownloadUrl(link);
    
    setTimeout(() => {
      downloadFileDirectly(directUrl, fileName);
      onProgress?.(`Downloading ${fileName}...`);
    }, index * 500); // Stagger downloads to avoid overwhelming the browser
  });

  onProgress?.('Download links opened. Check your downloads folder.');
};
