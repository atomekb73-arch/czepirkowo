export interface ConvertToWebPOptions {
  removeBg?: boolean;
  bgColor?: string; // Domyślnie ciepłe tło strony: #FAF8F5
  onProgress?: (message: string) => void;
}

export async function convertToWebP(
  file: File | Blob,
  maxWidth = 1200,
  quality = 0.82,
  options?: ConvertToWebPOptions
): Promise<{ blob: Blob; previewUrl: string; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;
  let sourceBlob: Blob = file;

  // 2. Opcjonalne usunięcie tła (dla pojedynczych skrawków tkanin) za pomocą @imgly/background-removal
  if (options?.removeBg) {
    try {
      options.onProgress?.('✨ Przygotowuję model usuwania tła...');
      const { removeBackground } = await import('@imgly/background-removal');
      options.onProgress?.('✨ Wycinam tło ze skrawka chusty (AI)...');

      sourceBlob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (options.onProgress && total > 0) {
            const pct = Math.round((current / total) * 100);
            options.onProgress(`✨ Wycinanie tła ze skrawka: ${pct}%`);
          }
        },
        output: {
          format: 'image/png',
          quality: 0.95,
        },
      });
    } catch (bgErr) {
      console.warn('Nie udało się usunąć tła ze zdjęcia, używam oryginału:', bgErr);
      options?.onProgress?.('⚠️ Błąd usuwania tła – przetwarzam oryginał...');
    }
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(sourceBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Proporcjonalne skalowanie w dół dla optymalnej wielkości showroomu
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Nie udało się utworzyć kontekstu Canvas'));
        return;
      }

      // Jeśli wycięto tło, osadzamy wycięty materiał na jednolitym, ciepłym tle strony (#FAF8F5)
      if (options?.removeBg) {
        ctx.fillStyle = options.bgColor || '#FAF8F5';
        ctx.fillRect(0, 0, width, height);
      }

      // 1. Automatyczne „Podkręcenie studyjne” zdjęć (HTML5 Canvas)
      // Przed zapisem obrazu na canvas: delikatne rozjaśnienie, podbicie kontrastu i nasycenia dla zdjęć przy oknie
      try {
        ctx.filter = 'brightness(1.06) contrast(1.05) saturate(1.04)';
      } catch {
        // Pominięcie w przypadku braku wsparcia ctx.filter w starszych silnikach
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Błąd konwersji do WebP'));
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          resolve({
            blob,
            previewUrl,
            originalSize,
            compressedSize: blob.size,
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
