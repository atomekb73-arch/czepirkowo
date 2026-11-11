'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ServicePriceItem } from '@/lib/types';
import { INITIAL_PRODUCTS, TAILOR_SERVICES } from '@/lib/mockData';
import { getProducts, getServices, saveServices } from '@/lib/supabaseService';
import ProductCard from '@/components/ProductCard';
import PricingList from '@/components/PricingList';
import AdminPanel from '@/components/AdminPanel';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServicePriceItem[]>(TAILOR_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('wszystkie');
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

  // Filar 2: Dynamiczne filtry generowane automatycznie z bazy produktów (zabezpieczone przed spacjami i duplikatami)
  const dynamicCategories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      if (p.isAvailable && p.category) {
        let cat = p.category.trim();
        // Normalizacja synonimów i pisowni (np. "Torby i Nerki" vs "Torby & Nerki")
        if (cat.toLowerCase() === 'torby i nerki' || cat.toLowerCase() === 'torby & nerki') {
          cat = 'Torby & Nerki';
        } else if (cat.toLowerCase() === 'torby i kufry' || cat.toLowerCase() === 'torby & kufry') {
          cat = 'Torby & Kufry';
        }
        map.set(cat, (map.get(cat) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  const availableCount = products.filter((p) => p.isAvailable).length;
  const soldCount = products.filter((p) => !p.isAvailable).length;

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'sprzedane') {
      return !p.isAvailable;
    }
    if (selectedCategory === 'wszystkie') {
      return p.isAvailable;
    }
    let pCat = (p.category || '').trim();
    if (pCat.toLowerCase() === 'torby i nerki' || pCat.toLowerCase() === 'torby & nerki') {
      pCat = 'Torby & Nerki';
    } else if (pCat.toLowerCase() === 'torby i kufry' || pCat.toLowerCase() === 'torby & kufry') {
      pCat = 'Torby & Kufry';
    }
    return p.isAvailable && pCat.toLowerCase() === selectedCategory.trim().toLowerCase();
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
    setShowAdminModal(false);
  };

  const scrollToPricing = () => {
    const el = document.getElementById('cennik');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const customOrderMessage = encodeURIComponent(
    'Dzień dobry Magdo! Piszę ze strony Czepirkowo. Chcę skonsultować zamówienie indywidualne (szycie na miarę / z własnym pomysłem). Mój zamysł to...'
  );
  const customOrderWaUrl = `https://wa.me/48535277889?text=${customOrderMessage}`;

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-stone-900 antialiased selection:bg-amber-200">
      {/* Top Banner: Górna belka */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-xs border-b-2 border-stone-300 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-stone-950 text-amber-100 flex items-center justify-center font-serif font-black text-base sm:text-xl border-2 border-stone-800 shadow-md shrink-0">
              Cz
            </span>
            <div className="min-w-0">
              <h1 className="font-serif font-black text-stone-950 text-base sm:text-xl leading-tight tracking-tight truncate">
                Pracownia Czepirkowo
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-stone-600 sm:text-stone-700 mt-0.5 truncate">
                Międzyrzecz · Rzemiosło &amp; Pasmanteria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Przycisk Cennika - kompaktowy na mobile ("✂️ Cennik"), pełny na desktopie */}
            <button
              onClick={scrollToPricing}
              className="text-xs sm:text-sm font-bold text-amber-950 hover:text-black px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-amber-800/40 bg-amber-100/70 hover:bg-amber-200 transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span className="text-sm sm:text-base">✂️</span>
              <span>Cennik<span className="hidden sm:inline"> poprawek</span></span>
            </button>

            {/* Dyskretne wejście pracowni - kłódka na mobile, kłódka + napis na tablet/desktop */}
            <button
              onClick={handleOpenAdmin}
              title="Strefa pracowni (wymaga zalogowania)"
              aria-label="Panel pracowni"
              className="w-9 h-9 sm:w-auto sm:h-auto text-xs font-bold p-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-all shadow-xs bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="text-sm">🔒</span>
              <span className="hidden md:inline">Pracownia</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 pb-8 px-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-500 text-emerald-950 text-xs px-4 py-1.5 rounded-full font-bold mb-4 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          Pracownia w Międzyrzeczu · Szybka wysyłka lub odbiór osobisty po umówieniu
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-black text-stone-950 leading-tight">
          Unikatowe torby, nerki i akcesoria z pasmanterii.
        </h2>
        <p className="text-stone-800 font-medium text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
          Każda rzecz szyta w jednym egzemplarzu z wyselekcjonowanych tkanin tapicerskich i końcówek belek. Kupujesz bezpośrednio u Magdy bez pośredników i marż sklepowych.
        </p>

        {/* Filar 2: Dynamiczne filtry (Kategorie, które tworzą się same z bazy) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
          {/* Zawsze widoczna baza 1: Wszystkie dostępne */}
          <button
            type="button"
            onClick={() => setSelectedCategory('wszystkie')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
              selectedCategory === 'wszystkie'
                ? 'bg-stone-950 text-white shadow-sm border border-stone-950'
                : 'bg-white border-2 border-stone-300 text-stone-800 hover:border-stone-900'
            }`}
          >
            Wszystkie dostępne ({availableCount})
          </button>

          {/* Dynamicznie generowane przyciski asortymentu z bazy */}
          {dynamicCategories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`text-xs px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-stone-950 text-white shadow-sm border border-stone-950'
                  : 'bg-white border-2 border-stone-300 text-stone-800 hover:border-stone-900'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}

          {/* Zawsze widoczna baza 2: Galeria sprzedanych (Social Proof) */}
          <button
            type="button"
            onClick={() => setSelectedCategory('sprzedane')}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
              selectedCategory === 'sprzedane'
                ? 'bg-stone-950 text-white shadow-sm border border-stone-950'
                : 'bg-white border-2 border-stone-300 text-stone-800 hover:border-stone-900'
            }`}
          >
            Galeria sprzedanych ({soldCount})
          </button>
        </div>
      </section>

      {/* Showroom Grid (Filar 2: Kasetonowa galeria produktu z pełnoekranowym Lightboxem) */}
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
          <div className="text-center py-16 text-stone-500 font-bold text-sm bg-white rounded-3xl border-2 border-dashed border-stone-300 p-8 my-6">
            Brak prac w tej kategorii. Nowy drop już niebawem przy maszynie!
          </div>
        )}
      </main>

      {/* FILAR 1: STRUMIEŃ 3 - ZLECENIA NA MIARĘ & KONFIGURATOR WHATSAPP */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-[#2D241E] via-[#241D17] to-stone-950 text-stone-100 rounded-3xl p-7 sm:p-12 shadow-2xl border-2 border-amber-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-3.5 py-1 rounded-full font-black uppercase tracking-wider mb-4">
              Strumień 3 · Szycie na zamówienie
            </span>

            <h3 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
              Masz własny pomysł lub tkaninę? Uszyjmy to na miarę.
            </h3>

            <p className="text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
              Nie znalazłaś idealnego wymiaru w showroomie? Masz sentymentalną tkaninę, własny materiał lub szukasz kuferka w konkretnej kolorystyce? Magda realizuje autorskie zamówienia indywidualne.
            </p>

            {/* Trzy proste kroki rzemieślnicze - wysoki kontrast i czytelność */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-amber-900/40">
              <div className="bg-[#3A2E26] p-4.5 rounded-2xl border-2 border-amber-500/50 shadow-md">
                <span className="text-amber-300 font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span>✂️</span> 1. Projekt
                </span>
                <p className="text-xs text-stone-100 font-medium mt-1.5 leading-relaxed">
                  Wysyłasz zdjęcie inspiracji, wymiary lub omawiasz pomysł przez WhatsApp.
                </p>
              </div>

              <div className="bg-[#3A2E26] p-4.5 rounded-2xl border-2 border-amber-500/50 shadow-md">
                <span className="text-amber-300 font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span>⚡</span> 2. Zadatek 50%
                </span>
                <p className="text-xs text-stone-100 font-medium mt-1.5 leading-relaxed">
                  Jasna wycena robocizny, szybki przelew BLIK na numer telefonu i start szycia.
                </p>
              </div>

              <div className="bg-[#3A2E26] p-4.5 rounded-2xl border-2 border-amber-500/50 shadow-md">
                <span className="text-amber-300 font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span>🧵</span> 3. Realizacja
                </span>
                <p className="text-xs text-stone-100 font-medium mt-1.5 leading-relaxed">
                  Zdjęcia z postępów przy maszynie, odbiór osobisty w Międzyrzeczu lub Paczkomat.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={customOrderWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <span>💬</span>
                <span>Skonsultuj projekt z Magdą na WhatsApp (+48 535 277 889)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cennik Poprawek (Filar 1: Strumień 2 - Lokalny Cashflow) */}
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
              products={products}
              services={services}
              onProductCreated={handleProductCreated}
              onProductDeleted={handleProductDeleted}
              onProductStatusToggled={handleProductStatusToggled}
              onUpdateServices={handleUpdateServices}
              onClose={() => setShowAdminModal(false)}
            />
          </div>
        </div>
      )}

      {/* Oficjalna Stopka Firmowa */}
      <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="text-white font-bold text-base mb-3 font-serif">Pracownia Twórcza @czepirkowo</h4>
            <p className="text-stone-400 leading-relaxed">
              Autorskie rękodzieło, unikatowe torby i akcesoria tworzone w pojedynczych egzemplarzach.
            </p>
            <p className="text-stone-400 mt-2 font-mono text-xs">NIP: 596-164-79-23</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-3 font-serif">Kontakt &amp; Zamówienia</h4>
            <ul className="space-y-2">
              <li>
                <a href="tel:+48535277889" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span>📞</span> +48 535 277 889
                </a>
              </li>
              <li>
                <a href="mailto:czepirkowo@gmail.com" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span>✉️</span> czepirkowo@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/czepirkowo" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-300 transition-colors flex items-center gap-2"
                >
                  <span>📸</span> Instagram: @czepirkowo
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/48535277889" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 font-bold"
                >
                  <span>💬</span> WhatsApp: +48 535 277 889
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-3 font-serif">Adres Korespondencyjny</h4>
            <p className="text-stone-400 leading-relaxed">
              Magda Czepirska<br />
              Skrytka Pocztowa 87<br />
              ul. 30 Stycznia 8<br />
              66-300 Międzyrzecz
            </p>
            <p className="text-xs text-stone-400 mt-3 bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              📍 Odbiór zamówień w Międzyrzeczu po uzgodnieniu telefonicznym lub szybka wysyłka (Paczkomat / Kurier).
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-stone-800 text-xs text-stone-500 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Pracownia Twórcza @czepirkowo Magda Czepirska. Wszelkie prawa zastrzeżone.</p>
          <button
            onClick={handleOpenAdmin}
            className="text-stone-500 hover:text-stone-300 text-xs transition-colors cursor-pointer"
          >
            🔒 Strefa Magdy
          </button>
        </div>
      </footer>
    </div>
  );
}
