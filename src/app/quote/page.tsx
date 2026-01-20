'use client';

import Footer from '@/app/components/footer';
import Header from '@/app/components/header';
import QuoteForm from '@/app/components/quote-form';
import { LanguageProvider } from '@/app/context/language-context';

export default function QuotePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
      <Header />
      <main className="flex-1 py-12 md:py-24">
        <QuoteForm />
      </main>
      <Footer />
    </div>
  );
}
