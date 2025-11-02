import React from 'react';

interface PhotoPickerProps {
  photos: File[];
  onChange: (newPhotos: File[]) => void;
  onSelectFromGallery: () => void;
  onTakePhoto?: () => void;
  maxPhotos: number; // e.g., 5 for report, 4 for species
  columns?: number; // optional explicit columns; defaults to maxPhotos
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photos,
  onChange,
  onSelectFromGallery,
  onTakePhoto,
  maxPhotos,
  columns
}) => {
  const handleRemove = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleEmptySlotClick = () => {
    onSelectFromGallery();
  };

  const cols = Math.max(1, Math.min(6, columns ?? maxPhotos));
  const gridColsClass =
    cols === 1 ? 'grid-cols-1' :
    cols === 2 ? 'grid-cols-2' :
    cols === 3 ? 'grid-cols-3' :
    cols === 4 ? 'grid-cols-4' :
    cols === 5 ? 'grid-cols-5' : 'grid-cols-6';

  return (
    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-400/30 rounded-lg p-2 sm:p-3 shadow-xl w-full my-1 sm:my-2">
      <div className="space-y-2">
        <div className="flex gap-1">
          {onTakePhoto && (
            <button
              onClick={onTakePhoto}
              className="flex-1 px-2 py-1 rounded-md text-xs bg-green-600/90 hover:bg-green-600 text-white transition-colors"
            >
              Zrób zdjęcie
            </button>
          )}
          <button
            onClick={onSelectFromGallery}
            className="flex-1 px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Wybierz zdjęcia
          </button>
        </div>

        <div className={`grid ${gridColsClass} gap-1`}>
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, maxPhotos - photos.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square border-2 border-dashed border-gray-400 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer"
              onClick={handleEmptySlotClick}
            >
              <span className="text-gray-400 dark:text-gray-600 text-xs pointer-events-none">+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


