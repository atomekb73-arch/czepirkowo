-- ==============================================================================
-- CZEPIRKOWO 2.0 – SCHEMAT SUPABASE (POSTGRESQL + STORAGE)
-- Wklej poniższy kod w panelu Supabase: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Tabela: products (Unikaty szyte przez Magdę)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Torby i Nerki', 'Akcesoria Zero Waste', 'Sukienki i Kimona', 'Dla Domu')),
    dimensions TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela: services (Ekspresowe Poprawki Krawieckie w Międzyrzeczu)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    turnaround TEXT NOT NULL DEFAULT '48h',
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Włączenie Row Level Security (RLS) - ochrona danych
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Polityki bezpieczeństwa:
-- Każdy wchodzący na stronę może przeglądać produkty i usługi
CREATE POLICY "Publiczny odczyt produktów" 
    ON public.products FOR SELECT 
    USING (true);

CREATE POLICY "Publiczny odczyt cennika poprawek" 
    ON public.services FOR SELECT 
    USING (true);

-- Dodawanie i edycja przez zalogowanego administratora (Magdę / Ciebie)
CREATE POLICY "Zarządzanie produktami dla zalogowanych" 
    ON public.products FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Zarządzanie cennikiem dla zalogowanych" 
    ON public.services FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Pozwolenie anonimowe (opcjonalne na czas testów w fazie beta przed logowaniem Auth)
-- Aby ułatwić pierwszy start, anonimowy klucz API może zapisywać nowe unikaty i cennik:
CREATE POLICY "Tymczasowy zapis publiczny dla testów" 
    ON public.products FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Tymczasowy zapis cennika dla testów" 
    ON public.services FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

-- 5. Bucket na skompresowane zdjęcia WebP: 'product-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Polityki dla schowka na zdjęcia:
CREATE POLICY "Zdjęcia są publicznie widoczne" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-images');

CREATE POLICY "Wgrywanie zdjęć dozwolone dla każdego klucza" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Usuwanie zdjęć dozwolone" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'product-images');

-- 6. Dane początkowe (Cennik poprawek w Międzyrzeczu)
INSERT INTO public.services (name, price, turnaround, description, display_order)
VALUES 
    ('Skracanie nogawek jeansów / spodni', 'od 35 zł', '24–48h', 'Z zachowaniem oryginalnego dołu lub z podszyciem krytym.', 1),
    ('Wymiana zamka błyskawicznego w kurtce', 'od 45 zł', '48h', 'Mocne zamki kostkowe i spiralne z zasobów pasmanterii.', 2),
    ('Zwężanie / Taliowanie sukienki lub koszuli', 'od 40 zł', '48–72h', 'Dopasowanie do sylwetki z przymiarką na miejscu.', 3),
    ('Pakiet Lokalny: 3 poprawki w 48h', '99 zł', 'Gwarantowane 48h', 'Kompletne ekspresowe odświeżenie garderoby dla mieszkańców Międzyrzecza.', 4)
ON CONFLICT DO NOTHING;
