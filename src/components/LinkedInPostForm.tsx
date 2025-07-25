
import React, { useState } from "react";
import FormField from "./FormField";
import ImagePreview from "./ImagePreview";
import { toast } from "sonner";

export default function LinkedInPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const makeRequest = async (formData: FormData, attempt: number = 1): Promise<void> => {
    const maxRetries = 3;
    const retryDelay = attempt * 2000; // 2s, 4s, 6s
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

      if (attempt === 1) {
        toast.info("Starting image generation... This may take up to 5 minutes.");
      } else {
        toast.info(`Retry attempt ${attempt}/${maxRetries}...`);
      }

      const response = await fetch(
        "https://zylo-11.app.n8n.cloud/webhook-test/97b30150-ecdc-42cb-8148-1cab2445cb01",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          const imageBlob = await response.blob();
          
          if (imageBlob.size > 0 && (imageBlob.type.startsWith('image/') || imageBlob.size > 1000)) {
            const imageObjectUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageObjectUrl);
            setSuccess(true);
            setRetryCount(0);
            toast.success("Image generated successfully!");
            return;
          } else {
            const text = await imageBlob.text();
            console.log('Unexpected response:', text);
            throw new Error("Generated content is not a valid image");
          }
        } catch (blobError) {
          console.error("Error processing response as blob:", blobError);
          throw new Error("Failed to process the generated image");
        }
      } else {
        const statusText = response.statusText || "Unknown error";
        console.error(`HTTP ${response.status}: ${statusText}`);
        
        // For 524 and 503 errors, retry automatically if we haven't exceeded max retries
        if ((response.status === 524 || response.status === 503) && attempt < maxRetries) {
          toast.info(`${response.status === 524 ? 'Cloudflare timeout' : 'Service busy'} - retrying in ${retryDelay/1000}s...`);
          setRetryCount(attempt);
          setIsRetrying(true);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          setIsRetrying(false);
          return await makeRequest(formData, attempt + 1);
        }
        
        // Final error handling
        if (response.status === 524) {
          throw new Error("Cloudflare timeout occurred. The image may still be generating on the server. Please try again in a few minutes.");
        } else if (response.status === 503) {
          throw new Error("Service is temporarily busy. Please wait a moment and try again.");
        } else if (response.status === 502) {
          throw new Error("Service temporarily unavailable. Please try again in a few moments.");
        } else {
          throw new Error(`Request failed (${response.status}): ${statusText}. Please try again.`);
        }
      }
    } catch (err: any) {
      console.error("Request error:", err);
      
      if (err.name === 'AbortError') {
        throw new Error("Request timed out after 5 minutes. The image generation may be taking longer than expected.");
      } else if (err.message.includes('Cloudflare timeout') || err.message.includes('Service is temporarily busy')) {
        throw err; // Re-throw our custom errors
      } else {
        throw new Error("Network error occurred. Please check your connection and try again.");
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
              isRetrying ? `Retrying... (${retryCount}/3)` : "Generating Image..."
            ) : "Generate LinkedIn Post"}
          </button>

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
