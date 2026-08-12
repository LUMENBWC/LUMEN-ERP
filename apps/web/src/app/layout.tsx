import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Corpo — Barlow (design-system Industry)
const barlow = Barlow({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

// Títulos / ações — Barlow Condensed
const barlowCondensed = Barlow_Condensed({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '600'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LUMEN ERP',
  description: 'LUMEN ERP — gestão multiempresa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          // Aplica o tema salvo antes da pintura, evitando flash claro/escuro.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('lumen-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
