'use client';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PlayCircle, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '../components/header';
import Footer from '../components/footer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

const PortfolioItemCard = ({ item, index }: { item: any; index: number }) => {
    const embedUrl = item.videoUrl ? getYouTubeEmbedUrl(item.videoUrl) : null;
    
    // Pattern logic for asymmetrical grid (Hello Monday style)
    // index % 3 === 0 -> Big item (Full width or nearly full)
    // index % 3 === 1 or 2 -> Medium items
    const isLarge = index % 3 === 0;

    const Content = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={cn(
                "group relative overflow-hidden cursor-pointer bg-neutral-900 rounded-[2rem]",
                isLarge ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/5] md:aspect-[3/4]"
            )}
        >
            <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

            {/* Video Indicator */}
            {item.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                        <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                </div>
            )}

            {/* Project Info */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className={cn(
                            "font-headline font-bold text-white leading-tight",
                            isLarge ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
                        )}>
                            {item.title}
                        </h3>
                        <div className="bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-75 group-hover:scale-100">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-white/70 max-w-xl line-clamp-2 text-sm md:text-lg">
                        {item.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    if (embedUrl) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <div className={isLarge ? "col-span-1 md:col-span-2" : "col-span-1"}>
                        <Content />
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-0 border-0 bg-transparent overflow-hidden rounded-3xl">
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
        <div className={isLarge ? "col-span-1 md:col-span-2" : "col-span-1"}>
            <Content />
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
                    <div className="container max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-3xl"
                        >
                            <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs md:text-sm block mb-6">
                                Notre Travail
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
