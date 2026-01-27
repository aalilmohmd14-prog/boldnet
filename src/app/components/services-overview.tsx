'use client';

import React from 'react';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useLanguage } from '@/app/context/language-context';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Autoplay from "embla-carousel-autoplay"
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ServicesOverview() {
  const { t, language } = useLanguage();
  const firestore = useFirestore();
  const isMobile = useIsMobile();
  
  const servicesCollection = useMemoFirebase(
    () => collection(firestore, 'services'),
    [firestore]
  );
  const { data: services, isLoading: isLoadingServices } = useCollection(servicesCollection);

  const landingPagesCollection = useMemoFirebase(
    () => collection(firestore, 'landing_pages'),
    [firestore]
  );
  const { data: landingPages, isLoading: isLoadingLandingPages } = useCollection(landingPagesCollection);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const renderServiceCard = (service: any) => {
    const linkedLandingPage = landingPages?.find(lp => lp.id === service.landingPageId);
    const detailsHref = linkedLandingPage ? `/lp/${linkedLandingPage.slug}` : `/services/${service.slug}`;

    return (
      <Card key={service.id} className="bg-card text-card-foreground flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-300 group hover:bg-primary hover:text-primary-foreground rounded-xl sm:rounded-2xl md:rounded-3xl">
          <CardHeader className="items-start gap-4">
              <div className="bg-gray-900 text-white p-3 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors">
                {service.iconUrl ? (
                   <Image src={service.iconUrl} alt={service.name?.[language] || ''} width={24} height={24} className="h-6 w-6 object-contain" />
                ) : (
                  <DynamicIcon iconName={service.iconName || 'Zap'} className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
                )}
              </div>
              <CardTitle className="text-xl font-bold font-headline">{service.name?.[language] || service.name?.en}</CardTitle>
              <div 
                className="prose-sm prose-p:text-muted-foreground group-hover:prose-p:text-primary-foreground/80 dark:prose-invert max-w-none prose-ul:list-disc prose-ul:pl-5"
                dangerouslySetInnerHTML={{ __html: service.description?.[language] || service.description?.en }}
              />
          </CardHeader>
          <CardFooter className="flex-col items-stretch gap-4 mt-auto pt-6">
              <Button asChild className="w-full bg-gray-900 text-white hover:bg-gray-800 group-hover:bg-white group-hover:text-primary transition-colors">
                  <Link href="/quote">
                    <ArrowRight className="mr-2 h-4 w-4" /> {t('requestAQuote')}
                  </Link>
              </Button>
              <Button variant="link" className="text-muted-foreground hover:text-primary group-hover:text-primary-foreground/80 group-hover:hover:text-primary-foreground" asChild>
                  <Link href={detailsHref}>
                      En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
          </CardFooter>
      </Card>
    );
  }

  const renderContent = () => {
    if (isLoadingServices || isLoadingLandingPages) {
        return <p className="text-center">Loading services...</p>
    }

    if (!services || services.length === 0) {
        return <p className="text-center text-muted-foreground">No services available.</p>
    }

    const useCarouselView = (isMobile && services.length > 1) || services.length > 3;

    if (useCarouselView) {
        return (
             <Carousel 
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                className="w-full max-w-sm md:max-w-xl lg:max-w-4xl xl:max-w-6xl mx-auto">
                <CarouselContent>
                    {services.map((service) => (
                        <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                                {renderServiceCard(service)}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="flex" />
                <CarouselNext className="flex" />
            </Carousel>
        )
    }

    return (
        <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
            {services.map(service => <div key={service.id} className="h-full">{renderServiceCard(service)}</div>)}
        </div>
    )
  }
  
  return (
    <section 
        id="services" 
        className="w-full py-12 md:py-24 lg:py-32 bg-transparent text-white"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline text-white">
              {t('ourServices')}
            </h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-red-200">
              {t('servicesDescription')}
            </p>
          </div>
        </div>
        <div className="mt-12">
            {renderContent()}
        </div>
      </div>
    </section>
  );
}

    