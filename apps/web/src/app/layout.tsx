import type { Metadata } from 'next';
import { Manrope, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Corpo — Manrope (design-system LUMEN, marca ouro/navy)
const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

// Títulos / ações — Manrope (pesos altos)
const manropeHeading = Manrope({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
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
        className={`${manrope.variable} ${manropeHeading.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
