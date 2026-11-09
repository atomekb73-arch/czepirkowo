import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Product, ServicePriceItem } from './types';
import { INITIAL_PRODUCTS, TAILOR_SERVICES } from './mockData';

// 1. POBIERANIE PRODUKTÓW
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_PRODUCTS;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn('Używam danych zastępczych (baza pusta lub błąd):', error);
    return INITIAL_PRODUCTS;
  }

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    price: Number(item.price),
    category: item.category,
    dimensions: item.dimensions || '',
    description: item.description || '',
    imageUrl: item.image_url,
    isAvailable: item.is_available,
    createdAt: item.created_at,
  }));
}

// 2. WGRYWANIE SKOMPRESOWANEGO ZDJĘCIA WEBP & TWORZENIE PRODUKTU
export async function uploadProductWithWebP(
  productData: Omit<Product, 'id' | 'imageUrl' | 'createdAt'>,
  imageBlob: Blob
): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) {
    const fallbackUrl = URL.createObjectURL(imageBlob);
    return {
      id: 'local-' + Date.now().toString().slice(-4),
      ...productData,
      imageUrl: fallbackUrl,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const fileName = `unikat-${Date.now()}.webp`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadData.path);

    const publicUrl = publicUrlData.publicUrl;

    const { data: insertedData, error: insertError } = await supabase
      .from('products')
      .insert({
        title: productData.title,
        price: productData.price,
        category: productData.category,
        dimensions: productData.dimensions,
        description: productData.description,
        image_url: publicUrl,
        is_available: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return {
      id: insertedData.id,
      title: insertedData.title,
      price: Number(insertedData.price),
      category: insertedData.category,
      dimensions: insertedData.dimensions || '',
      description: insertedData.description || '',
      imageUrl: insertedData.image_url,
      isAvailable: insertedData.is_available,
      createdAt: insertedData.created_at,
    };
  } catch (err) {
    console.error('Błąd podczas zapisu w Supabase:', err);
    alert('Wystąpił problem z zapisem w bazie Supabase.');
    return null;
  }
}

// 3. USUWANIE PRODUKTU
export async function deleteProductFromDb(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Błąd usuwania produktu:', err);
    return false;
  }
}

// 4. ZMIANA STATUSU (Oznacz jako sprzedane / przywróć)
export async function toggleProductStatusInDb(productId: string, isAvailable: boolean): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase
      .from('products')
      .update({ is_available: isAvailable })
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Błąd zmiany statusu:', err);
    return false;
  }
}

// 5. POBIERANIE CENNIKA USŁUG
export async function getServices(): Promise<ServicePriceItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return TAILOR_SERVICES;
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return TAILOR_SERVICES;
  }

  return data.map((item) => ({
    name: item.name,
    price: item.price,
    turnaround: item.turnaround,
    description: item.description || '',
  }));
}

// 6. AKTUALIZACJA CENNIKA USŁUG
export async function saveServices(services: ServicePriceItem[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  try {
    await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const toInsert = services.map((s, idx) => ({
      name: s.name,
      price: s.price,
      turnaround: s.turnaround,
      description: s.description,
      display_order: idx + 1,
    }));

    const { error } = await supabase.from('services').insert(toInsert);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Błąd zapisu cennika w Supabase:', err);
    return false;
  }
}
