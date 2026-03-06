'use client';
import React, { useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '../components/header';
import Footer from '../components/footer';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            if (urlObj.pathname.startsWith('/shorts/')) {
                return urlObj.pathname.split('/')[2];
            } else {
                return urlObj.searchParams.get('v');
            }
        }
    } catch (error) {
        console.error("Invalid YouTube URL:", url);
    }
    return null;
}

const PortfolioItemCard = ({ item, index }: { item: any; index: number }) => {
    const videoId = getYouTubeVideoId(item.videoUrl);
    // Parameters for background-style playback:
    // autoplay=1: start immediately
    // mute=1: required for autoplay
    // loop=1 & playlist=VIDEO_ID: required for looping
    // controls=0: hide player controls
    // modestbranding=1: hide youtube logo
    // rel=0: hide related videos
    const backgroundVideoUrl = videoId 
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1`
        : null;
    
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { amount: 0.3 });

    return (
        <motion.div 
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
            className={cn(
                "group relative overflow-hidden bg-neutral-900 rounded-[2.5rem] shadow-2xl transition-all duration-700 aspect-[9/16] w-full",
                index % 3 === 1 ? "md:mt-24" : "" // Stagger effect for masonry look
            )}
        >
            {/* Background Media */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                {item.videoUrl && backgroundVideoUrl && isInView ? (
                    <div className="relative w-full h-full pointer-events-none scale-105">
                        <iframe
                            src={backgroundVideoUrl}
                            title={item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
                            style={{ 
                                objectFit: 'cover',
                                minWidth: '100%',
                                minHeight: '100%'
                            }}
                        ></iframe>
                    </div>
                ) : (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                )}
            </div>
            
            {/* Overlay Gradient - Darker at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Project Info */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-red-500 font-bold tracking-widest uppercase text-[10px]">
                        BoldNet Production
                    </span>
                    <h3 className="font-headline font-bold text-white leading-tight text-2xl md:text-3xl">
                        {item.title}
                    </h3>
                    <p className="text-white/60 max-w-xs line-clamp-2 text-sm">
                        {item.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

function PortfolioPageContent() {
    const firestore = useFirestore();
    
    const itemsQuery = useMemoFirebase(
        () => query(collection(firestore, 'portfolio_items'), orderBy('order', 'asc')),
        [firestore]
    );
    const { data: items, isLoading: isLoadingItems } = useCollection(itemsQuery);

    return (
        <div className="flex flex-col min-h-dvh bg-[#050505]">
            <Header />
            <main className="flex-1">
                {/* Hero Header Section */}
                <section className="pt-40 pb-16 md:pt-52 md:pb-24 px-4 md:px-6">
                    <div className="container max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="max-w-4xl"
                        >
                            <span className="text-red-500 font-bold tracking-[0.3em] uppercase text-xs md:text-sm block mb-6">
                                Showcase • {items?.length || 0} Projets
                            </span>
                            <h1 className="text-6xl md:text-9xl font-extrabold font-headline text-white leading-[0.85] tracking-tighter">
                                IMPACT <br /> <span className="text-transparent stroke-white" style={{ WebkitTextStroke: '1px white' }}>VISUEL.</span>
                            </h1>
                        </motion.div>
                    </div>
                </section>

                {/* Vertical Grid Section */}
                <section className="pb-40 px-4 md:px-6">
                    <div className="container max-w-7xl mx-auto">
                        {isLoadingItems ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                                <Skeleton className="aspect-[9/16] rounded-[2.5rem] bg-white/5" />
                                <Skeleton className="aspect-[9/16] rounded-[2.5rem] bg-white/5 md:mt-24" />
                                <Skeleton className="aspect-[9/16] rounded-[2.5rem] bg-white/5" />
                            </div>
                        ) : !items || items.length === 0 ? (
                            <div className="text-center py-32 border border-white/10 rounded-[3rem] bg-white/5">
                                <p className="text-white/40 text-xl font-headline italic">Aucune réalisation pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
                                {items.map((item, index) => (
                                    <PortfolioItemCard key={item.id} item={item} index={index} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default PortfolioPageContent;