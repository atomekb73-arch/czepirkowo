'use client';

import React, { useState, useRef } from 'react';
import { convertToWebP } from '@/lib/imageOptimizer';
import { Product, ServicePriceItem } from '@/lib/types';
import { uploadProductWithWebP, deleteProduct, toggleProductStatus } from '@/lib/supabaseService';

interface AdminPanelProps {
  products?: Product[];
  services: ServicePriceItem[];
  onProductCreated: (newProduct: Product) => void;
  onProductDeleted?: (productId: string) => void;
  onProductStatusToggled?: (productId: string, isAvailable: boolean) => void;
  onUpdateServices: (services: ServicePriceItem[]) => void;
  onClose?: () => void;
}

export default function AdminPanel({
  products = [],
  services,
  onProductCreated,
  onProductDeleted,
  onProductStatusToggled,
  onUpdateServices,
  onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'product' | 'items' | 'pricing'>('product');

  // Stan dodawania produktu
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stats, setStats] = useState<{ orig: string; comp: string; ratio: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    category: 'Torby i Nerki' as Product['category'],
    dimensions: '',
    description: '',
  });

  // Stan edycji cennika
  const [localServices, setLocalServices] = useState<ServicePriceItem[]>(services);

  // In-app potwierdzenia i powiadomienia (zastępujące alert/confirm)
  const [deleteModal, setDeleteModal] = useState<{
    productId: string;
    imageUrl?: string;
    title: string;
  } | null>(null);

  const [deleteServiceIndex, setDeleteServiceIndex] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Proszę wybrać plik graficzny (JPG, PNG, HEIC).', 'error');
      return;
    }

    try {
      setIsUploading(true);
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
      showToast('Błąd podczas kompresji zdjęcia.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBlob || !preview) {
      showToast('Dodanie zdjęcia gotowego dzieła jest wymagane.', 'error');
      return;
    }

    try {
      setIsUploading(true);

      const savedProduct = await uploadProductWithWebP(
        {
          title: productForm.title,
          price: Number(productForm.price) || 0,
          category: productForm.category,
          dimensions: productForm.dimensions,
          description: productForm.description,
          isAvailable: true,
        },
        imageBlob
      );

      if (savedProduct) {
        onProductCreated(savedProduct);
        showToast(`✨ Unikat "${savedProduct.title}" został wystawiony w showroomie!`, 'success');

        setPreview(null);
        setImageBlob(null);
        setStats(null);
        setProductForm({
          title: '',
          price: '',
          category: 'Torby i Nerki',
          dimensions: '',
          description: '',
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Nie udało się zapisać produktu w bazie.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Wywołanie potwierdzonego usunięcia produktu
  const confirmDeleteProduct = async () => {
    if (!deleteModal) return;

    try {
      setUpdatingId(deleteModal.productId);
      await deleteProduct(deleteModal.productId, deleteModal.imageUrl);
      if (onProductDeleted) {
        onProductDeleted(deleteModal.productId);
      }
      showToast(`Unikat "${deleteModal.title}" został usunięty z bazy.`, 'info');
      setDeleteModal(null);
    } catch (err) {
      console.error(err);
      showToast('Nie udało się usunąć produktu z bazy.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean, title: string) => {
    try {
      setUpdatingId(productId);
      const nextStatus = !currentStatus;
      await toggleProductStatus(productId, nextStatus);
      if (onProductStatusToggled) {
        onProductStatusToggled(productId, nextStatus);
      }
      showToast(
        nextStatus ? `„${title}” oznaczony jako dostępny 🟢` : `„${title}” oznaczony jako sprzedany 🔴`,
        'info'
      );
    } catch (err) {
      console.error(err);
      showToast('Nie udało się zaktualizować statusu dostępności.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleServiceChange = (index: number, field: keyof ServicePriceItem, value: string) => {
    const updated = [...localServices];
    updated[index] = { ...updated[index], [field]: value };
    setLocalServices(updated);
  };

  const handleAddService = () => {
    setLocalServices([
      ...localServices,
      {
        name: 'Nowa usługa krawiecka',
        price: 'od 30 zł',
        turnaround: '48h',
        description: 'Opis nowej usługi.',
      },
    ]);
    showToast('Dodano nową pozycję do edytora cennika.', 'info');
  };

  const confirmDeleteService = () => {
    if (deleteServiceIndex === null) return;
    const removedName = localServices[deleteServiceIndex]?.name || 'Usługa';
    setLocalServices(localServices.filter((_, i) => i !== deleteServiceIndex));
    setDeleteServiceIndex(null);
    showToast(`Pozycja „${removedName}” została usunięta. Pamiętaj zapisać cennik.`, 'info');
  };

  const handleSaveServices = async () => {
    try {
      await onUpdateServices(localServices);
      showToast('✅ Cennik poprawek został pomyślnie zaktualizowany w bazie!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Nie udało się zapisać cennika w bazie.', 'error');
    }
  };

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-2xl border-2 border-stone-300 p-5 sm:p-8 max-w-2xl mx-auto">
      {/* In-app Toast Banner */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border-2 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-400'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-950 border-red-400'
                : 'bg-stone-900 text-stone-100 border-stone-700'
            }`}
          >
            <span className="text-base shrink-0">
              {toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100 font-bold px-1.5 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* In-app Modal Potwierdzenia Usunięcia Produktu */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border-2 border-stone-300 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center text-2xl border-2 border-red-200">
              🗑️
            </div>
            <div>
              <h3 className="font-serif font-black text-stone-950 text-xl">
                Usunąć ten unikat?
              </h3>
              <p className="text-xs font-medium text-stone-600 mt-2 leading-relaxed">
                Czy na pewno chcesz usunąć unikat <strong className="text-stone-950">&bdquo;{deleteModal.title}&rdquo;</strong>? 
                Przedmiot zniknie ze sklepu, a plik WebP zostanie skasowany z magazynu.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border-2 border-stone-300 hover:border-stone-400 font-bold text-xs text-stone-700 bg-stone-50 cursor-pointer transition-all"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={Boolean(updatingId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {updatingId ? 'Usuwanie...' : 'Tak, usuń'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Modal Potwierdzenia Usunięcia Pozycji Cennika */}
      {deleteServiceIndex !== null && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-stone-300 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-xl border border-amber-300">
              ✂️
            </div>
            <div>
              <h3 className="font-serif font-black text-stone-950 text-lg">
                Usunąć tę usługę?
              </h3>
              <p className="text-xs font-medium text-stone-600 mt-1">
                Pozycja &bdquo;{localServices[deleteServiceIndex]?.name}&rdquo; zostanie skasowana z listy.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteServiceIndex(null)}
                className="flex-1 py-2 px-3 rounded-xl border-2 border-stone-300 font-bold text-xs text-stone-700 bg-stone-50 cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={confirmDeleteService}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[11px] font-black text-amber-950 bg-amber-100 border border-amber-400 px-3 py-1 rounded-full uppercase tracking-wider">
            Zarządzanie Pracownią (Supabase Baza &amp; Storage)
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 mt-1.5">
            Kokpit Magdy
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-700 hover:text-black text-xs sm:text-sm font-bold p-2 border border-stone-300 rounded-lg cursor-pointer"
          >
            ✕ Zamknij
          </button>
        )}
      </div>

      {/* Zakładki kokpitu */}
      <div className="flex flex-wrap gap-2 border-b-2 border-stone-300 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('product')}
          className={`text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'product'
              ? 'bg-stone-950 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          📸 + Wystaw Unikat
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'items'
              ? 'bg-stone-950 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          📦 Wystawione Rzeczy ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-stone-950 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          ✂️ Cennik Poprawek
        </button>
      </div>

      {/* 1. Widok Dodawania Produktu */}
      {activeTab === 'product' && (
        <form onSubmit={handlePublishProduct} className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-400 hover:border-stone-950 bg-stone-50 rounded-2xl p-6 text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />

            {isUploading ? (
              <p className="text-amber-950 text-xs font-bold animate-pulse">
                Przetwarzanie i wysyłanie do Supabase Storage...
              </p>
            ) : preview ? (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Podgląd"
                  className="max-h-48 mx-auto rounded-xl shadow-md border border-stone-300 object-cover"
                />
                {stats && (
                  <div className="inline-block bg-emerald-100 text-emerald-950 border border-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                    WebP: {stats.orig} → {stats.comp} ({stats.ratio})
                  </div>
                )}
                <p className="text-xs font-semibold text-stone-600">Dotknij, by zmienić zdjęcie</p>
              </div>
            ) : (
              <div className="py-4 space-y-1">
                <div className="text-3xl">📷</div>
                <p className="text-sm font-bold text-stone-950">
                  Dotknij aparatu lub wybierz zdjęcie z telefonu
                </p>
                <p className="text-xs font-semibold text-stone-600">Autokompresja WebP &amp; chmura Supabase</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                Nazwa unikatowej rzeczy
              </label>
              <input
                type="text"
                required
                placeholder="np. Nerka Miejska Butelkowa Zieleń"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-semibold text-stone-950 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                Cena (zł)
              </label>
              <input
                type="number"
                required
                placeholder="159"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-black text-stone-950 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                Kategoria
              </label>
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    category: e.target.value as Product['category'],
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-semibold text-stone-950 bg-white"
              >
                <option value="Torby i Kufry">Torby i Kufry (Kuferek retro)</option>
                <option value="Torby &amp; Shopperki">Torby &amp; Shopperki</option>
                <option value="Torby &amp; Nerki">Torby &amp; Nerki</option>
                <option value="Akcesoria Zero Waste">Akcesoria Zero Waste (Scrunchies, kosmetyczki)</option>
                <option value="Dla Domu">Dla Domu (Poszewki lniane)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                Wymiary / Skład
              </label>
              <input
                type="text"
                placeholder="np. 32x18 cm, welur tapicerski"
                value={productForm.dimensions}
                onChange={(e) =>
                  setProductForm({ ...productForm, dimensions: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-semibold text-stone-950 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
              Krótki opis
            </label>
            <textarea
              rows={2}
              placeholder="np. Pojedynczy egzemplarz z ozdobną pasmanterią. Wytrzymała podszewka."
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-300 text-sm font-medium text-stone-950 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? 'Wysyłanie do Supabase...' : '✨ Wystaw do showroomu'}
          </button>
        </form>
      )}

      {/* 2. Widok Zarządzania Wystawionymi Rzeczami */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm">
              Wystawione unikaty ({products.length})
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">
              Zmiany zapisują się natychmiast w bazie Supabase
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300">
              <p className="text-sm font-semibold text-stone-600">Brak wystawionych produktów.</p>
              <button
                type="button"
                onClick={() => setActiveTab('product')}
                className="mt-3 text-xs bg-stone-950 text-white px-4 py-2 rounded-xl font-bold cursor-pointer"
              >
                + Wystaw pierwszy unikat
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/90 rounded-2xl border-2 border-stone-200 transition-all gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-stone-300 bg-stone-200 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-950 text-sm leading-snug">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="font-black text-stone-950 text-xs">
                          {item.price} zł
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="text-[11px] font-semibold text-stone-600">
                          {item.category}
                        </span>
                        <span className="text-stone-300">·</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : 'bg-stone-200 text-stone-700 border border-stone-300'
                          }`}
                        >
                          {item.isAvailable ? '🟢 Dostępne' : '🔴 Sprzedane'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                    {/* Przełącznik: Sprzedane / Dostępne */}
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleToggleStatus(item.id, item.isAvailable, item.title)}
                      className={`text-xs px-3 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                        item.isAvailable
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300'
                      }`}
                    >
                      {item.isAvailable ? 'Oznacz: Sprzedane' : 'Przywróć'}
                    </button>

                    {/* Przycisk: Usuń (otwiera dedykowany in-app dialog) */}
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        setDeleteModal({
                          productId: item.id,
                          imageUrl: item.imageUrl,
                          title: item.title,
                        })
                      }
                      className="text-xs px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-all cursor-pointer"
                    >
                      🗑️ Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Widok Edycji Cennika */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-stone-700">
            Zmieniaj ceny, czasy realizacji i nazwy usług. Zmiany zapiszą się w bazie i pojawią natychmiast na stronie.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {localServices.map((service, idx) => (
              <div
                key={idx}
                className="p-4 bg-stone-50 rounded-xl border-2 border-stone-300 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    className="font-bold text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setDeleteServiceIndex(idx)}
                    className="text-red-600 hover:text-red-800 font-bold px-2 py-1 cursor-pointer"
                    title="Usuń pozycję"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                      Cena (np. &quot;od 35 zł&quot;)
                    </label>
                    <input
                      type="text"
                      value={service.price}
                      onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                      Czas (np. &quot;24-48h&quot;)
                    </label>
                    <input
                      type="text"
                      value={service.turnaround}
                      onChange={(e) => handleServiceChange(idx, 'turnaround', e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                    Krótki opis
                  </label>
                  <input
                    type="text"
                    value={service.description || ''}
                    onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t-2 border-stone-300 flex gap-2">
            <button
              type="button"
              onClick={handleAddService}
              className="text-xs bg-white border-2 border-stone-400 hover:border-stone-900 text-stone-900 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              + Dodaj pozycję
            </button>
            <button
              type="button"
              onClick={handleSaveServices}
              className="flex-1 text-xs bg-stone-950 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              💾 Zapisz cennik w bazie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
