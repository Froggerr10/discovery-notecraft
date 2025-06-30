import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Discovery Notecraft™ - Questionário Estratégico IA',
  description: 'Questionário estratégico para mapear oportunidades de IA em consultoria tributária - Sistema desenvolvido pela Notecraft',
  keywords: 'discovery, questionário, IA, consultoria tributária, notecraft, inteligência artificial',
  authors: [{ name: 'Notecraft' }],
  openGraph: {
    title: 'Discovery Notecraft™',
    description: 'Questionário estratégico para mapear oportunidades de IA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}