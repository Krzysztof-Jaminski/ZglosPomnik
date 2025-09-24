// Image proxy utility to handle CORS issues with Azure Blob Storage
// This creates a proxy endpoint that fetches images from external sources

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getProxiedImageUrl = (originalUrl: string): string => {
  // If it's already a local URL or data URL, return as is
  if (originalUrl.startsWith('/') || originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
    return originalUrl;
  }
  
  // If it's from Azure Blob Storage, use proxy
  if (originalUrl.includes('drzewaapistorage2024.blob.core.windows.net')) {
    // Encode the URL to pass it as a parameter
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${API_BASE_URL}/proxy-image?url=${encodedUrl}`;
  }
  
  // For other external URLs, return as is (they might have proper CORS)
  return originalUrl;
};

// Alternative: Create a local proxy using fetch
export const fetchImageAsBlob = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching image as blob:', error);
    // Return a fallback image or the original URL
    return '/logo.png';
  }
};
