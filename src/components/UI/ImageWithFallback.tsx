import React from 'react';
import { useImageLoader } from '../../hooks/useImageLoader';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/logo.png',
  crossOrigin = 'anonymous',
  onClick,
  style
}) => {
  const { imageUrl, isLoading, error } = useImageLoader(src, fallbackSrc);

  const handleError = () => {
    console.warn(`Failed to load image: ${imageUrl}`);
  };

  const handleLoad = () => {
    // Image loaded successfully
  };

  // For Azure Blob Storage, don't use crossOrigin to avoid CORS issues
  const shouldUseCrossOrigin = !src.includes('drzewapistorage.blob.core.windows.net') && crossOrigin;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        crossOrigin={shouldUseCrossOrigin ? crossOrigin : undefined}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
        style={style}
      />
      {error && imageUrl === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 text-xs text-center px-2">
            Obraz niedostępny
          </span>
        </div>
      )}
    </div>
  );
};
