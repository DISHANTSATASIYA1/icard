'use client';

interface DriveLinksSectionProps {
  driveLinks: string[];
  isProcessing: boolean;
}

export default function DriveLinksSection({ driveLinks, isProcessing }: DriveLinksSectionProps) {
  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Extracted Drive Links
      </h2>
      
      {isProcessing ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Extracting links...</span>
        </div>
      ) : driveLinks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p>No links found yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload an Excel file to extract Drive links</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="text-sm text-gray-600 mb-3">
            Found {driveLinks.length} Drive link{driveLinks.length !== 1 ? 's' : ''}
          </div>
          
          {driveLinks.map((link, index) => (
            <div 
              key={index} 
              className="group flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Row {index + 1}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {link}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => copyToClipboard(link)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                  title="Copy link"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                  title="Open link"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



