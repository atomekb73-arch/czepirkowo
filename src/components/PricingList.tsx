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
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-900 bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full font-bold">
          Usługi Krawieckie · Międzyrzecz
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-950 mt-3">
          Ekspresowe Poprawki Krawieckie
        </h2>
        <p className="text-sm font-medium text-stone-700 mt-2 leading-relaxed">
          Pracownia w Międzyrzeczu – realizacja poprawek i odbiór po wcześniejszym uzgodnieniu telefonicznym. Zadzwoń lub napisz przed przyniesieniem rzeczy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((item, idx) => {
          const isFeatured = item.name.toLowerCase().includes('pakiet');
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border-2 transition-shadow flex flex-col justify-between ${
                isFeatured
                  ? 'bg-amber-50/90 border-amber-400 shadow-md'
                  : 'bg-white border-stone-300 shadow-xs hover:shadow-md hover:border-stone-900'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-950 text-base">
                      {item.name}
                    </h3>
                    {isFeatured && (
                      <span className="bg-amber-200 border border-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded font-black uppercase">
                        Polecane
                      </span>
                    )}
                  </div>
                  <span className="text-stone-950 font-black text-xl whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs font-medium text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Czas realizacji:</span>
                <span className="font-bold text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
                  ⚡ {item.turnaround}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-center">
        <p className="text-sm text-stone-900 font-bold">
          Masz nietypową rzecz lub chcesz zapytać o termin przed przekazaniem ubrań?
        </p>
        <p className="text-xs font-semibold text-stone-700 mt-1.5">
          Zadzwoń do Magdy:{' '}
          <a href="tel:+48535277889" className="text-stone-950 font-black underline">
            +48 535 277 889
          </a>{' '}
          lub napisz na{' '}
          <a
            href="https://wa.me/48535277889?text=Dzie%C5%84%20dobry%2C%20chc%C4%99%20zapyta%C4%87%20o%20poprawk%C4%99%20krawieck%C4%85"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-800 font-black underline"
          >
            WhatsApp
          </a>.
        </p>
      </div>
    </section>
  );
}
