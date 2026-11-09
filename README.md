# Czepirkowo 2.0 – Showroom & Panel Magdy

Projekt stworzony dla **Pracowni Twórczej Czepirkowo (Magda Czepirska)** w Międzyrzeczu.

### Cechy rozwiązania:
1. **Autokompresja Google WebP w przeglądarce (`src/lib/imageOptimizer.ts`)**:
   - Skalowanie zdjęć z aparatów smartfonów do 1200 px.
   - Kompresja z 8–12 MB do ~100–180 KB bez obciążenia serwera.
2. **Kokpit Magdy z Dropzone (`src/components/DropzoneAdmin.tsx`)**:
   - Dodanie nowego uszytego unikatu w 30 sekund z telefonu lub komputera.
   - Bezpośredni podgląd kompresji i statystyk w locie.
3. **Karta Produktu z 1-kliknięciem do WhatsApp (`src/components/ProductCard.tsx`)**:
   - Rezerwacja bezpośrednio na numer Magdy (+48 535 277 889) z predefiniowaną treścią.
   - Oznaczenia „Tylko 1 sztuka” oraz „Już u nowej właścicielki”.
4. **Cennik usług krawieckich dla Międzyrzecza (`src/components/PricingList.tsx`)**:
   - Przejrzysty moduł poprawek i skracania ubrań w Domu Handlowym przy ul. Mieszka I 8.
