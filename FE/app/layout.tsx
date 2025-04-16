import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Shop Microservices",
  description: "A modern e-commerce platform built with microservices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="darkreader-lock" content="true" />
        <meta name="darkreader" content="disable" />
        <style 
          data-darkreader-style="active" 
          media="not screen"
          precedence="default"
          href="disable-darkreader-style"
        >{`
          :root {
            --darkreader-neutral-background: white !important;
            --darkreader-neutral-text: black !important;
            --darkreader-selection-background: #8ab4f8 !important;
            --darkreader-selection-text: #000 !important;
          }
        `}</style>
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <div className="container">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
