'use client';
import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Header from '../components/header';
import Footer from '../components/footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to get YouTube embed URL
function getYouTubeEmbedUrl(url: string) {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (error) {
        console.error("Invalid YouTube URL:", url);
        return null;
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
}


const PortfolioItemCard = ({ item }: { item: any }) => {
    const embedUrl = item.videoUrl ? getYouTubeEmbedUrl(item.videoUrl) : null;
  
    const CardContentWrapper = ({ children }: { children: React.ReactNode }) => (
      <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 w-full h-full bg-background">
        {children}
      </Card>
    );
  
    const Media = () => (
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
        {item.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors" />
          </div>
        )}
      </div>
    );
  
    const Content = () => (
      <>
        <Media />
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/70 to-transparent">
          <h3 className="text-2xl font-bold font-headline text-white">{item.title}</h3>
          <p className="text-white/80 mt-2 line-clamp-2">{item.description}</p>
        </div>
      </>
    );
  
    if (embedUrl) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full h-full text-left">
              <CardContentWrapper>
                <Content />
              </CardContentWrapper>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 border-0">
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                title={item.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
  
    return (
      <CardContentWrapper>
        <Content />
      </CardContentWrapper>
    );
  };

function PortfolioPageContent() {
  const firestore = useFirestore();
  
  const itemsQuery = useMemoFirebase(
    () => query(collection(firestore, 'portfolio_items'), orderBy('order', 'asc')),
    [firestore]
  );
  const { data: items, isLoading: isLoadingItems } = useCollection(itemsQuery);

  const renderContent = () => {
    if (isLoadingItems) {
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-full aspect-[4/3] rounded-lg bg-white/10" />
            ))}
        </div>
      )
    }

    if (!items || items.length === 0) {
      return <p className="text-center text-red-200">No portfolio items available yet.</p>;
    }
    
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(item => (
          <PortfolioItemCard key={item.id} item={item} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
      <Header />
      <main className="flex-1">
        <section className="pt-32 pb-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-12 text-center text-white">
              Notre Portfolio
            </h1>
            {renderContent()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default PortfolioPageContent;
