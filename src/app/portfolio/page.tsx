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
    
    // Pattern logic for asymmetrical grid
    const isLarge = index % 3 === 0;
    
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { amount: 0.1 });

    return (
        <div className={isLarge ? "col-span-1 md:col-span-2" : "col-span-1"}>
            <motion.div 
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                    "group relative overflow-hidden bg-neutral-900 rounded-[2rem] shadow-2xl transition-all duration-500",
                    isLarge ? "aspect-[16/10] md:aspect-[21/10]" : "aspect-[9/12] md:aspect-[9/11]"
                )}
            >
                {/* Background Media */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {item.videoUrl && backgroundVideoUrl && isInView ? (
                        <div className="relative w-full h-full pointer-events-none">
                            <iframe
                                src={backgroundVideoUrl}
                                title={item.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                style={{ 
                                    width: '100%',
                                    height: '177.77%', // (16/9) * 100 to ensure 9:16 covers 1:1 or 4:5
                                    minWidth: '100%',
                                    minHeight: '100%',
                                    aspectRatio: '9/16'
                                }}
                            ></iframe>
                        </div>
                    ) : (
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    )}
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Project Info */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end pointer-events-none">
                    <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className={cn(
                            "font-headline font-bold text-white leading-tight",
                            isLarge ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
                        )}>
                            {item.title}
                        </h3>
                        <p className="text-white/70 max-w-xl line-clamp-2 text-sm md:text-lg">
                            {item.description}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
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
        <div className="flex flex-col min-h-dvh bg-[#0a0a0a]">
            <Header />
            <main className="flex-1">
                {/* Hero Header Section */}
                <section className="pt-40 pb-20 md:pt-52 md:pb-32 px-4 md:px-6">
                    <div className="container max-w-7xl mx-auto text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs md:text-sm block mb-6">
                                Notre Travail • Contenu Vertical
                            </span>
                            <h1 className="text-5xl md:text-8xl font-extrabold font-headline text-white leading-[0.9] tracking-tighter">
                                Des projets qui <br /> font du bruit.
                            </h1>
                        </motion.div>
                    </div>
                </section>

                {/* Grid Section */}
                <section className="pb-32 px-4 md:px-6">
                    <div className="container max-w-7xl mx-auto">
                        {isLoadingItems ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Skeleton className="col-span-1 md:col-span-2 aspect-[21/9] rounded-[2rem] bg-white/5" />
                                <Skeleton className="aspect-[3/4] rounded-[2rem] bg-white/5" />
                                <Skeleton className="aspect-[3/4] rounded-[2rem] bg-white/5" />
                            </div>
                        ) : !items || items.length === 0 ? (
                            <div className="text-center py-32">
                                <p className="text-white/40 text-xl">Aucun projet à afficher pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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