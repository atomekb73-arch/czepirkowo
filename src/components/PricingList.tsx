import React from 'react';
import { ServicePriceItem } from '@/lib/types';
import { TAILOR_SERVICES } from '@/lib/mockData';

interface PricingListProps {
  services?: ServicePriceItem[];
}

export default function PricingList({ services = TAILOR_SERVICES }: PricingListProps) {
  return (
    <section id="cennik" className="py-16 px-4 max-w-5xl mx-auto scroll-mt-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          Pracownia w Międzyrzeczu
        </span>
        <h2 className="text-3xl font-serif font-bold text-stone-900 mt-3">
          Ekspresowe Poprawki Krawieckie
        </h2>
        <p className="text-sm text-stone-600 mt-2">
          Dom Handlowy (parter), ul. Mieszka I 8. Przynieś ubranie do dopasowania lub wymiany suwaka – realizujemy w 24–48 godzin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((item, idx) => {
          const isFeatured = item.name.toLowerCase().includes('pakiet');
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-shadow flex flex-col justify-between ${
                isFeatured
                  ? 'bg-amber-50/90 border-amber-300 shadow-md'
                  : 'bg-white border-stone-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900 text-base">
                      {item.name}
                    </h3>
                    {isFeatured && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        Polecane
                      </span>
                    )}
                  </div>
                  <span className="text-amber-900 font-bold text-lg whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-stone-400">Czas realizacji:</span>
                <span className="font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  ⚡ {item.turnaround}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-center">
        <p className="text-sm text-stone-800 font-medium">
          Masz nietypową rzecz lub chcesz zapytać przed przyjściem?
        </p>
        <p className="text-xs text-stone-500 mt-1">
          Zadzwoń do Magdy:{' '}
          <a href="tel:535277889" className="text-amber-900 font-bold underline">
            535 277 889
          </a>{' '}
          lub napisz na WhatsApp.
        </p>
      </div>
    </section>
  );
}
