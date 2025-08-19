// import { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import ImagePreview from '@/components/ImagePreview';
// import { Button } from '@/components/ui/button';

// import TopNavbar from '@/components/TopNavbar';

// export default function ImagePreviewPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { imageUrl, fetchTime } = location.state || {};
//   const [isSelected, setIsSelected] = useState(false);
  
//   const handleEditClick = () => {
//     navigate('/editor', { 
//       state: { 
//         imageUrl,
//         aspectRatio: '1:1' // You might want to pass the actual aspect ratio if available
//       } 
//     });
//   };

//   if (!imageUrl) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f7fa] via-[#f5f7ff] to-[#d9e6ff]">
//         <div className="text-center">
//           <h2 className="text-2xl font-semibold mb-4">No image to display</h2>
//           <p className="text-muted-foreground mb-6">Please generate an image first</p>
//           <Button 
//           variant="ghost" 
//           onClick={() => navigate('/')}
//           className="flex items-center gap-2"
//         >
//           <img src="/assets/Button.svg" alt="Back" className="h-4 w-4" />
//         </Button>
//         </div>
//       </div>
//     );
//   }

//   const handleDownload = () => {
//     if (imageUrl) {
//       const link = document.createElement('a');
//       // Add timestamp to prevent caching
//       const timestamp = new Date().getTime();
//       const url = new URL(imageUrl);
//       url.searchParams.append('_', timestamp.toString());
      
//       // Set the filename with proper extension
//       let filename = 'generated-image.png';
//       if (imageUrl.includes('.')) {
//         const ext = imageUrl.split('.').pop()?.split('?')[0];
//         filename = `generated-image.${ext || 'png'}`;
//       }
      
//       link.href = url.toString();
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f5f7ff] to-[#d9e6ff]">
//       <TopNavbar/>
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <div className="flex items-center justify-between mb-4">
//         <Button 
//           variant="ghost" 
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2"
//         >
//           <img src="/assets/Button.svg" alt="Back" className="h-4 w-4" />
//           <span>Back</span>
//         </Button>
        
//         <div className="flex items-center gap-4">
//           <h2 className="text-lg font-semibold text-gray-800">Generated image</h2>
//           {fetchTime && (
//             <span className="text-sm text-gray-600">
//               Time taken: {fetchTime}
//             </span>
//           )}
//         </div>
        
//         {/* Empty div to balance the flex layout */}
//         <div className="w-[72px]"></div>
//       </div>
      
//       <div className="bg-white p-6 rounded-xl shadow-lg">
//         <ImagePreview 
//           imageUrl={imageUrl} 
//           alt="Generated LinkedIn Post" 
//           fetchTime={fetchTime}
//           isSelected={isSelected}
//           onSelectChange={setIsSelected}
//           onEditClick={handleEditClick}
//         />
//         <div className="mt-6 flex justify-end">
//           <Button 
//             onClick={handleDownload}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
//           >
//             Download Now
//           </Button>
//         </div>
//       </div>
//       </div>
//     </div>
//     </div>
//   );
// }





import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ImagePreview from '@/components/ImagePreview';
import TopNavbar from '@/components/TopNavbar';
import AnimatedBlobBackground from '@/components/ui/AnimatedBlobBackground';

export default function ImagePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, fetchTime } = location.state || {};
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  
  const handleEditClick = () => {
    navigate('/editor', { 
      state: { 
        imageUrl,
        aspectRatio: '1:1' // You might want to pass the actual aspect ratio if available
      } 
    });
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f7fa] via-[#f5f7ff] to-[#d9e6ff]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No image to display</h2>
          <p className="text-muted-foreground mb-6">Please generate an image first</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <img src="/assets/Button.svg" alt="Back" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = new URL(imageUrl);
      url.searchParams.append('_', timestamp.toString());
      
      // Create a temporary link
      const link = document.createElement('a');
      
      // Set the filename with proper extension
      let filename = 'generated-image.png';
      if (imageUrl.includes('.')) {
        const ext = imageUrl.split('.').pop()?.split('?')[0];
        if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())) {
          filename = `generated-image.${ext}`;
        }
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
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback to the old method if the new one fails
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">
      <AnimatedBlobBackground />
      <div className={`sticky top-0 z-50 ${isImageZoomed ? 'hidden' : ''}`}>
        <TopNavbar />
      </div>
      
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 relative z-10">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2.5 -ml-2 hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <img 
                src="/assets/Button.svg" 
                alt="Back" 
                className="h-6 w-6"
              />
            </Button>
            
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm border border-blue-200">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fetchTime && (
                  <span className="text-sm font-medium text-gray-700">
                    Generated in {formatTime(fetchTime).replace('seconds', 's').replace('second', 's').replace('minutes', 'm').replace('minute', 'm')}
                  </span>
                )}
              </div>
              <div className="h-5 w-px bg-gray-200 mx-1"></div>
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-medium text-green-600">Ready</span>
            </div>
            
            <div className="w-[40px]"></div> {/* Balance the flex layout */}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex items-center justify-center relative z-10">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .image-preview-container {
                width: 90vw !important;
                height: 90vw !important; /* Makes it square based on viewport width */
                max-height: 80vh !important;
                margin: 0 auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              .image-preview-container img {
                max-height: 100% !important;
                max-width: 100% !important;
                width: auto !important;
                height: auto !important;
                object-fit: contain !important;
              }
            }
          `
        }} />
        <ImagePreview
          imageUrl={imageUrl}
          alt="Generated LinkedIn Post"
          fetchTime={fetchTime}
          isSelected={isSelected}
          onSelectChange={setIsSelected}
          onEditClick={handleEditClick}
          onDownload={handleDownload}
          onZoomChange={setIsImageZoomed}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide scrollbar for Chrome, Safari and Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `
      }} />
    </div>
  );
}
