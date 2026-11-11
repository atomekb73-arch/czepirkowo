'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, title, price, category, dimensions, imageUrl, images, isAvailable } = product;

  // Lista wszystkich ujęć unikatowej rzeczy (kasetonowa galeria)
  const gallery = images && images.length > 0 ? images : [imageUrl];
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDimExpanded, setIsDimExpanded] = useState(false);

  const phoneNumber = '48535277889'; // Numer Magdy w formacie międzynarodowym
  const buyMessage = encodeURIComponent(
    `Dzień dobry Magdo! Piszę ze strony Czepirkowo. Chcę zarezerwować unikat: "${title}" za ${price} zł (Kod: #${id}). Czy jest jeszcze dostępny?`
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${buyMessage}`;

  const currentHeroImg = gallery[activeIdx] || imageUrl;

  return (
    <>
      <article className="group bg-white rounded-3xl overflow-hidden border-2 border-stone-300 hover:border-stone-900 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
        {/* Kasetonowy moduł fotograficzny */}
        <div className="p-3 bg-stone-100/70 border-b-2 border-stone-200">
          <div className="flex gap-2.5">
            {/* GŁÓWNE ZDJĘCIE (HERO) */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative flex-1 aspect-[4/5] bg-stone-200 rounded-2xl overflow-hidden cursor-zoom-in group/hero shadow-xs"
              title="Stuknij, by powiększyć i obejrzeć detale"
            >
              <img
                src={currentHeroImg}
                alt={`${title} - widok ${activeIdx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover/hero:scale-105"
              />

              {/* Kategoria - wysoki kontrast i czytelność na każdym tle (jasnym i ciemnym) */}
              <div className="absolute top-2.5 left-2.5 bg-white/95 text-stone-950 border-2 border-stone-300 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-xs">
                {category}
              </div>

              {/* Plakietka dostępności - soczysty bursztyn z wyraźnym obrysem */}
              {isAvailable ? (
                <div className="absolute top-2.5 right-2.5 bg-amber-600 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full shadow-md border border-amber-400">
                  Tylko 1 sztuka
                </div>
              ) : (
                <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                  <span className="text-white font-black tracking-widest uppercase border-2 border-white px-3 py-1.5 rounded-xl text-xs shadow-lg">
                    Już u nowej właścicielki
                  </span>
                </div>
              )}

              {/* Dyskretna podpowiedź powiększenia */}
              <div className="absolute bottom-2.5 right-2.5 bg-stone-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover/hero:opacity-100 transition-opacity flex items-center gap-1">
                <span>🔍</span> Powiększ
              </div>
            </div>

            {/* Boczne miniatury (kasetony) - jeśli produkt ma więcej niż 1 zdjęcie */}
            {gallery.length > 1 && (
              <div className="w-14 sm:w-16 flex flex-col gap-2 shrink-0">
                {gallery.slice(0, 4).map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeIdx === idx
                        ? 'border-stone-950 ring-2 ring-amber-500/50 shadow-sm'
                        : 'border-stone-300 opacity-70 hover:opacity-100 hover:border-stone-600'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dodatkowe miniatury na dole (jeśli jest więcej niż 4 zdjęcia) */}
          {gallery.length > 4 && (
            <div className="flex gap-2 mt-2 pt-2 border-t border-stone-200">
              {gallery.slice(4).map((thumb, idx) => {
                const realIdx = idx + 4;
                return (
                  <button
                    key={realIdx}
                    type="button"
                    onClick={() => setActiveIdx(realIdx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeIdx === realIdx
                        ? 'border-stone-950 ring-2 ring-amber-500/50'
                        : 'border-stone-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Miniatura ${realIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dane produktu i rezerwacja WhatsApp */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-white">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-baseline gap-2">
              <h3 className="font-serif font-black text-stone-950 text-lg leading-snug group-hover:text-amber-950 transition-colors">
                {title}
              </h3>
              <span className="text-xl font-black text-stone-950 whitespace-nowrap">
                {price} zł
              </span>
            </div>

            {/* SEKCJA 1: WYMIARY / ROZMIARÓWKA (ROZWIJANA) */}
            {dimensions && (
              <div 
                onClick={() => setIsDimExpanded(!isDimExpanded)}
                className="cursor-pointer group mb-2 bg-stone-50 hover:bg-stone-100 p-2.5 rounded-xl border border-stone-200/80 transition-colors"
                title="Stuknij, aby rozwinąć / zwinąć pełne wymiary"
              >
                <div className="flex items-start gap-1.5 text-xs text-stone-700">
                  <span className="shrink-0 text-sm">📏</span>
                  <div className="flex-1 min-w-0">
                    <div className={`transition-all leading-relaxed ${isDimExpanded ? '' : 'line-clamp-1'}`}>
                      <span className="font-bold text-stone-900">Wymiary / Rozmiar: </span>
                      <span className="text-stone-700">{dimensions}</span>
                    </div>
                    {dimensions.length > 35 && (
                      <span className="text-[10px] text-amber-800 font-bold block mt-0.5 group-hover:underline">
                        {isDimExpanded ? '▲ Zwiń wymiary' : '▼ Zobacz pełne wymiary i skład'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEKCJA 2: PEŁNY OPIS PRODUKTU (ROZWIJANY) */}
            {product.description && (
              <div 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="cursor-pointer text-xs text-stone-700 leading-relaxed mb-3"
                title="Stuknij, aby przeczytać cały opis"
              >
                <p className={`transition-all ${isDescExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}`}>
                  {product.description}
                </p>
                {product.description.length > 60 && (
                  <button 
                    type="button"
                    className="text-[11px] font-bold text-stone-900 underline underline-offset-2 mt-1 block hover:text-amber-900 cursor-pointer"
                  >
                    {isDescExpanded ? 'Zwiń opis' : '...czytaj cały opis'}
                  </button>
                )}
              </div>
            )}
          </div>

          {isAvailable ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <span className="text-base">💬</span>
              <span>Rezerwuję przez WhatsApp</span>
            </a>
          ) : (
            <div className="w-full py-2.5 px-4 bg-stone-100 border border-stone-200 text-stone-500 rounded-xl font-bold text-xs text-center cursor-not-allowed">
              Wzór sprzedany · Zapytaj o podobny
            </div>
          )}
        </div>
      </article>

      {/* PEŁNOEKRANOWY LIGHTBOX (Oglądanie detali: szew, splot tkaniny, zamek) */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Pasek górny lightboxa */}
          <div
            className="flex items-center justify-between text-white max-w-5xl mx-auto w-full pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="font-serif font-black text-lg sm:text-xl text-amber-100">{title}</h4>
              <p className="text-xs text-stone-400">
                Ujęcie {activeIdx + 1} z {gallery.length} · Dotknij miniatury, by zmienić kadr
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-white font-bold text-sm border border-stone-700 cursor-pointer"
              title="Zamknij podgląd (ESC)"
            >
              ✕ Zamknij
            </button>
          </div>

          {/* Główne powiększone zdjęcie */}
          <div
            className="flex-1 flex items-center justify-center relative my-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentHeroImg}
              alt={title}
              className="max-h-[70vh] sm:max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain border border-stone-800"
            />

            {/* Strzałki nawigacji */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))
                  }
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-lg border border-stone-700 cursor-pointer shadow-lg"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-lg border border-stone-700 cursor-pointer shadow-lg"
                >
                  ▶
                </button>
              </>
            )}
          </div>

          {/* Pasek dolny z miniaturami i szybką rezerwacją */}
          <div
            className="max-w-3xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 overflow-x-auto max-w-full py-1">
              {gallery.map((thumb, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                    activeIdx === idx
                      ? 'border-amber-400 ring-2 ring-amber-400'
                      : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt={`Kadr ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {isAvailable && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>💬</span>
                <span>Rezerwuję ten unikat ({price} zł)</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
