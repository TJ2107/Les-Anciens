export const PROFILE_EMOJI_PRESETS = [
  '👨🏾‍💻',
  '👩🏾‍💻',
  '👨🏾‍💼',
  '👩🏾‍💼',
  '👩🏾‍⚕️',
  '👨🏾‍⚖️',
  '👨🏾‍🎓',
  '👩🏾‍🔬',
  '👩🏾‍🏫',
  '🎓',
];

export const compressProfilePhoto = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture impossible'));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Format invalide'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        const size = 320;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
