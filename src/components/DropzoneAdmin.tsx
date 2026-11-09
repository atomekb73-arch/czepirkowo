'use client';

import React, { useState, useRef } from 'react';
import { convertToWebP } from '@/lib/imageOptimizer';
import { Product } from '@/lib/types';

interface DropzoneAdminProps {
  onAddProduct?: (product: Product) => void;
}

export default function DropzoneAdmin({ onAddProduct }: DropzoneAdminProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stats, setStats] = useState<{ orig: string; comp: string; ratio: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'Torby i Nerki' as Product['category'],
    dimensions: '',
    description: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Wybierz plik graficzny (JPG, PNG, HEIC).');
      return;
    }

    try {
      setLoading(true);
      const res = await convertToWebP(file);
      setImageBlob(res.blob);
      setPreview(res.previewUrl);

      const origMB = (res.originalSize / (1024 * 1024)).toFixed(2);
      const compKB = (res.compressedSize / 1024).toFixed(0);
      const ratio = Math.round((1 - res.compressedSize / res.originalSize) * 100);

      setStats({
        orig: `${origMB} MB`,
        comp: `${compKB} KB (WebP)`,
        ratio: `${ratio}% lżejsze`,
      });
    } catch (err) {
      console.error(err);
      alert('Wystąpił problem z optymalizacją zdjęcia.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      alert('Dodanie zdjęcia gotowego dzieła jest wymagane.');
      return;
    }

    const newProduct: Product = {
      id: 'cz-' + Date.now().toString().slice(-4),
      title: form.title,
      price: Number(form.price) || 0,
      category: form.category,
      dimensions: form.dimensions,
      description: form.description,
      imageUrl: preview,
      isAvailable: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (onAddProduct) {
      onAddProduct(newProduct);
    }

    alert(`Gotowe! Unikat "${newProduct.title}" wystawiony w showroomie.`);

    setPreview(null);
    setImageBlob(null);
    setStats(null);
    setForm({
      title: '',
      price: '',
      category: 'Torby i Nerki',
      dimensions: '',
      description: '',
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-stone-200">
      <div className="mb-6">
        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Szybki Panel Magdy
        </span>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">
          Wystaw nową rzecz w 30 sekund
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Zrób zdjęcie telefonem, upuść tutaj – kompresja WebP wykona się sama.
        </p>
      </div>

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-amber-600 bg-amber-50/70 scale-[1.01]'
              : 'border-stone-300 hover:border-amber-700 bg-stone-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />

          {loading ? (
            <div className="py-8 space-y-2">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-amber-900 text-sm font-medium">
                Kompresja do Google WebP w toku...
              </p>
            </div>
          ) : preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Podgląd"
                className="max-h-56 mx-auto rounded-xl shadow-md object-cover"
              />
              {stats && (
                <div className="inline-block bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-semibold border border-emerald-200">
                  {stats.orig} → {stats.comp} ({stats.ratio})
                </div>
              )}
              <p className="text-xs text-stone-400">Kliknij, aby podmienić zdjęcie</p>
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <div className="text-4xl text-stone-300">📸</div>
              <p className="text-stone-800 font-medium text-sm">
                Upuść zdjęcie uszytej rzeczy
              </p>
              <p className="text-xs text-stone-400">
                lub kliknij, by wybrać z rolki aparatu
              </p>
            </div>
          )}
        </div>

        {/* Pola */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Nazwa unikatu
            </label>
            <input
              type="text"
              required
              placeholder="np. Nerka Miejska Butelkowa Zieleń"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Cena (zł)
            </label>
            <input
              type="number"
              required
              placeholder="np. 159"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm font-bold text-amber-900 bg-stone-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Kategoria
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm"
            >
              <option value="Torby i Nerki">Torby i Nerki (Wysoka marża)</option>
              <option value="Akcesoria Zero Waste">Akcesoria / Drobnica</option>
              <option value="Sukienki i Kimona">Sukienki / Kimona</option>
              <option value="Dla Domu">Dla Domu (Len, poduszki)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Wymiary / Skład
            </label>
            <input
              type="text"
              placeholder="np. 32x18 cm, welur tapicerski"
              value={form.dimensions}
              onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm bg-stone-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
            Opis dla klienta
          </label>
          <textarea
            rows={2}
            placeholder="np. Uszyte w 1 egzemplarzu z końcówki belek tapicerskich. Wodoodporna podszewka."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm resize-none bg-stone-50/50"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-stone-900/10 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>Wystaw od razu do Showroomu</span>
        </button>
      </form>
    </div>
  );
}
