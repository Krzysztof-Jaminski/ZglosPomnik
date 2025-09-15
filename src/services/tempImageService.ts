// TYMCZASOWY SERWIS DO UPLOADU ZDJĘĆ
// TODO: Usunąć gdy API będzie obsługiwać upload zdjęć

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class TempImageService {
  // Upload pojedynczego zdjęcia na ImgBB
  async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      console.log(`Uploading image: ${file.name} (${file.size} bytes)`);
      
      // Konwertuj plik na base64
      const base64 = await this.fileToBase64(file);
      
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64);
      formData.append('name', file.name);
      
      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('ImgBB response:', result);
      
      if (result.success && result.data) {
        console.log(`Image uploaded successfully: ${result.data.url}`);
        return {
          success: true,
          url: result.data.url // Główny URL obrazu
        };
      } else {
        console.error('ImgBB upload failed:', result);
        return {
          success: false,
          error: result.error?.message || `Upload failed with status: ${result.status}`
        };
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Upload wielu zdjęć
  async uploadImages(files: File[]): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
  
  // Konwertuj plik na base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Usuń prefix "data:image/...;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // Sprawdź czy plik to obraz
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }
  
  // Sprawdź rozmiar pliku (max 5MB)
  isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}

// Eksportuj singleton
export const tempImageService = new TempImageService();
