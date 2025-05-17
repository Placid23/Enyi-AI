import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadDataUri(dataUri: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function convertToJpegAndDownload(
  dataUri: string,
  filenameWithoutExtension: string,
  quality: number = 0.85 // 0.0 to 1.0
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const jpegDataUri = canvas.toDataURL('image/jpeg', quality);
      downloadDataUri(jpegDataUri, `${filenameWithoutExtension}.jpg`);
      resolve();
    };
    img.onerror = (_err) => { // err can be Event or string
      reject(new Error('Failed to load image for conversion'));
    };
    img.src = dataUri;
  });
}

export function sanitizeFilename(name: string, maxLength: number = 50): string {
  // Remove special characters, replace spaces with underscores
  const sanitized = name
    .replace(/[^\w\s-]/gi, '') // Remove non-alphanumeric, non-space, non-hyphen
    .replace(/\s+/g, '_');    // Replace spaces with underscores
  // Truncate and ensure it's not empty
  let truncated = sanitized.substring(0, maxLength);
  // Remove trailing underscores that might result from truncation
  truncated = truncated.replace(/_+$/, ''); 
  return truncated || 'generated_image';
}