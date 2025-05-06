import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionServiceService {
  compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } else {
            reject('Impossible de créer le contexte du canvas.');
          }
        };
        img.onerror = () => reject('Erreur lors du chargement de l\'image.');
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject('Erreur lors de la lecture du fichier.');
      reader.readAsDataURL(file);
    });
  }
}
