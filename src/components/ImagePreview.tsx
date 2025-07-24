import React from "react";

interface ImagePreviewProps {
  imageUrl: string | null;
  alt: string;
  isLoading?: boolean;
}

export default function ImagePreview({ imageUrl, alt, isLoading = false }: ImagePreviewProps) {
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
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Generated Image:</h3>
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto max-h-96 object-contain"
          onError={(e) => {
            console.error("Failed to load image:", imageUrl);
          }}
        />
        <div className="p-3 bg-muted/50">
          <a
            href={imageUrl}
            download="generated-image.png"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Download Image
          </a>
        </div>
      </div>
    </div>
  );
}