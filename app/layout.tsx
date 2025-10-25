import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sexyflow.com.br'),
  title: 'SexyFlow - Automatize suas vendas no nicho hot',
  description: 'SaaS completo para criação automatizada de páginas de vendas no nicho hot/adulto, com editor visual, hospedagem automática e analytics avançados.',
  keywords: ['saas', 'vendas', 'nicho hot', 'páginas de vendas', 'automatização', 'marketing digital'],
  authors: [{ name: 'SexyFlow Team' }],
  creator: 'SexyFlow',
  publisher: 'SexyFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://sexyflow.com.br',
    title: 'SexyFlow - Automatize suas vendas no nicho hot',
    description: 'SaaS completo para criação automatizada de páginas de vendas no nicho hot/adulto',
    siteName: 'SexyFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SexyFlow - Automatize suas vendas no nicho hot',
    description: 'SaaS completo para criação automatizada de páginas de vendas no nicho hot/adulto',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
