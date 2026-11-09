export interface Product {
  id: string;
  title: string;
  price: number;
  category: 'Torby i Nerki' | 'Akcesoria Zero Waste' | 'Sukienki i Kimona' | 'Dla Domu';
  dimensions: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface ServicePriceItem {
  name: string;
  price: string;
  turnaround: string;
  description: string;
}
