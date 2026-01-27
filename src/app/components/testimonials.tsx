'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/carousel';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/language-context';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#FBBC05" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.582-3.296-11.127-7.792l-6.571 4.819C9.656 40.083 16.318 44 24 44z" />
      <path fill="#EA4335" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.846 44 30.342 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

const StarRating = ({ rating, className }: { rating: number, className?: string }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${className} ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };
  

const TestimonialCard = ({ testimonial }: { testimonial: any }) => {
    const { language } = useLanguage();
    const reviewText = testimonial.review?.[language] || testimonial.review?.en || '';
    const TRUNCATE_LENGTH = 150;
    const isTruncated = reviewText.length > TRUNCATE_LENGTH;
    const displayedReview = isTruncated ? `${reviewText.substring(0, TRUNCATE_LENGTH)}...` : reviewText;
    const name = testimonial.name?.[language] || testimonial.name?.en || '';
    const position = testimonial.position?.[language] || testimonial.position?.en || '';

    return (
        <Dialog>
            <Card className="bg-white/10 dark:bg-white/5 border border-white/20 text-white flex flex-col h-full transition-shadow duration-300 hover:shadow-2xl hover:bg-white/20 rounded-xl backdrop-blur-sm">
                <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src={testimonial.avatarUrl}
                                alt={name}
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                            />
                            <div>
                                <p className="font-semibold">{name}</p>
                                <p className="text-sm text-red-100">{position}</p>
                            </div>
                        </div>
                        {testimonial.source?.toLowerCase() === 'google' && <div className="p-1 rounded-full bg-white"><GoogleIcon /></div>}
                    </div>
                    <StarRating rating={testimonial.rating} />
                    <p className="mt-4 text-red-50 flex-grow break-words">
                        {displayedReview}
                        {isTruncated && (
                            <DialogTrigger asChild>
                                <button className="text-yellow-300 hover:underline ml-1 font-semibold">Lire la suite</button>
                            </DialogTrigger>
                        )}
                    </p>
                </CardContent>
            </Card>

             <DialogContent className="sm:max-w-lg bg-background dark:bg-[#181818] border-neutral-200 dark:border-neutral-700 text-foreground dark:text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-4">
                         <Image
                            src={testimonial.avatarUrl}
                            alt={name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-lg">{name}</p>
                            <p className="text-sm text-muted-foreground dark:text-neutral-400 font-normal">{position}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <StarRating rating={testimonial.rating} />
                    <p className="text-muted-foreground dark:text-neutral-300 break-all">{reviewText}</p>
                    {testimonial.source?.toLowerCase() === 'google' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                           <GoogleIcon /> <span>Avis de Google</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function Testimonials() {
  const firestore = useFirestore();
  const { language, t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const testimonialsCollection = useMemoFirebase(
    () => query(collection(firestore, 'testimonials'), orderBy('name')),
    [firestore]
  );
  const { data: testimonials, isLoading } = useCollection(testimonialsCollection);
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap() + 1);

    const handleSelect = () => {
        setCurrent(api.selectedScrollSnap() + 1);
    };
    
    api.on('select', handleSelect);
    
    return () => {
        api.off('select', handleSelect);
    };
  }, [api]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  if (isLoading) {
    return <div className="text-center py-12 text-white">Chargement des témoignages...</div>;
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="bg-transparent text-white py-16 md:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <span className="text-sm font-bold text-red-200 tracking-widest uppercase">{t('testimonials')}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 font-headline">{t('whatOurClientsSay')}</h2>
        </div>

        <Carousel 
            setApi={setApi}
            opts={{
                align: 'start',
                loop: true,
            }}
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full relative"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full bg-transparent border-red-300 text-red-200 hover:bg-white/10 hover:text-white" onClick={scrollPrev}>
                    &lt;
                </Button>
                 <div className="text-sm text-red-200">
                    <span className="font-bold text-white">{String(current).padStart(2, '0')}</span>
                    /
                    <span>{String(testimonials.length).padStart(2, '0')}</span>
                </div>
                <Button variant="outline" size="icon" className="rounded-full bg-transparent border-red-300 text-red-200 hover:bg-white/10 hover:text-white" onClick={scrollNext}>
                    &gt;
                </Button>
            </div>
        </Carousel>
      </div>
    </section>
  );
}

    