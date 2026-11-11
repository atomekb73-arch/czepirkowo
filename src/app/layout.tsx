import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pracownia Twórcza @czepirkowo | Rękodzieło & Szycie na miarę',
  description: 'Autorskie torby, nerki i rzemiosło krawieckie Magdy Czepirskiej w Międzyrzeczu.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
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
