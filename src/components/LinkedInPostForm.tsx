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
  const [isPolling, setIsPolling] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const pollForStatus = async (jobId: string) => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://zylo-11.app.n8n.cloud/webhook/status?jobId=${jobId}`
        );
        const data = await res.json();

        if (data.status === "done" && data.imageUrl) {
          clearInterval(interval);
          setImageUrl(data.imageUrl);
          setSuccess(true);
          setIsPolling(false);
          toast.success("Image generated successfully!");
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
    setRetryCount(0);
    setIsRetrying(false);

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            LinkedIn Post Generator
          </h1>
          <p className="text-muted-foreground">
            Create engaging visual content for your LinkedIn posts
          </p>
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
            <span className="block mb-2 font-medium text-foreground">
              Aspect Ratio
            </span>
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
            <span className="block mb-2 font-medium text-foreground">
              Blueprint Image
            </span>
            <input
              id="blueprintImage"
              name="blueprintImage"
              type="file"
              accept=".jpg,.png,.pdf,.jpeg,.svg"
              required
              className="w-full p-3 border border-input rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload a reference image for your design
            </p>
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
            <p className="text-sm text-muted-foreground mt-1">
              Upload your brand logo
            </p>
          </label>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isPolling}
          >
            {isSubmitting
              ? isRetrying
                ? `Retrying... (${retryCount}/5)`
                : "Generating Image..."
              : "Generate LinkedIn Post"}
          </button>

          {(isSubmitting || isPolling) && (
            <div className="text-center text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {isPolling
                  ? `Generating image using jobId ${jobId}...`
                  : "Image generation may take up to 8 minutes. Please wait..."}
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

        <ImagePreview
          imageUrl={imageUrl}
          alt="Generated LinkedIn Post Image"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
