'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ServicePriceItem } from '@/lib/types';
import { INITIAL_PRODUCTS, TAILOR_SERVICES } from '@/lib/mockData';
import { getProducts, getServices, saveServices } from '@/lib/supabaseService';
import AdminPanel from '@/components/AdminPanel';

function AdminContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServicePriceItem[]>(TAILOR_SERVICES);
  const [isLoading, setIsLoading] = useState(true);

  // Sprawdzenie tajnego klucza w URL np. /admin?key=czepirkowo
  useEffect(() => {
    const key = searchParams.get('key');
    if (key === 'czepirkowo' || key === 'magda') {
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProducts, loadedServices] = await Promise.all([
          getProducts(),
          getServices(),
        ]);
        setProducts(loadedProducts);
        setServices(loadedServices);
      } catch (err) {
        console.error('Błąd ładowania danych w panelu admina:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.toLowerCase() === 'czepirkowo' || pinInput.toLowerCase() === 'magda') {
      setIsAuthenticated(true);
    } else {
      alert('Nieprawidłowy PIN. Domyślny PIN pracowni: czepirkowo');
    }
  };

  const handleProductCreated = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
  };

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleProductStatusToggled = (productId: string, isAvailable: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable } : p))
    );
  };

  const handleUpdateServices = async (updatedServices: ServicePriceItem[]) => {
    setServices(updatedServices);
    await saveServices(updatedServices);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-2 border-stone-300 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-3xl font-bold border-2 border-amber-300">
            🔒
          </div>
          <div>
            <h2 className="font-serif font-black text-stone-950 text-2xl">Pracownia Magdy</h2>
            <p className="text-xs font-semibold text-stone-600 mt-1">
              Podaj PIN, aby zarządzać showroomem i cennikiem
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Wpisz PIN pracowni"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 text-sm font-bold text-center text-stone-950 bg-stone-50 focus:outline-none focus:border-stone-900"
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Wejdź do panelu
            </button>
          </form>

          <a
            href="/"
            className="block text-xs font-bold text-stone-500 hover:text-stone-900 underline pt-2"
          >
            ← Wróć do strony głównej dla klientów
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="text-xs font-bold text-stone-700 hover:text-black bg-white border-2 border-stone-300 px-3.5 py-2 rounded-xl shadow-xs"
          >
            ← Zobacz Showroom dla klientów
          </a>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl"
          >
            Wyloguj Magdę
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-bold text-stone-600">
            Ładowanie danych z bazy Supabase...
          </div>
        ) : (
          <AdminPanel
            products={products}
            services={services}
            onProductCreated={handleProductCreated}
            onProductDeleted={handleProductDeleted}
            onProductStatusToggled={handleProductStatusToggled}
            onUpdateServices={handleUpdateServices}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Ładowanie panelu...</div>}>
      <AdminContent />
    </Suspense>
  );
}
