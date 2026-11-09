import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pracownia Twórcza @Czepirkowo – Magda Czepirska',
  description: 'Unikatowe rzemiosło krawieckie, nerki, torby i ekspresowe poprawki w Międzyrzeczu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-[#F7F4EE] text-stone-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
