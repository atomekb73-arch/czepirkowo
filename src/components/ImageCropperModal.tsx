'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperModalProps {
  imageSrc: string;
  onSave: (blob: Blob, previewUrl: string) => void;
  onClose: () => void;
}

type AspectRatioType = '4:5' | '1:1' | '3:4';

export default function ImageCropperModal({
  imageSrc,
  onSave,
  onClose,
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('4:5');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      // Reset transform on new image
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
  }, [imageSrc]);

  const getAspectNumeric = useCallback(() => {
    if (aspectRatio === '4:5') return 4 / 5; // 0.8 (pion)
    if (aspectRatio === '1:1') return 1; // kwadrat
    if (aspectRatio === '3:4') return 3 / 4; // 0.75
    return 4 / 5;
  }, [aspectRatio]);

  // Obsługa myszy / dotyku (przeciąganie zdjęcia w kadrze)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...offset };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: initialOffsetRef.current.x + dx,
      y: initialOffsetRef.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Pinch-to-zoom na ekranie dotykowym
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newZoom = Math.min(Math.max(initialZoomRef.current * ratio, 1), 3);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  // Eksport wykadrowanego obszaru do Canvas i WebP
  const handleApplyCrop = async () => {
    const img = imgRef.current;
    if (!img) return;

    try {
      setIsProcessing(true);

      const targetAspect = getAspectNumeric();
      // Docelowa rozdzielczość kadru wyjściowego (np. 1200 x 1500 dla 4:5 lub 1200 x 1200 dla 1:1)
      const outWidth = 1200;
      const outHeight = Math.round(outWidth / targetAspect);

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Nie udało się utworzyć kontekstu Canvas');

      // Tło w kolorze ciepłej kości słoniowej, gdyby krawędź wystawała
      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, outWidth, outHeight);

      ctx.save();

      // Przesuń środek do środka płótna
      ctx.translate(outWidth / 2, outHeight / 2);

      // Kąt obrotu
      const rad = (rotation * Math.PI) / 180;
      ctx.rotate(rad);

      // Wymiary z uwzględnieniem obrotu
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const naturalW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const naturalH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      // Skala bazowa tak, aby zdjęcie pokryło kadr (cover)
      const baseScale = Math.max(outWidth / naturalW, outHeight / naturalH);
      const finalScale = baseScale * zoom;

      // Przeliczenie przesunięcia z pikseli kontenera na piksele wyjściowego canvasu
      // Kontener na ekranie ma określoną szerokość i wysokość
      const containerBox = containerRef.current?.getBoundingClientRect();
      const containerW = containerBox?.width || 300;
      const containerH = containerBox?.height || Math.round(300 / targetAspect);

      const scaleFactor = outWidth / containerW;
      const drawOffsetX = offset.x * scaleFactor;
      const drawOffsetY = offset.y * scaleFactor;

      // Obliczenie wektora przesunięcia względem obrotu
      // Przesunięcie translacji zależnie od obrotu:
      if (rotation === 0) {
        ctx.translate(drawOffsetX, drawOffsetY);
      } else if (rotation === 90) {
        ctx.translate(drawOffsetY, -drawOffsetX);
      } else if (rotation === 180) {
        ctx.translate(-drawOffsetX, -drawOffsetY);
      } else if (rotation === 270) {
        ctx.translate(-drawOffsetY, drawOffsetX);
      }

      // Rysowanie z wyśrodkowaniem
      const rawDrawW = img.naturalWidth * finalScale;
      const rawDrawH = img.naturalHeight * finalScale;

      ctx.drawImage(
        img,
        -rawDrawW / 2,
        -rawDrawH / 2,
        rawDrawW,
        rawDrawH
      );

      ctx.restore();

      // Konwersja do WebP z wysoką jakością (0.86)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert('Wystąpił błąd podczas generowania kadru.');
            setIsProcessing(false);
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          onSave(blob, previewUrl);
          setIsProcessing(false);
          onClose();
        },
        'image/webp',
        0.86
      );
    } catch (err) {
      console.error('Błąd kadrowania:', err);
      alert('Nie udało się wykadrować zdjęcia.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Pasek górny z tytułem i zamknięciem */}
      <div className="w-full max-w-md flex items-center justify-between text-white pb-2 border-b border-stone-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
            Kadrownik Mobilny Magdy
          </span>
          <h3 className="font-serif font-black text-base sm:text-lg text-stone-100 mt-0.5">
            Wykadruj i obróć zdjęcie
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-white p-2 text-xl font-bold rounded-lg cursor-pointer transition-colors"
          title="Zamknij"
        >
          ✕
        </button>
      </div>

      {/* Środkowy obszar roboczy z maską kadru */}
      <div className="relative flex-1 w-full max-w-md flex items-center justify-center overflow-hidden my-2">
        {/* Okno kadrowania (Viewfinder) */}
        <div
          ref={containerRef}
          style={{
            aspectRatio: getAspectNumeric().toString(),
            maxHeight: '62vh',
            maxWidth: '92vw',
          }}
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/80 bg-stone-900 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Siatka pomocnicza trójpodziału (Rule of Thirds) */}
          <div className="absolute inset-0 pointer-events-none z-20 grid grid-cols-3 grid-rows-3 border border-amber-400/30">
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-b border-white/20"></div>
            <div className="border-r border-white/20"></div>
            <div className="border-r border-white/20"></div>
            <div></div>
          </div>

          {/* Podpowiedź dla Magdy */}
          <div className="absolute top-2 left-2 z-20 bg-stone-950/70 backdrop-blur-xs text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none border border-stone-800">
            👆 Przesuń palcem lub przybliż
          </div>

          {/* Rzeczywisty podgląd zdjęcia podlegający transformacji */}
          {imageLoaded && (
            <div
              className="pointer-events-none transition-transform duration-75 origin-center will-change-transform"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
              }}
            >
              <img
                src={imageSrc}
                alt="Podgląd do kadrowania"
                className="max-w-none pointer-events-none block"
                style={{
                  maxHeight: '70vh',
                  maxWidth: '85vw',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dolny panel narzędzi: Proporcje, Powiększenie, Obrót i Zapis */}
      <div className="w-full max-w-md bg-stone-900/95 border border-stone-800 rounded-3xl p-3.5 sm:p-4 space-y-3 text-stone-200 shadow-2xl">
        {/* Wybór formatu (4:5, 1:1, 3:4) */}
        <div className="flex items-center justify-between gap-1.5 text-xs font-bold">
          <span className="text-[11px] text-stone-400 font-medium">Format:</span>
          <div className="flex gap-1.5 flex-1 justify-end">
            <button
              type="button"
              onClick={() => {
                setAspectRatio('4:5');
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                aspectRatio === '4:5'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              4:5 (Showroom)
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectRatio('1:1');
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              1:1 (Kwadrat)
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectRatio('3:4');
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                aspectRatio === '3:4'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              3:4 (Portret)
            </button>
          </div>
        </div>

        {/* Pasek powiększenia (Zoom) i przycisk obrotu */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 font-bold shrink-0">🔍 Zoom:</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-amber-500 cursor-pointer h-2 bg-stone-700 rounded-lg"
          />
          <span className="text-[11px] font-mono text-stone-300 w-10 text-right font-bold">
            {zoom.toFixed(1)}x
          </span>

          <button
            type="button"
            onClick={handleRotate}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Obróć o 90 stopni"
          >
            🔄 {rotation}°
          </button>
        </div>

        {/* Przyciski Akcji: Anuluj / Zatwierdź Kadr */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-3 rounded-xl border border-stone-700 hover:border-stone-500 bg-stone-800 text-stone-300 font-bold text-xs cursor-pointer transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageLoaded}
            className="flex-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-950/40 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Zapisuję WebP...</span>
              </>
            ) : (
              <>
                <span>✂️ Zatwierdź kadr</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
