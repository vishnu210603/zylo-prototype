import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { X, Share2, Download, ZoomIn, Minus, Maximize2, Minimize2, X as CloseIcon } from "lucide-react";
import { SiAirplayaudio } from 'react-icons/si';
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  imageUrl: string | null;
  alt: string;
  isLoading?: boolean;
  fetchTime?: number | null;
  onEditClick?: () => void;
  onDownload?: () => void;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onZoomChange?: (isZoomed: boolean) => void;
}

export default function ImagePreview({ 
  imageUrl, 
  alt, 
  isLoading = false, 
  fetchTime, 
  onEditClick,
  onDownload,
  isSelected = false,
  onSelectChange,
  onZoomChange 
}: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook
  // Notify parent component when zoom state changes
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(isZoomed);
    }
  }, [isZoomed, onZoomChange]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  
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

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    
    // On mobile, use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Generated Image',
        text: 'Check out this image I generated!',
        url: imageUrl,
      }).catch(err => {
        console.log('Share was cancelled or failed:', err);
        // Fallback to opening in new tab if share is cancelled or fails
        window.open(imageUrl, '_blank');
      });
    } else {
      // On desktop, just open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const handleAirdrop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    
    try {
      // First, try the Web Share API with files (works on iOS/iPadOS 13+ and recent Android)
      if (navigator.share && navigator.canShare) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'generated-image.png', { type: 'image/png' });
        
        // Check if files can be shared
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Share via AirDrop',
          });
          return;
        }
      }
      
      // Fallback for macOS Safari and other browsers
      if (navigator.userAgent.includes('Mac') && navigator.userAgent.includes('Safari')) {
        // On macOS, the standard share sheet includes AirDrop
        if (navigator.share) {
          await navigator.share({
            title: 'Share Image',
            text: 'Check out this image',
            url: imageUrl,
          });
        } else {
          // For older Safari versions, open a new window with the image
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Share Image</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      margin: 0; 
                      padding: 20px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: 100vh;
                      text-align: center;
                    }
                    img { 
                      max-width: 100%; 
                      max-height: 80vh;
                      border-radius: 8px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    p {
                      margin-top: 20px;
                      color: #666;
                    }
                  </style>
                </head>
                <body>
                  <img src="${imageUrl}" alt="Shared content">
                  <p>Right-click or long-press the image to share via AirDrop</p>
                </body>
              </html>
            `);
            newWindow.document.close();
          }
        }
      } else {
        // For other platforms, use the standard share dialog
        if (navigator.share) {
          await navigator.share({
            title: 'Share Image',
            text: 'Check out this image',
            url: imageUrl,
          });
        } else {
          alert('Sharing is not supported on this device. Please use your browser\'s share options.');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Don't show an error if the user canceled the share
      if (error.name !== 'AbortError') {
        alert('Could not share the image. Please try again or use the download option.');
      }
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!imageUrl) return;
    
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = new URL(imageUrl);
      url.searchParams.append('_', timestamp.toString());
      
      // Fetch the image as a blob
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      
      // Determine the file extension from the content type or URL
      let extension = 'png';
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('jpeg') || imageUrl.toLowerCase().includes('.jpg') || imageUrl.toLowerCase().includes('.jpeg')) {
        extension = 'jpg';
      } else if (contentType?.includes('gif') || imageUrl.toLowerCase().includes('.gif')) {
        extension = 'gif';
      } else if (contentType?.includes('webp') || imageUrl.toLowerCase().includes('.webp')) {
        extension = 'webp';
      }
      
      // Set up the download
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.${extension}`;
      
      // Append to body, trigger download, then remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      // Call the onDownload callback if provided
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback to opening in new tab if download fails
      window.open(imageUrl, '_blank');
    }
  };

  // Close share options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareButtonRef.current && !shareButtonRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      const handleDownload = async () => {
        if (!imageUrl) return;
        
        try {
          // Add a timestamp to prevent caching
          const timestamp = new Date().getTime();
          const url = new URL(imageUrl);
          url.searchParams.append('_', timestamp.toString());
          
          // Fetch the image as a blob
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary link element
          const link = document.createElement('a');
          
          // Determine the file extension from the content type or URL
          let extension = 'png';
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('jpeg') || imageUrl.toLowerCase().includes('.jpg') || imageUrl.toLowerCase().includes('.jpeg')) {
            extension = 'jpg';
          } else if (contentType?.includes('gif') || imageUrl.toLowerCase().includes('.gif')) {
            extension = 'gif';
          } else if (contentType?.includes('webp') || imageUrl.toLowerCase().includes('.webp')) {
            extension = 'webp';
          }
          
          // Set up the download
          link.href = blobUrl;
          link.download = `generated-image-${Date.now()}.${extension}`;
          
          // Append to body, trigger download, then remove
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
          
        } catch (error) {
          console.error('Error downloading image:', error);
          // Fallback to simple download if the blob method fails
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `generated-image-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      handleDownload();
    }
  };
  
  // Prevent context menu on download buttons
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (isLoading) {
    return (
      <div className="relative group bg-gray-100 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center justify-center p-8">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
      <div className="hidden md:flex flex-col gap-2 absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg">
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-100/50 transition-colors group relative"
          aria-label="Share"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>
          <Share2 className="h-5 w-5 text-gray-800 relative z-10" />
        </button>
        <div className="w-full h-px bg-gray-200 my-1"></div>
        <button
          onClick={handleAirdrop}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-100/50 transition-colors group relative"
          aria-label="AirDrop"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>
          <SiAirplayaudio className="h-5 w-5 text-gray-800 relative z-10" />
        </button>
        <div className="w-full h-px bg-gray-200 my-1"></div>
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-100/50 transition-colors group relative"
          aria-label="Download"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>
          <Download className="h-5 w-5 text-gray-800 relative z-10" />
        </button>
        <div className="w-full h-px bg-gray-200 my-1"></div>
        <button
          onClick={handleZoomClick}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-100/50 transition-colors group relative"
          aria-label="Zoom"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors"></div>
          <ZoomIn className="h-5 w-5 text-gray-800 relative z-10" />
        </button>
      </div>

      <div 
        className={`image-preview-container relative group rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={handleCardClick}
        style={{
          width: 'min(90vw, 500px)',
          aspectRatio: '1/1',
          maxHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-contain cursor-pointer"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(true);
              }}
            />
            
            {/* Action buttons have been removed */}
          </>
        )}
      </div>

      {/* Zoomed Image Modal */}
      {isZoomed && imageUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
          >
            <CloseIcon className="h-8 w-8" />
          </button>
          <div className="max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        {/* Action Menu - Appears when share button is clicked */}
        {showActions && (
          <div className="absolute bottom-full right-0 mb-3 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(e);
                    setShowActions(false);
                  }}
                  className="p-4 rounded-2xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center first:rounded-t-[1.5rem] last:rounded-b-[1.5rem]"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAirdrop(e);
                    setShowActions(false);
                  }}
                  className="p-4 rounded-2xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center first:rounded-t-[1.5rem] last:rounded-b-[1.5rem]"
                  aria-label="AirDrop"
                >
                  <SiAirplayaudio className="h-5 w-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(e);
                    setShowActions(false);
                  }}
                  className="p-4 rounded-2xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center first:rounded-t-[1.5rem] last:rounded-b-[1.5rem]"
                  aria-label="Save to device"
                >
                  <Download className="h-5 w-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomClick(e);
                    setShowActions(false);
                  }}
                  className="p-4 rounded-2xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center first:rounded-t-[1.5rem] last:rounded-b-[1.5rem]"
                  aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  {isZoomed ? <Minus className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="Share options"
        >
          <Share2 className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}