import { Product, ServicePriceItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'cz-01',
    title: 'Nerka Miejska Welur Butelkowa Zieleń',
    price: 159,
    category: 'Torby i Nerki',
    dimensions: '32 × 18 cm, regulowany pas 80-125 cm',
    description: 'Tkanina tapicerska o wysokiej odporności, wodoodporna podszewka, złote okucia.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&auto=format&fit=crop&q=80',
    isAvailable: true,
    createdAt: '2026-11-09',
  },
  {
    id: 'cz-02',
    title: 'Shopperka z Grubej Kodury & Pasmanteryjne Pasy',
    price: 189,
    category: 'Torby i Nerki',
    dimensions: '42 × 38 × 12 cm (mieści laptop 15")',
    description: 'Wytrzymała, idealna na codzienne sprawunki i do pracy. Wewnętrzna kieszeń na telefon na suwak.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80',
    isAvailable: true,
    createdAt: '2026-11-08',
  },
  {
    id: 'cz-03',
    title: 'Zestaw 3 Jedwabnych Scrunchies (Zero Waste)',
    price: 45,
    category: 'Akcesoria Zero Waste',
    dimensions: 'Średnica ok. 11 cm',
    description: 'Uszyte z końcówek naturalnego jedwabiu i lnu. Delikatne dla włosów, nie odgniatają.',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&auto=format&fit=crop&q=80',
    isAvailable: true,
    createdAt: '2026-11-07',
  },
  {
    id: 'cz-04',
    title: 'Pikowana Kosmetyczka Podróżna w Kwiaty',
    price: 69,
    category: 'Akcesoria Zero Waste',
    dimensions: '22 × 14 × 9 cm',
    description: 'Pikowana miękka bawełna z ociepliną, zamek kostkowy ze starych zasobów pasmanterii.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop&q=80',
    isAvailable: false,
    createdAt: '2026-11-05',
  },
];

export const TAILOR_SERVICES: ServicePriceItem[] = [
  {
    name: 'Skracanie nogawek jeansów / spodni garniturowych',
    price: 'od 35 zł',
    turnaround: '24–48h',
    description: 'Z zachowaniem oryginalnego dołu lub z podszyciem krytym.',
  },
  {
    name: 'Wymiana zamka błyskawicznego w kurtce / bluzie',
    price: 'od 45 zł',
    turnaround: '48h',
    description: 'Najwyższej jakości zamki z naszej pasmanterii (kostkowe, spiralne, metalowe).',
  },
  {
    name: 'Taliowanie / Zwężanie sukienki lub koszuli',
    price: 'od 40 zł',
    turnaround: '48–72h',
    description: 'Dopasowanie do sylwetki z przymiarką w pracowni.',
  },
  {
    name: 'Pakiet Ekspres: 3 rzeczy w 48h (Abonament Lokalny)',
    price: '99 zł',
    turnaround: 'Gwarantowane 48h',
    description: 'Kompletne odświeżenie garderoby przed sezonem dla mieszkańców Międzyrzecza.',
  },
];
