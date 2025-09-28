'use client';

import { useState } from 'react';
import { downloadFilesWithRename } from '@/services/downloadService';

interface DownloadSectionProps {
  driveLinks: string[];
  isProcessing: boolean;
}

export default function DownloadSection({ driveLinks, isProcessing }: DownloadSectionProps) {
  const [startName, setStartName] = useState('');
  const [endName, setEndName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateInputs = () => {
    if (!startName.trim()) {
      setError('Start name is required');
      return false;
    }
    if (!endName.trim()) {
      setError('End name is required');
      return false;
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
      setError('Names must end with a number (e.g., photo1, photo10) or be numbers (e.g., 1, 10)');
      return false;
    }

    const baseName = startMatch[1];
    const startNum = parseInt(startMatch[2]);
    const endNum = parseInt(endMatch[2]);

    // Check if base names match (allow both empty bases for pure numbers)
    if (baseName !== endMatch[1]) {
      setError('Base names must be the same (e.g., photo1 and photo10, not photo1 and image10)');
      return false;
    }

    if (startNum >= endNum) {
      setError('End number must be greater than start number');
      return false;
    }

    const expectedCount = endNum - startNum + 1;
    if (expectedCount > driveLinks.length) {
      setError(`Range too large: Need ${expectedCount} files but only have ${driveLinks.length} links`);
      return false;
    }
    if (expectedCount <= 0) {
      setError('Invalid range: End number must be greater than start number');
      return false;
    }

    setError('');
    return true;
  };

  const handleDownload = async () => {
    if (!validateInputs()) return;
    if (driveLinks.length === 0) {
      setError('No drive links available for download');
      return;
    }

    setIsDownloading(true);
    setDownloadStatus('Preparing downloads...');
    setError('');

    try {
      await downloadFilesWithRename(driveLinks, startName, endName, setDownloadStatus);
      setDownloadStatus('Download completed successfully!');
    } catch (err) {
      setError('Download failed. Please check the links and try again.');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const getPreviewNames = () => {
    if (!startName || !endName) return [];
    
    let startMatch, endMatch;
    
    // Check if pure numbers first
    if (/^\d+$/.test(startName)) {
      startMatch = ['', '', startName];
    } else {
      startMatch = startName.match(/^(.+?)(\d+)$/);
    }
    
    if (/^\d+$/.test(endName)) {
      endMatch = ['', '', endName];
    } else {
      endMatch = endName.match(/^(.+?)(\d+)$/);
    }
    
    if (!startMatch || !endMatch) return [];
    
    const baseStart = startMatch[1];
    const baseEnd = endMatch[1];
    const startNum = parseInt(startMatch[2]);
    const endNum = parseInt(endMatch[2]);
    
    // Check if base names match
    if (baseStart !== baseEnd) return [];
    
    const names = [];
    const count = Math.min(endNum - startNum + 1, driveLinks.length, 5); // Show max 5 preview
    
    for (let i = 0; i < count; i++) {
      names.push(`${baseStart}${startNum + i}`);
    }
    
    if (count < endNum - startNum + 1) {
      names.push('...');
    }
    
    return names;
  };

  const previewNames = getPreviewNames();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Download Options
      </h2>
      
      <div className="space-y-4">
        {/* Input Fields */}
        <div>
          <label htmlFor="startName" className="block text-sm font-medium text-gray-700 mb-1">
            Start Name
          </label>
          <input
            type="text"
            id="startName"
            value={startName}
            onChange={(e) => setStartName(e.target.value)}
            placeholder="e.g., photo1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
            disabled={isDownloading || isProcessing}
          />
        </div>

        <div>
          <label htmlFor="endName" className="block text-sm font-medium text-gray-700 mb-1">
            End Name
          </label>
          <input
            type="text"
            id="endName"
            value={endName}
            onChange={(e) => setEndName(e.target.value)}
            placeholder="e.g., photo10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
            disabled={isDownloading || isProcessing}
          />
        </div>

        {/* Preview */}
        {previewNames.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm font-medium text-blue-900 mb-2">Preview:</p>
            <div className="text-xs text-blue-800 space-y-1">
              {previewNames.map((name, index) => (
                <div key={index} className="font-mono">
                  {name === '...' ? name : `${name}.jpg`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Status Display */}
        {downloadStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-blue-800 font-mono whitespace-pre-wrap">{downloadStatus}</p>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading || isProcessing || driveLinks.length === 0}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isDownloading || isProcessing || driveLinks.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isDownloading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Downloading...
            </div>
          ) : (() => {
            // Calculate actual download count based on range
            if (!startName || !endName) {
              return `Download ${driveLinks.length} File${driveLinks.length !== 1 ? 's' : ''}`;
            }
            
            let startMatch, endMatch;
            
            // Check if pure numbers first
            if (/^\d+$/.test(startName)) {
              startMatch = ['', '', startName];
            } else {
              startMatch = startName.match(/^(.+?)(\d+)$/);
            }
            
            if (/^\d+$/.test(endName)) {
              endMatch = ['', '', endName];
            } else {
              endMatch = endName.match(/^(.+?)(\d+)$/);
            }
            
            if (startMatch && endMatch && startMatch[1] === endMatch[1]) {
              const startNum = parseInt(startMatch[2]);
              const endNum = parseInt(endMatch[2]);
              const rangeCount = endNum - startNum + 1;
              const actualCount = Math.min(rangeCount, driveLinks.length);
              return `Download ${actualCount} File${actualCount !== 1 ? 's' : ''} (${startName} to ${endName})`;
            }
            
            return `Download ${driveLinks.length} File${driveLinks.length !== 1 ? 's' : ''}`;
          })()}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Only the number part will change in file names</p>
          <p>• Files will be downloaded as .jpg format</p>
          <p>• Make sure popup blockers are disabled</p>
        </div>
      </div>
    </div>
  );
}
