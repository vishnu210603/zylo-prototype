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
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
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

  const cancelPolling = async () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsPolling(false);
      setIsSubmitting(false);
      
      try {
        // Call n8n's cancel endpoint if we have a jobId
        if (jobId) {
          await fetch(`https://zylo-11.app.n8n.cloud/webhook/cancel?jobId=${jobId}`, {
            method: 'POST',
          });
        }
        toast.success('Image generation cancelled');
      } catch (error) {
        console.error('Error cancelling job:', error);
        toast.error('Failed to cancel job. Please try again.');
      }
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
          setPollingInterval(null);
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
    }, 15000);
    setPollingInterval(interval);
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned an invalid response format. Expected JSON.');
      }

      if (data.status === "processing" && data.jobId) {
        setJobId(data.jobId);
        toast.info("Generating image... Job ID: " + data.jobId);
        pollForStatus(data.jobId);
        if (formElement && formElement.reset) {
          formElement.reset();
        }
      } else {
        throw new Error(data.message || "Unexpected response from server");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("Generation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8">
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
          className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-4">
                <FormField
                  label="Brand Name"
                  type="text"
                  id="brandName"
                  name="brandName"
                  placeholder="Enter your brand name"
                  required
                />
                <FormField
                  label="Product Name"
                  type="text"
                  id="productName"
                  name="productName"
                  placeholder="Enter your product or service name"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                  <span className="text-xs text-gray-500">Optional</span>
                </div>
                <div className="relative group">
                  {logoPreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 group-hover:border-cyan-300 transition-all duration-300">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage("logo")}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors border border-gray-200 hover:border-red-300"
                        aria-label="Remove logo"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-cyan-400 hover:bg-gray-50 transition-all duration-300">
                      <label className="flex flex-col items-center justify-center w-full h-48 cursor-pointer p-6 text-center">
                        <div className="p-3 bg-cyan-50 rounded-full mb-4 group-hover:bg-cyan-100 transition-colors">
                          <svg
                            className="w-6 h-6 text-cyan-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Company Logo
                          </span>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, or SVG (Max 5MB)
                          </p>
                        </div>
                        <input
                          id="logo"
                          name="logo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "logo")}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-4">
                <FormField
                  label="Image Description"
                  type="textarea"
                  id="imageDescription"
                  name="imageDescription"
                  placeholder="Describe the type of image you want (e.g., 'A modern office setup with a laptop and coffee cup')"
                  required
                />
                <FormField
                  label="Aspect Ratio"
                  type="select"
                  id="aspectRatio"
                  name="aspectRatio"
                  options={[
                    { value: "", label: "Select Aspect Ratio" },
                    { value: "1:1", label: "Square (1:1)" },
                    { value: "1.91:1", label: "Landscape (1.91:1)" },
                    { value: "4:5", label: "Portrait (4:5)" },
                  ]}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Reference Image <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative group">
                  {blueprintPreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 group-hover:border-cyan-300 transition-all duration-300">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img
                          src={blueprintPreview}
                          alt="Reference preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage("blueprint")}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors border border-gray-200 hover:border-red-300"
                        aria-label="Remove reference image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-cyan-400 hover:bg-gray-50 transition-all duration-300">
                      <label className="flex flex-col items-center justify-center w-full h-48 cursor-pointer p-6 text-center">
                        <div className="p-3 bg-cyan-50 rounded-full mb-4 group-hover:bg-cyan-100 transition-colors">
                          <svg
                            className="w-6 h-6 text-cyan-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Reference Image
                          </span>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, or JPEG (Max 5MB)
                          </p>
                        </div>
                        <input
                          id="blueprintImage"
                          name="blueprintImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "blueprint")}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload a reference image to guide the generation
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={isSubmitting || isPolling}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium text-base shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting || isPolling ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isRetrying ? `Retrying... (${retryCount}/5)` : "Generating Your Design..."}</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Generate LinkedIn Post</span>
                </>
              )}
            </button>
            
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
                    <button
                      type="button"
                      onClick={cancelPolling}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Cancel Generation
                    </button>
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


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import FormField from "./FormField";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";

// export default function LinkedInPostForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState(null);
//   const [imageUrl, setImageUrl] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const [isRetrying, setIsRetrying] = useState(false);
//   const [isPolling, setIsPolling] = useState(false);
//   const [jobId, setJobId] = useState(null);
//   const [fetchTime, setFetchTime] = useState(null);
//   const [blueprintImage, setBlueprintImage] = useState(null);
//   const [logoImage, setLogoImage] = useState(null);
//   const [blueprintPreview, setBlueprintPreview] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const navigate = useNavigate();

//   const handleFileChange = (e, type) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (type === "blueprint") {
//         setBlueprintImage(file);
//         setBlueprintPreview(reader.result);
//       } else {
//         setLogoImage(file);
//         setLogoPreview(reader.result);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeImage = (type) => {
//     if (type === "blueprint") {
//       setBlueprintImage(null);
//       setBlueprintPreview(null);
//       const input = document.getElementById("blueprintImage");
//       if (input) input.value = "";
//     } else {
//       setLogoImage(null);
//       setLogoPreview(null);
//       const input = document.getElementById("logo");
//       if (input) input.value = "";
//     }
//   };

//   const pollForStatus = async (jobId) => {
//     const startTime = Date.now();
//     setIsPolling(true);
//     let retryCount = 0;
//     const maxRetries = 10; // Maximum number of retry attempts
    
//     const checkStatus = async () => {
//       try {
//         console.log(`Checking status for job ${jobId}, attempt ${retryCount + 1}`);
//         const response = await fetch(
//           `https://zylo-11.app.n8n.cloud/webhook/status?jobId=${jobId}`
//         );
        
//         if (!response.ok) {
//           throw new Error(`Server returned ${response.status}`);
//         }
        
//         // First, get the response as text
//         const responseText = await response.text();
//         console.log('Status check response:', responseText);
        
//         // If response is empty, handle retry logic
//         if (!responseText.trim()) {
//           retryCount++;
//           if (retryCount >= maxRetries) {
//             throw new Error('Max retries reached with empty responses');
//           }
//           console.log('Empty response, retrying...');
//           return;
//         }
        
//         // Try to parse as JSON
//         let data;
//         try {
//           data = JSON.parse(responseText);
//         } catch (e) {
//           // If it's not JSON but looks like a URL, treat it as a direct image URL
//           if (responseText.startsWith('http')) {
//             handleSuccess(responseText, startTime);
//             return;
//           }
//           throw new Error('Invalid JSON response');
//         }
        
//         // Handle different response formats
//         if (data.status === "done" && (data.imageUrl || data.url)) {
//           handleSuccess(data.imageUrl || data.url, startTime);
//         } else if (data.status === "processing" || data.status === "pending") {
//           // Continue polling
//           console.log('Still processing...');
//           retryCount = 0; // Reset retry count on successful response
//         } else if (data.error) {
//           throw new Error(data.error);
//         } else {
//           throw new Error('Unexpected response format');
//         }
//       } catch (err) {
//         console.error('Error checking status:', err);
//         retryCount++;
        
//         if (retryCount >= maxRetries) {
//           clearInterval(intervalId);
//           setIsPolling(false);
//           const errorMsg = `Failed to check status after ${maxRetries} attempts: ${err.message}`;
//           setError(errorMsg);
//           toast.error('Failed to check generation status');
//         }
//       }
//     };
    
//     const handleSuccess = (imageUrl, startTime) => {
//       const elapsed = Date.now() - startTime;
//       clearInterval(intervalId);
//       setFetchTime(elapsed);
//       setImageUrl(imageUrl);
//       setSuccess(true);
//       navigate("/preview", {
//         state: {
//           imageUrl: imageUrl,
//           fetchTime: elapsed,
//         },
//       });
//     };
    
//     // Initial check
//     checkStatus();
    
//     // Set up polling
//     const intervalId = setInterval(checkStatus, 3000);
    
//     // Return cleanup function
//     return () => clearInterval(intervalId);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setSuccess(false);
//     setError(null);
//     setImageUrl(null);
//     setFetchTime(null);
//     setRetryCount(0);
//     setIsRetrying(false);

//     const formData = new FormData(e.currentTarget);
//     const formElement = e.currentTarget;
//     if (blueprintImage) {
//       formData.delete("blueprintImage");
//       formData.append("blueprintImage", blueprintImage);
//     }
//     if (logoImage) {
//       formData.delete("logo");
//       formData.append("logo", logoImage);
//     }

//     try {
//       console.log('Sending request to API...');
//       const response = await fetch(
//         "https://zylo-11.app.n8n.cloud/webhook/testing",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );
      
//       // Log response headers for debugging
//       console.log('Response status:', response.status);
//       const contentType = response.headers.get('content-type');
//       console.log('Content-Type:', contentType);
      
//       // Get response as text first to handle different content types
//       const responseText = await response.text();
//       console.log('Raw response:', responseText);
      
//       if (!response.ok) {
//         console.error('Server response not OK:', response.status, responseText);
//         // Try to parse as JSON if possible, otherwise use text
//         try {
//           const errorData = JSON.parse(responseText);
//           throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
//         } catch (e) {
//           throw new Error(`Server error: ${response.status} - ${responseText}`);
//         }
//       }
      
//       let data;
//       try {
//         // Try to parse as JSON
//         data = JSON.parse(responseText);
//         console.log('Parsed response data:', data);
//       } catch (jsonError) {
//         console.error('Error parsing JSON response:', jsonError);
//         // If not JSON, check if it's a direct URL or other text
//         if (responseText.startsWith('http')) {
//           // If the response is a direct URL
//           console.log('Received direct URL response');
//           setImageUrl(responseText);
//           setSuccess(true);
//           toast.success('Image generated successfully!');
//           return;
//         }
//         throw new Error('The server returned an unexpected response format');
//       }
      
//       // Handle different possible response formats
//       if (data.jobId || data.job_id) {
//         const jobId = data.jobId || data.job_id;
//         setJobId(jobId);
//         toast.info("Generating image...");
//         pollForStatus(jobId);
//       } else if (data.url || data.imageUrl || data.image_url) {
//         // Direct image URL in response
//         const imageUrl = data.url || data.imageUrl || data.image_url;
//         setImageUrl(imageUrl);
//         setSuccess(true);
//         toast.success('Image generated successfully!');
//       } else if (data.status === "processing") {
//         // Old format with status field
//         setJobId(data.jobId);
//         toast.info("Generating image...");
//         pollForStatus(data.jobId);
//       } else {
//         console.error('Unexpected response format:', data);
//         throw new Error('The server returned an unexpected response format');
//       }
      
//       // Reset form if we have a valid response
//       if (formElement?.reset) {
//         formElement.reset();
//       }
//     } catch (err) {
//       console.error('Error in form submission:', err);
//       const errorMessage = err.message || 'Failed to generate image. Please try again.';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const renderImageUpload = (id, label, preview, handleRemove, handleChange) => (
//     <div className="flex flex-col gap-2">
//       <label className="block font-medium text-foreground mb-1" htmlFor={id}>
//         {label}
//       </label>
//       <div
//         className="
//           relative flex items-center h-28 border-2 border-cyan-400 rounded-xl
//           bg-gray-50 dark:bg-gray-800 px-6 py-2 w-full
//           min-h-[7rem] transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
//         "
//       >
//         {preview ? (
//           <div className="relative w-full flex justify-center items-center">
//             <div className="relative w-24 h-24">
//               <img
//                 src={preview}
//                 alt={`${label} preview`}
//                 className="w-full h-full object-cover rounded shadow"
//                 style={{ aspectRatio: "1 / 1" }}
//               />
//               <button
//                 type="button"
//                 onClick={handleRemove}
//                 className="
//                   absolute -top-1 -right-1 bg-white/90 rounded-full p-0.5 shadow 
//                   text-red-600 hover:bg-white transition-all z-10
//                 "
//                 aria-label={`Remove ${label}`}
//                 tabIndex={0}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-3 w-3"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414
//                     1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293
//                     4.293a1 1 0 01-1.414-1.414L8.586 10 4.293
//                     5.707a1 1 0 010-1.414z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             <label
//               htmlFor={id}
//               className="flex items-center w-full h-full cursor-pointer"
//               style={{ minHeight: "4.5rem" }}
//             >
//               <svg
//                 className="w-8 h-8 text-cyan-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                 />
//               </svg>
//               <span className="ml-4 text-base text-gray-500 dark:text-gray-400">
//                 Click or drag to upload
//               </span>
//               <input
//                 type="file"
//                 id={id}
//                 name={id}
//                 accept="image/*"
//                 className="hidden"
//                 tabIndex={-1}
//                 onChange={handleChange}
//               />
//             </label>
//           </>
//         )}
//         <input
//           type="file"
//           id={id}
//           name={id}
//           accept="image/*"
//           className="hidden"
//           tabIndex={-1}
//           onChange={handleChange}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div
//       className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative"
//       style={{
//         background:
//           "linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #2563eb 100%)",
//       }}
//     >
//       {/* Overlay div to achieve ~30% opacity on the gradient */}
//       <div
//         aria-hidden="true"
//         className="absolute inset-0"
//         style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", pointerEvents: "none" }}
//       />
//       <div className="relative max-w-4xl mx-auto">
//         <div className="text-[28px] leading-[32px] md:text-[40px] md:leading-[54px] font-bold text-[#28293D] break-words mb-2">
//           Hello, Chitransh!
//         </div>
//         <p className="text-sm text-[#000] mb-7">Thursday, 7 August 2025</p>

//         {isPolling && (
//           <div className="mb-6 p-6 border-2 border-solid border-border rounded-lg bg-muted/20">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
//               <p className="text-muted-foreground">Generating your image...</p>
//               <p className="text-sm text-muted-foreground mt-2">
//                 This may take a few minutes
//               </p>
//             </div>
//           </div>
//         )}

//         <form
//           className="bg-card p-10 rounded-2xl shadow-lg border border-border flex flex-col gap-8 relative"
//           onSubmit={handleSubmit}
//         >
//           <FormField
//             name="brandName"
//             label="Brand Name"
//             placeholder="Enter your brand name"
//             required
//           />
//           <FormField
//             name="productName"
//             label="Product Description"
//             placeholder="Enter your product or service name"
//             required
//           />
//           <FormField
//             name="imageDescription"
//             label="Image Description"
//             placeholder="Describe the type of image you want"
//             textarea
//             rows={4}
//             required
//           />
//           <div>
//             <label
//               htmlFor="aspectRatio"
//               className="block font-medium text-foreground mb-1"
//             >
//               Aspect Ratio
//             </label>
//             <select
//               id="aspectRatio"
//               name="aspectRatio"
//               required
//               className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
//             >
//               <option value="">Select Aspect Ratio</option>
//               <option value="1:1">Square (1:1)</option>
//               <option value="1.91:1">Landscape (1.91:1)</option>
//               <option value="4:5">Portrait (4:5)</option>
//             </select>
//           </div>

//           {renderImageUpload(
//             "logo",
//             "Upload Logo",
//             logoPreview,
//             () => removeImage("logo"),
//             (e) => handleFileChange(e, "logo")
//           )}
//           {renderImageUpload(
//             "blueprintImage",
//             "Upload Blueprint",
//             blueprintPreview,
//             () => removeImage("blueprint"),
//             (e) => handleFileChange(e, "blueprint")
//           )}
//           <button
//             type="submit"
//             disabled={isSubmitting || isPolling}
//             className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//           >
//             {isSubmitting || isPolling ? (
//               <>
//                 <svg
//                   className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 {isRetrying ? `Retrying... (${retryCount}/5)` : "Generating..."}
//               </>
//             ) : (
//               <>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Generate LinkedIn Post
//               </>
//             )}
//           </button>
          

//           {(isSubmitting || isPolling) && (
//             <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
//               <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-border">
//                 <div className="flex flex-col items-center text-center space-y-4">
//                   <motion.div
//                     animate={{
//                       rotate: 360,
//                       scale: [1, 1.2, 1],
//                     }}
//                     transition={{
//                       rotate: { repeat: Infinity, duration: 2, ease: "linear" },
//                       scale: {
//                         repeat: Infinity,
//                         duration: 1.5,
//                         repeatType: "reverse",
//                       },
//                     }}
//                   >
//                     <Loader2 className="h-12 w-12 text-primary" />
//                   </motion.div>
//                   <div className="space-y-2">
//                     <h3 className="text-lg font-semibold">Generating Your Image</h3>
//                     <p className="text-muted-foreground text-sm">
//                       This may take a few moments
//                     </p>
//                     {jobId && (
//                       <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
//                         Job ID: {jobId}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
//               <p className="text-green-800 dark:text-green-200 font-medium">
//                 Image generated successfully!
//               </p>
//             </div>
//           )}
//           {error && (
//             <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
//               <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }
