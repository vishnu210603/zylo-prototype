import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "./FormField";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LinkedInPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [blueprintImage, setBlueprintImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [blueprintPreview, setBlueprintPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle file change and create preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'blueprint' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'blueprint') {
        setBlueprintImage(file);
        setBlueprintPreview(reader.result as string);
      } else {
        setLogoImage(file);
        setLogoPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'blueprint' | 'logo') => {
    if (type === 'blueprint') {
      setBlueprintImage(null);
      setBlueprintPreview(null);
      const input = document.getElementById('blueprintImage') as HTMLInputElement;
      if (input) input.value = '';
    } else {
      setLogoImage(null);
      setLogoPreview(null);
      const input = document.getElementById('logo') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const pollForStatus = async (jobId: string) => {
    const startTime = Date.now();
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://zylo-11.app.n8n.cloud/webhook/status?jobId=${jobId}`
        );
        const data = await res.json();

        if (data.status === "done" && data.imageUrl) {
          const elapsed = Date.now() - startTime;
          setFetchTime(elapsed);
          console.log("Time taken to fetch image:", elapsed, "ms");
          clearInterval(interval);
          setImageUrl(data.imageUrl);
          setSuccess(true);
          setIsPolling(false);
          // Navigate to preview page with the image data
          navigate('/preview', { 
            state: { 
              imageUrl: data.imageUrl, 
              fetchTime: elapsed 
            } 
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);
    setImageUrl(null);
    setFetchTime(null);
    setRetryCount(0);
    setIsRetrying(false);

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;
    
    // Add the files if they exist
    if (blueprintImage) {
      formData.delete('blueprintImage');
      formData.append('blueprintImage', blueprintImage);
    }
    if (logoImage) {
      formData.delete('logo');
      formData.append('logo', logoImage);
    }

    try {
      const response = await fetch("https://zylo-11.app.n8n.cloud/webhook/testing", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "processing" && data.jobId) {
        setJobId(data.jobId);
        toast.info("Generating image... Job ID: " + data.jobId);
        pollForStatus(data.jobId);
        if (formElement && formElement.reset) {
          formElement.reset();
        }
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("Generation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="w-full max-w-6xl mx-0 md:mx-8 px-4 md:px-0 overflow-hidden text-left">
          <div className="text-[24px] leading-[32px] md:text-[40px] md:leading-[54px] font-bold text-[#28293D] break-words">
            Hello, Chitransh!
          </div>
          <p className="text-sm text-[#8E90A6] mt-1 pb-4">Monday, 24 July 2025</p>
        </div>

        {isPolling && (
          <div className="mt-6 p-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Generating your image...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a few minutes</p>
            </div>
          </div>
        )}
        <form
          className="bg-card p-8 rounded-2xl shadow-lg border border-border"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">Post Details</h2>
              
              <FormField
                name="brandName"
                label="Brand Name"
                placeholder="Enter your brand name"
                required
              />

              <FormField
                name="productName"
                label="Product Description"
                placeholder="Enter your product or service name"
                required
              />

              

              
              <div className="relative group">
                {logoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-cyan-200 dark:border-cyan-900/50">
                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-48">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-32 max-w-full object-contain p-4"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage('logo')}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                      aria-label="Remove logo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="logo"
                    className="block w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 hover:from-cyan-100 hover:to-blue-100 dark:hover:from-cyan-800/30 dark:hover:to-blue-800/30 transition-all duration-300 border-cyan-200 dark:border-cyan-900/50"
                  >
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <span className="font-medium text-foreground">Upload Brand Logo</span>
                      <p className="text-sm text-muted-foreground">Transparent PNG recommended</p>
                    </div>
                    <input
                      id="logo"
                      name="logo"
                      type="file"
                      accept=".png,.svg"
                      required
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">Visual Assets</h2>
              
              <FormField
                name="imageDescription"
                label="Image Description"
                placeholder="Describe the type of image you want"
                textarea
                rows={4}
                required
              />
              <div className="space-y-2">
                <label htmlFor="aspectRatio" className="block font-medium text-foreground">
                  Aspect Ratio
                </label>
                <select
                  id="aspectRatio"
                  name="aspectRatio"
                  required
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                >
                  <option value="">Select Aspect Ratio</option>
                  <option value="1:1">Square (1:1)</option>
                  <option value="1.91:1">Landscape (1.91:1)</option>
                  <option value="4:5">Portrait (4:5)</option>
                </select>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  {blueprintPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-cyan-200 dark:border-cyan-900/50">
                      <img 
                        src={blueprintPreview} 
                        alt="Blueprint preview" 
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('blueprint')}
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                        aria-label="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label 
                      htmlFor="blueprintImage" 
                      className="block w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 hover:from-cyan-100 hover:to-blue-100 dark:hover:from-cyan-800/30 dark:hover:to-blue-800/30 transition-all duration-300 border-cyan-200 dark:border-cyan-900/50"
                    >
                      <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-foreground">Upload Blueprint Image</span>
                        <p className="text-sm text-muted-foreground">JPG, PNG, or SVG (Max 5MB)</p>
                      </div>
                      <input
                        id="blueprintImage"
                        name="blueprintImage"
                        type="file"
                        accept=".jpg,.png,.jpeg,.svg"
                        required
                        onChange={(e) => handleFileChange(e, 'blueprint')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                  )}
                </div>

                
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting || isPolling}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              {isSubmitting || isPolling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRetrying ? `Retrying... (${retryCount}/5)` : "Generating..."}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Generate LinkedIn Post
                </>
              )}
            </button>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Your post will be generated with professional design templates
            </p>
          </div>

          {(isSubmitting || isPolling) && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-border">
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                      scale: { repeat: Infinity, duration: 1.5, repeatType: "reverse" }
                    }}
                  >
                    <Loader2 className="h-12 w-12 text-primary" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Generating Your Image</h3>
                    <p className="text-muted-foreground text-sm">This may take a few moments</p>
                    {jobId && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                        Job ID: {jobId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Image generated successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
