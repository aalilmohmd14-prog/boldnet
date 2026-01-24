'use client';
import React from 'react';
import { useLanguage } from '@/app/context/language-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';

export default function ClientShowcase() {
  const { t } = useLanguage();
  const firestore = useFirestore();

  const clientsCollection = useMemoFirebase(
    () => query(collection(firestore, 'clients'), orderBy('order')),
    [firestore]
  );
  const { data: clients, isLoading: isLoadingClients } = useCollection(clientsCollection);

  const renderClients = (isClone = false) => (
    (clients || []).map((client) => (
      <li key={isClone ? `${client.id}-clone` : client.id} className="flex-shrink-0 px-8">
        <Image
          src={client.logoUrl}
          alt={`${client.name} logo`}
          width={100}
          height={100}
          className="object-contain aspect-square grayscale hover:grayscale-0 transition-all brightness-0 invert"
        />
      </li>
    ))
  );

  return (
    <section id="clients" className="w-full bg-transparent py-12 md:py-24">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 font-headline tracking-tight text-white">
          {t('trustedBy')}
        </h2>
        <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
          {t('clientShowcaseDescription')}
        </p>
        {isLoadingClients && (
          <div className="text-center text-white">Loading clients...</div>
        )}
        {clients && clients.length > 0 && (
          <div className="marquee">
            <ul className="marquee-content">
              {renderClients()}
            </ul>
            <ul className="marquee-content" aria-hidden="true">
              {renderClients(true)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
