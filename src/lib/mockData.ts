import { Product, ServicePriceItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'unikat-01',
    title: 'Kuferek Retro / Ruda Terakota',
    price: 159,
    category: 'Torby i Kufry',
    dimensions: '28 × 20 cm, pleciony dół, podszewka, złote okucia',
    description: 'Autorski kuferek ze sztywną rączką i paskiem. Pojedynczy egzemplarz uszyty w pracowni z tkanin obiciowych.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
    createdAt: '2026-11-10',
  },
  {
    id: 'unikat-02',
    title: 'Shopperka z Grubej Kodury & Pasmanteryjne Pasy',
    price: 189,
    category: 'Torby & Shopperki',
    dimensions: '42 × 38 × 12 cm (mieści laptop 15")',
    description: 'Wytrzymała, idealna na codzienne sprawunki i do pracy. Wewnętrzna kieszeń na telefon na suwak, nośne pasy z pasmanterii.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
    createdAt: '2026-11-09',
  },
  {
    id: 'unikat-03',
    title: 'Zestaw 3 Jedwabnych Scrunchies (Zero Waste)',
    price: 45,
    category: 'Akcesoria Zero Waste',
    dimensions: 'Średnica ok. 11 cm',
    description: 'Uszyte z końcówek naturalnego jedwabiu i lnu. Delikatne dla włosów, nie odgniatają.',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
    createdAt: '2026-11-08',
  },
  {
    id: 'unikat-04',
    title: 'Pikowana Kosmetyczka Podróżna w Kwiaty',
    price: 69,
    category: 'Akcesoria Zero Waste',
    dimensions: '22 × 14 × 9 cm',
    description: 'Pikowana miękka bawełna z ociepliną, zamek kostkowy ze starych zasobów pasmanterii.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: false, // Oznaczone jako sprzedane (Social Proof)
    createdAt: '2026-11-05',
  },
  {
    id: 'unikat-05',
    title: 'Nerka Miejska Welur Butelkowa Zieleń',
    price: 149,
    category: 'Torby & Nerki',
    dimensions: '32 × 18 cm, regulowany pas 80–125 cm',
    description: 'Uszyta z weluru tapicerski o wysokiej odporności na ścieranie. Wodoodporna podszewka, złoty suwak.',
    imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
    createdAt: '2026-11-04',
  },
  {
    id: 'unikat-06',
    title: 'Lniana Poszewka Rzemieślnicza z Wypustką',
    price: 79,
    category: 'Dla Domu',
    dimensions: '45 × 45 cm, 100% len zmiękczany',
    description: 'Zapięcie na kryty suwak pasmanteryjny. Wykończona ozdobnym sznurkiem bawełnianym.',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
    createdAt: '2026-11-02',
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
    description: 'Dopasowanie do sylwetki po uprzedniej przymiarce.',
  },
  {
    name: 'Pakiet Ekspres: 3 poprawki w 48h (Abonament Lokalny)',
    price: '99 zł',
    turnaround: 'Gwarantowane 48h',
    description: 'Kompletne odświeżenie garderoby dla mieszkańców Międzyrzecza i okolic.',
  },
];
