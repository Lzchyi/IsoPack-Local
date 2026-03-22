export const compressImage = (file: File, maxWidth = 800, quality = 0.5): Promise<File> => {
  console.log('Compressing image...', { name: file.name, size: file.size, type: file.type });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let newWidth = img.width;
        let newHeight = img.height;
        if (img.width > maxWidth) {
          newHeight = (img.height * maxWidth) / img.width;
          newWidth = maxWidth;
        }
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Canvas context failed');
          return reject(new Error('Canvas context failed'));
        }
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
            console.log('Compression complete', { original: file.size, compressed: compressedFile.size });
            resolve(compressedFile);
          } else {
            console.error('Blob conversion failed');
            reject(new Error('Blob conversion failed'));
          }
        }, 'image/jpeg', quality); 
      };
      img.onerror = () => {
        console.error('Image load failed');
        reject(new Error('Image load failed'));
      };
    };
    reader.onerror = error => {
      console.error('FileReader error', error);
      reject(error);
    };
  });
};
