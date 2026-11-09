'use client';

import React from 'react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, title, price, category, dimensions, imageUrl, isAvailable } = product;
  const phoneNumber = '48535277889'; // Numer Magdy w formacie międzynarodowym

  const buyMessage = encodeURIComponent(
    `Dzień dobry Magdo! Piszę ze strony Czepirkowo. Chcę zarezerwować unikat: "${title}" za ${price} zł (Kod: #${id}). Czy jest jeszcze dostępny?`
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${buyMessage}`;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-700/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-stone-100 text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {category}
        </div>
        {isAvailable ? (
          <div className="absolute top-3 right-3 bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
            Tylko 1 sztuka
          </div>
        ) : (
          <div className="absolute inset-0 bg-stone-900/65 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold tracking-widest uppercase border border-white/40 bg-black/20 px-4 py-2 rounded-xl text-xs">
              Już u nowej właścicielki
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-snug group-hover:text-amber-900 transition-colors">
              {title}
            </h3>
            <span className="text-xl font-bold text-amber-900 whitespace-nowrap">
              {price} zł
            </span>
          </div>
          {dimensions && (
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <span className="text-stone-400">📏</span> {dimensions}
            </p>
          )}
          {product.description && (
            <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {isAvailable ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-[0.99]"
          >
            <span>💬</span>
            <span>Rezerwuję przez WhatsApp</span>
          </a>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-stone-100 text-stone-400 rounded-xl font-medium text-xs cursor-not-allowed"
          >
            Wzór sprzedany (zapytaj o podobny)
          </button>
        )}
      </div>
    </article>
  );
}
