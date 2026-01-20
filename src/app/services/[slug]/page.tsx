'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';
import ContactSection from '@/app/components/contact-section';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/app/context/language-context';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const [service, setService] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!firestore || !params.slug) return;

    const fetchService = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(collection(firestore, 'services'), where('slug', '==', params.slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Service not found');
        } else {
          const doc = querySnapshot.docs[0];
          setService({ id: doc.id, ...doc.data() });
        }
      } catch (e) {
        console.error("Error fetching service:", e);
        setError('Error loading page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [firestore, params.slug]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-20 text-white">Loading service...</div>;
    }

    if (error) {
      return <div className="text-center py-20 text-destructive">{error}</div>;
    }

    if (!service) {
      return null;
    }

    return (
      <>
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28">
            <div className="absolute inset-0">
                {service.imageUrl ? (
                    <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover opacity-20"
                    />
                ) : (
                    <div className="bg-muted w-full h-full"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            <div className="container relative text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight text-white">
                    {service.name}
                </h1>
            </div>
        </section>
        
        <section className="py-12 md:py-16">
            <div className="container max-w-4xl">
                 <div
                    className="prose dark:prose-invert max-w-none mx-auto prose-headings:font-headline prose-headings:text-white prose-p:text-white/80 prose-strong:text-white prose-li:text-white/80"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                />
                 <div className="mt-12 text-center">
                    <Button asChild size="lg">
                        <Link href="/quote">
                            {t('requestAQuote')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
      <Header />
      <main className="flex-1">
        {renderContent()}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
