import React, { useState } from "react";
import { X, Download } from "lucide-react";
import { saveAs } from 'file-saver';

interface ImagePreviewProps {
  imageUrl: string | null;
  alt: string;
  isLoading?: boolean;
  fetchTime?: number | null;
  onEditClick?: () => void;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

export default function ImagePreview({ 
  imageUrl, 
  alt, 
  isLoading = false, 
  fetchTime, 
  onEditClick,
  isSelected = false,
  onSelectChange 
}: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  
  const handleCardClick = () => {
    if (onSelectChange) {
      onSelectChange(!isSelected);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick();
    }
  };

  const formatTime = (ms: number | null) => {
    if (ms === null || isNaN(ms)) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (imageUrl) {
      // Create a temporary link
      const link = document.createElement('a');
      
      // Force download by adding a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = new URL(imageUrl);
      url.searchParams.append('_', timestamp.toString());
      
      // Set the filename - ensure it has a proper extension
      let filename = imageUrl.split('/').pop() || 'generated-image.png';
      if (!filename.includes('.')) {
        filename += '.png';
      }
      
      // Set up the link
      link.href = url.toString();
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to document, trigger click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // For browsers that support the download attribute
      setTimeout(() => {
        // If we're still on the same page, try opening in a new tab as fallback
        if (document.visibilityState === 'visible') {
          window.open(url.toString(), '_blank');
        }
      }, 100);
    }
  };
  
  // Prevent context menu on download buttons
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  if (isLoading) {
    return (
      <div className="mt-6 p-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Generating your image...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few minutes</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="mt-">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Generated Image</h3>
        {isSelected && onEditClick && (
          <button 
            onClick={handleEditClick}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
          >
            <span>Preview Edit</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        )}
      </div>
      <div 
        className={`border-2 rounded-lg overflow-hidden transition-all duration-200 ${isSelected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-border'}`}
        onClick={handleCardClick}
      >
        <div className="relative">
          <div 
            className="cursor-pointer relative group"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
          >
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-auto max-h-96 object-contain transition-all duration-300"
              onError={(e) => {
                console.error("Failed to load image:", imageUrl);
              }}
            />
            <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/20">
            </div>
          </div>
        </div>
        
        <div className={`p-3 flex justify-between items-center transition-colors duration-200 ${isSelected ? 'bg-blue-50' : 'bg-muted/50'}`}>
          {fetchTime !== undefined && fetchTime !== null && (
            <div className="text-sm text-foreground">
              ⏱️ Generated in: <span className="font-medium">{formatTime(fetchTime)}</span>
            </div>
          )}
          <button
            onClick={handleDownload}
            onContextMenu={preventContextMenu}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium select-none"
          >
            <Download className="w-4 h-4" />
            Download Image
          </button>
        </div>

        {/* Zoomed Image Modal */}
        {isZoomed && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              <button 
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="max-h-[80vh] flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={alt}
                  className="max-w-full max-h-[80vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleDownload}
                  onContextMenu={preventContextMenu}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors select-none"
                >
                  <Download className="w-4 h-4" />
                  Download Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}