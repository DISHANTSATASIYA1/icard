'use client';

import { useState } from 'react';
import FileUploadSection from '@/components/FileUploadSection';
import DriveLinksSection from '@/components/DriveLinksSection';
import DownloadSection from '@/components/DownloadSection';

export default function Home() {
  const [driveLinks, setDriveLinks] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLinksExtracted = (links: string[]) => {
    setDriveLinks(links);
  };

  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Google Drive Link Extractor & Downloader
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section - 20% */}
          <div className="lg:col-span-1">
            <FileUploadSection 
              onLinksExtracted={handleLinksExtracted}
              onProcessingChange={handleProcessingChange}
              isProcessing={isProcessing}
            />
          </div>

          {/* Drive Links Display Section - 20% */}
          <div className="lg:col-span-1">
            <DriveLinksSection 
              driveLinks={driveLinks}
              isProcessing={isProcessing}
            />
          </div>

          {/* Download Options Section - 20% */}
          <div className="lg:col-span-1">
            <DownloadSection 
              driveLinks={driveLinks}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}