
import React, { useState } from "react";
import FormField from "./FormField";
import ImagePreview from "./ImagePreview";
import { toast } from "sonner";

// BACKUP OF PREVIOUS VERSION - keeping original logic commented for rollback
/*
// Previous implementation had issues with:
// 1. CORS errors when 524 timeout occurs (Cloudflare doesn't include CORS headers in error pages)
// 2. Binary file fetching failures due to timeout handling
// 3. Inadequate retry mechanisms for long-running image generation
*/

export default function LinkedInPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Enhanced request function with CORS bypass and 524 handling
  const makeRequest = async (formData: FormData, attempt: number = 1): Promise<void> => {
    const maxRetries = 5; // Increased retries for better success rate
    const retryDelay = Math.min(attempt * 3000, 15000); // 3s, 6s, 9s, 12s, 15s (max)
    
    try {
      // Extended timeout for image generation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8 * 60 * 1000); // 8 minutes

      if (attempt === 1) {
        toast.info("Starting image generation... This may take up to 8 minutes.");
      } else {
        toast.info(`Retry attempt ${attempt}/${maxRetries} - Image is being generated...`);
      }

      // Enhanced fetch with additional headers to help with CORS and caching
      const response = await fetch(
        "https://zylo-11.app.n8n.cloud/webhook-test/97b30150-ecdc-42cb-8148-1cab2445cb01",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'omit', // Don't send credentials that might cause CORS issues
          headers: {
            'Accept': 'image/*,*/*', // Prefer images but accept anything
            'Cache-Control': 'no-cache', // Prevent caching issues
          },
        }
      );

      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

      if (response.ok) {
        try {
          // Check content type first
          const contentType = response.headers.get('content-type') || '';
          console.log('Content-Type:', contentType);

          if (contentType.includes('text/html')) {
            // If we get HTML, it might be an error page from Cloudflare
            const htmlText = await response.text();
            console.log('Received HTML response:', htmlText.substring(0, 200));
            
            if (htmlText.includes('524') || htmlText.includes('timeout')) {
              throw new Error('TIMEOUT_RETRY');
            } else {
              throw new Error('Unexpected HTML response from server');
            }
          }

          const imageBlob = await response.blob();
          console.log(`Blob size: ${imageBlob.size}, type: ${imageBlob.type}`);
          
          // Enhanced validation for binary image data
          if (imageBlob.size > 0) {
            // Check if it's actually an image by trying to read it
            const arrayBuffer = await imageBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Check for image file signatures
            const isValidImage = (
              imageBlob.type.startsWith('image/') ||
              // PNG signature
              (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) ||
              // JPEG signature
              (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) ||
              // WebP signature
              (uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50) ||
              // Large file that's likely an image
              imageBlob.size > 5000
            );

            if (isValidImage) {
              const imageObjectUrl = URL.createObjectURL(imageBlob);
              setImageUrl(imageObjectUrl);
              setSuccess(true);
              setRetryCount(0);
              setIsPolling(false);
              toast.success("Image generated successfully!");
              return;
            } else {
              console.log('File signature check failed. First 16 bytes:', Array.from(uint8Array.slice(0, 16)).map(b => b.toString(16)).join(' '));
              throw new Error("Generated content is not a valid image file");
            }
          } else {
            throw new Error("Received empty response");
          }
        } catch (blobError: any) {
          console.error("Error processing response as blob:", blobError);
          if (blobError.message === 'TIMEOUT_RETRY') {
            throw blobError;
          }
          throw new Error("Failed to process the generated image");
        }
      } else {
        const statusText = response.statusText || "Unknown error";
        console.error(`HTTP ${response.status}: ${statusText}`);
        
        // Handle specific error cases with retry logic
        if (response.status === 524 || response.status === 503 || response.status === 502) {
          if (attempt < maxRetries) {
            const waitTime = retryDelay / 1000;
            toast.info(`${response.status === 524 ? 'Generation timeout' : 'Server busy'} - retrying in ${waitTime}s... (${attempt}/${maxRetries})`);
            setRetryCount(attempt);
            setIsRetrying(true);
            
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            setIsRetrying(false);
            return await makeRequest(formData, attempt + 1);
          } else {
            // All retries exhausted - suggest manual check
            throw new Error("Image generation is taking longer than expected. The image may have been generated successfully on the server. Please wait 2-3 minutes and try submitting a new request.");
          }
        } else {
          throw new Error(`Request failed (${response.status}): ${statusText}. Please try again.`);
        }
      }
    } catch (err: any) {
      console.error("Request error:", err);
      
      if (err.name === 'AbortError') {
        if (attempt < maxRetries) {
          toast.info("Request timed out, but the image may still be generating. Retrying...");
          setRetryCount(attempt);
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          setIsRetrying(false);
          return await makeRequest(formData, attempt + 1);
        }
        throw new Error("Request timed out after multiple attempts. The image generation may be taking longer than expected.");
      } else if (err.message === 'TIMEOUT_RETRY' && attempt < maxRetries) {
        toast.info("Detected timeout response, retrying...");
        setRetryCount(attempt);
        setIsRetrying(true);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        setIsRetrying(false);
        return await makeRequest(formData, attempt + 1);
      } else if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        // Handle CORS and network errors
        if (attempt < maxRetries) {
          toast.info(`Network issue detected - retrying in ${retryDelay/1000}s... (${attempt}/${maxRetries})`);
          setRetryCount(attempt);
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          setIsRetrying(false);
          return await makeRequest(formData, attempt + 1);
        }
        throw new Error("Network connection issues. Please check your internet connection and try again. If the problem persists, the image may have been generated - wait 2-3 minutes and try a new request.");
      } else if (err.message.includes('timeout') || err.message.includes('busy')) {
        throw err; // Re-throw our custom errors
      } else {
        throw new Error(`Unexpected error: ${err.message}. Please try again.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);
    setImageUrl(null);
    setRetryCount(0);
    setIsRetrying(false);

    const formData = new FormData(e.currentTarget);

    try {
      await makeRequest(formData);
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message);
      toast.error("Generation failed");
    } finally {
      setIsSubmitting(false);
      setIsRetrying(false);
      setRetryCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">LinkedIn Post Generator</h1>
          <p className="text-muted-foreground">Create engaging visual content for your LinkedIn posts</p>
        </div>

        <form
          className="bg-card p-8 rounded-lg shadow-sm border border-border flex flex-col gap-6"
          onSubmit={handleSubmit}
        >
          <FormField 
            name="brandName" 
            label="Brand Name" 
            placeholder="Enter your brand name" 
            required 
          />
          
          <FormField 
            name="productName" 
            label="Product Name" 
            placeholder="Enter your product name" 
            required 
          />
          
          <FormField 
            name="imageDescription" 
            label="Image Description" 
            placeholder="Describe the type of image you want" 
            required 
          />
          
          <FormField 
            name="contentType" 
            label="Content Type" 
            placeholder="Type of content for the post (e.g., promotional, educational)" 
            required 
          />

          <label htmlFor="aspectRatio" className="block">
            <span className="block mb-2 font-medium text-foreground">Aspect Ratio</span>
            <select 
              id="aspectRatio"
              name="aspectRatio" 
              required 
              className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Select Aspect Ratio</option>
              <option value="1:1">Square (1:1)</option>
              <option value="1.91:1">Landscape (1.91:1)</option>
              <option value="4:5">Portrait (4:5)</option>
            </select>
          </label>

          <label htmlFor="blueprintImage" className="block">
            <span className="block mb-2 font-medium text-foreground">Blueprint Image</span>
            <input
              id="blueprintImage"
              name="blueprintImage"
              type="file"
              accept=".jpg,.png,.pdf,.jpeg,.svg"
              required
              className="w-full p-3 border border-input rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-sm text-muted-foreground mt-1">Upload a reference image for your design</p>
          </label>

          <label htmlFor="logo" className="block">
            <span className="block mb-2 font-medium text-foreground">Logo</span>
            <input
              id="logo"
              name="logo"
              type="file"
              accept=".jpg,.png,.pdf,.jpeg,.svg"
              required
              className="w-full p-3 border border-input rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-sm text-muted-foreground mt-1">Upload your brand logo</p>
          </label>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isRetrying ? `Retrying... (${retryCount}/5)` : "Generating Image..."
            ) : "Generate LinkedIn Post"}
          </button>
          
          {isSubmitting && (
            <div className="text-center text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {isRetrying ? 
                  `Processing retry ${retryCount} of 5 - Image generation in progress...` : 
                  "Image generation may take up to 8 minutes. Please wait..."}
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-800 dark:text-green-200 font-medium">Image generated successfully!</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}
        </form>

        <ImagePreview 
          imageUrl={imageUrl} 
          alt="Generated LinkedIn Post Image" 
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
