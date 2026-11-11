export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  dimensions: string;
  description: string;
  imageUrl: string;
  images?: string[]; // Kasetonowa galeria detali (dodatkowe ujęcia)
  isAvailable: boolean;
  createdAt?: string;
}

export interface ServicePriceItem {
  id?: string;
  name: string;
  price: string;
  turnaround: string;
  description: string;
}
