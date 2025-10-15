import { useState, useEffect } from 'react';

interface UseImageLoaderResult {
  imageUrl: string;
  isLoading: boolean;
  error: string | null;
}

export const useImageLoader = (originalUrl: string, fallbackUrl: string = '/logo.png'): UseImageLoaderResult => {
  const [imageUrl, setImageUrl] = useState<string>(originalUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalUrl) {
      setImageUrl(fallbackUrl);
      setIsLoading(false);
      return;
    }

    // If it's a local URL, use it directly
    if (originalUrl.startsWith('/') || originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
      setImageUrl(originalUrl);
      setIsLoading(false);
      return;
    }

    // For Azure Blob Storage URLs, use proxy in development
    const isAzureBlob = originalUrl.includes('drzewapistorage.blob.core.windows.net');
    const isDevelopment = import.meta.env.DEV;
    
    let finalUrl = originalUrl;
    if (isAzureBlob && isDevelopment) {
      // Use proxy in development
      const blobPath = originalUrl.replace('https://drzewapistorage.blob.core.windows.net', '');
      finalUrl = `/blob-proxy${blobPath}`;
      console.log('Using proxy for Azure Blob Storage:', finalUrl);
    }

    setImageUrl(finalUrl);
    setIsLoading(false);
  }, [originalUrl, fallbackUrl]);

  return { imageUrl, isLoading, error };
};
