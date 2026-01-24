'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/app/context/language-context';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import SmartphoneAnimation from './smartphone-animation';
import React from 'react';
import FallingMoney from './falling-money';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className={cn(
        "relative text-white overflow-hidden bg-transparent"
    )}>
       <div className="absolute inset-0 z-0 opacity-50" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.1), transparent 70%)'}}></div>

       <FallingMoney />

      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-screen px-4 md:px-6 pt-32 pb-12 relative z-20">
        <div className="space-y-6 text-center lg:text-left">
          <div className="lg:hidden flex justify-center py-6 h-80">
            <SmartphoneAnimation />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline leading-normal tracking-normal text-white">
            {t('heroTitleV2')}
          </h1>

          <p className="text-xl md:text-2xl text-red-100/90 max-w-2xl mx-auto lg:mx-0">
            {t('heroSubtitleV2')}
          </p>
          <p className="text-lg text-red-100/70 max-w-xl mx-auto lg:mx-0">
            {t('heroDescriptionV2')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg bg-white text-red-700 hover:bg-white/90 font-bold">
              <Link href="#contact">{t('getStarted')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
        <div className="relative w-full h-80 lg:h-full hidden lg:flex items-center justify-center">
            <SmartphoneAnimation />
        </div>
      </div>
    </section>
  );
}
