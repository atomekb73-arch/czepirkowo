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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServicePriceItem[]>(TAILOR_SERVICES);
  const [isLoading, setIsLoading] = useState(true);

  // Bezpieczna weryfikacja sesji serwerowej przy wejściu
  useEffect(() => {
    async function checkAuthSession() {
      try {
        // 1. Sprawdź czy jest ważna sesja w ciasteczku HttpOnly
        const checkRes = await fetch('/api/admin/check', { cache: 'no-store' });
        const checkData = await checkRes.json();

        if (checkData.authenticated) {
          setIsAuthenticated(true);
          return;
        }

        // 2. Jeśli podano klucz w linku ?key=..., zweryfikuj go przez API
        const key = searchParams.get('key');
        if (key) {
          const authRes = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: key }),
          });
          const authData = await authRes.json();
          if (authData.success) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Błąd weryfikacji sesji:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthSession();
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinInput('');
      } else {
        setLoginError(data.error || 'Nieprawidłowy kod dostępu. Spróbuj ponownie.');
      }
    } catch {
      setLoginError('Wystąpił problem z połączeniem z serwerem autoryzacji.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Błąd wylogowania:', err);
    }
    setIsAuthenticated(false);
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-700">Weryfikacja bezpiecznej sesji pracowni...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-2 border-stone-300 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-3xl font-bold border-2 border-amber-300">
            🔒
          </div>
          <div>
            <h2 className="font-serif font-black text-stone-950 text-2xl">Pracownia Magdy</h2>
            <p className="text-xs font-semibold text-stone-600 mt-1">
              Podaj kod PIN, aby bezpiecznie zarządzać showroomem
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setLoginError(null);
              }}
              placeholder="Wpisz kod dostępu"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 text-sm font-bold text-center text-stone-950 bg-stone-50 focus:outline-none focus:border-stone-900"
            />

            {loginError && (
              <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 py-2 px-3 rounded-xl">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !pinInput}
              className="w-full py-3.5 bg-stone-950 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Weryfikacja...</span>
                </>
              ) : (
                <span>Wejdź do panelu</span>
              )}
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
            onClick={handleLogout}
            className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl cursor-pointer"
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
            onClose={handleLogout}
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
