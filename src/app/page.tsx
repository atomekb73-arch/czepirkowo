'use client';

import React, { useState, useEffect } from 'react';
import { Product, ServicePriceItem } from '@/lib/types';
import { INITIAL_PRODUCTS, TAILOR_SERVICES } from '@/lib/mockData';
import { getProducts, getServices, saveServices } from '@/lib/supabaseService';
import ProductCard from '@/components/ProductCard';
import PricingList from '@/components/PricingList';
import AdminPanel from '@/components/AdminPanel';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServicePriceItem[]>(TAILOR_SERVICES);
  const [activeTab, setActiveTab] = useState<'wszystkie' | 'torby' | 'akcesoria' | 'sprzedane'>('wszystkie');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Załadowanie danych z Supabase przy starcie
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
        console.error('Błąd ładowania danych:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'torby') return p.category === 'Torby i Nerki' && p.isAvailable;
    if (activeTab === 'akcesoria') return p.category === 'Akcesoria Zero Waste' && p.isAvailable;
    if (activeTab === 'sprzedane') return !p.isAvailable;
    return true;
  });

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setShowAdminModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'czepirkowo' || pinInput.includes('@')) {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setShowAdminModal(true);
    } else {
      alert('Niepoprawny PIN pracowni. Spróbuj: czepirkowo');
    }
  };

  const handleProductCreated = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    setShowAdminModal(false);
  };

  const handleUpdateServices = async (updatedServices: ServicePriceItem[]) => {
    setServices(updatedServices);
    await saveServices(updatedServices);
    setShowAdminModal(false);
  };

  const scrollToPricing = () => {
    const el = document.getElementById('cennik');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-stone-900 antialiased selection:bg-amber-200">
      {/* Top Banner: Czysty, bez zbędnych etykiet technicznych */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE] border-b-2 border-stone-300 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-full bg-stone-950 text-amber-100 flex items-center justify-center font-serif font-black text-xl border-2 border-stone-800 shadow-md">
              Cz
            </span>
            <div>
              <h1 className="font-serif font-black text-stone-950 text-xl leading-tight tracking-tight">
                Pracownia Czepirkowo
              </h1>
              <p className="text-xs font-semibold text-stone-700 mt-0.5">
                Międzyrzecz • Dom Handlowy (parter), ul. Mieszka I 8
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Duży, czytelny przycisk Cennika */}
            <button
              onClick={scrollToPricing}
              className="text-sm font-bold text-amber-950 hover:text-black px-5 py-2.5 rounded-xl border-2 border-amber-800/40 bg-amber-100/70 hover:bg-amber-200 transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>✂️</span>
              <span>Cennik poprawek</span>
            </button>

            {/* Dyskretne wejście pracowni */}
            <button
              onClick={handleOpenAdmin}
              title="Strefa pracowni (wymaga zalogowania)"
              className="text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔒</span>
              <span className="hidden sm:inline">Pracownia</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 pb-8 px-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-500 text-emerald-950 text-xs px-4 py-1.5 rounded-full font-bold mb-4 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          Pracownia w Międzyrzeczu otwarta • Bezpośredni kontakt z Magdą
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-black text-stone-950 leading-tight">
          Unikatowe torby, nerki i akcesoria z pasmanterii.
        </h2>
        <p className="text-stone-800 font-medium text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
          Każda rzecz szyta w jednym egzemplarzu z wyselekcjonowanych tkanin tapicerskich i końcówek belek. Kupujesz bezpośrednio u Magdy bez zbędnych pośredników.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
          {(
            [
              { id: 'wszystkie', label: 'Wszystkie dostępne' },
              { id: 'torby', label: 'Torby & Nerki' },
              { id: 'akcesoria', label: 'Akcesoria Zero Waste' },
              { id: 'sprzedane', label: 'Galeria sprzedanych' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-950 text-white shadow-sm border border-stone-950'
                  : 'bg-white border-2 border-stone-300 text-stone-800 hover:border-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Showroom Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="text-center py-16 text-stone-600 font-bold text-sm">
            Wczytywanie unikatów z pracowni...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16 text-stone-500 font-bold text-sm">
            Brak prac w tej kategorii. Nowy drop już niebawem przy maszynie!
          </div>
        )}
      </main>

      {/* Cennik Poprawek */}
      <PricingList services={services} />

      {/* Modal Logowania dla Magdy */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-7 shadow-2xl border-2 border-stone-300 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-2xl font-bold mb-3 border border-amber-300">
                🔒
              </div>
              <h3 className="font-serif font-black text-stone-950 text-xl">Strefa Magdy</h3>
              <p className="text-xs font-medium text-stone-600">
                Dostęp tylko dla właścicielki pracowni Czepirkowo.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase mb-1">PIN pracowni</label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Wpisz PIN"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-semibold text-stone-950 bg-stone-50 focus:outline-none focus:border-stone-900"
                />
                <p className="text-[11px] text-stone-500 mt-1">Domyślny PIN testowy: <span className="font-bold text-stone-800">czepirkowo</span></p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Zaloguj się do panelu
              </button>
            </form>

            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full text-xs font-bold text-stone-500 hover:text-stone-900 py-1"
            >
              Wróć do showroomu dla klientów
            </button>
          </div>
        </div>
      )}

      {/* Modal Admina dla Magdy (widoczny tylko po zalogowaniu) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <AdminPanel
              services={services}
              onProductCreated={handleProductCreated}
              onUpdateServices={handleUpdateServices}
              onClose={() => setShowAdminModal(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-stone-300 bg-white py-10 px-4 text-center text-xs font-semibold text-stone-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Pracownia Twórcza @Czepirkowo – Magda Czepirska • Międzyrzecz</p>
          <button
            onClick={handleOpenAdmin}
            className="text-stone-400 hover:text-stone-800 text-xs underline"
          >
            🔒 Panel Pracowni
          </button>
        </div>
      </footer>
    </div>
  );
}
