'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ArrowRight, Video, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import ServicesOverview from './services-overview';
import ClientShowcase from './client-showcase';
import MethodSection from './method-section';
import Testimonials from './testimonials';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import TeamSection from './team-section';
import BlogOverview from './blog-overview';
import ResultsSection from './results-section';
import NewsletterSection from './newsletter-section';
import ContactSection from './contact-section';
import { useLanguage } from '../context/language-context';

// --- Helper Functions ---
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


// --- Template Components ---

function FeatureGridSection({ content }: { content: any }) {
  const { language } = useLanguage();
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline">
            {content.title?.[language] || content.title}
          </h2>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
          {content.columns?.map((col: any, index: number) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <DynamicIcon iconName={col.icon || 'Zap'} className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle>{col.title?.[language] || col.title}</CardTitle>
                <p className="text-muted-foreground">{col.description?.[language] || col.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ content }: { content: any }) {
  const { language } = useLanguage();
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight font-headline">
            {content.title?.[language] || content.title}
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
            {content.subtitle?.[language] || content.subtitle}
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href={content.buttonLink}>{content.buttonText?.[language] || content.buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TextImageSection({ content }: { content: any }) {
  const { language } = useLanguage();
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className={cn(
          "grid gap-10 lg:grid-cols-2 lg:gap-16 items-center",
          content.imagePosition === 'right' && "lg:grid-cols-[1fr_auto]"
        )}>
          <div className={cn(content.imagePosition === 'right' && "lg:order-last")}>
            <Image
              src={content.imageUrl}
              alt={content.title?.[language] || content.title}
              width={600}
              height={400}
              className="rounded-lg object-cover"
              data-ai-hint={content.imageHint}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              {content.title?.[language] || content.title}
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              {content.text?.[language] || content.text}
            </p>
             {content.buttonText && (
               <Button asChild>
                 <Link href={content.buttonLink || '#'}>
                   {content.buttonText?.[language] || content.buttonText}
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
             )}
          </div>
        </div>
      </div>
    </section>
  );
}

function YoutubeGallerySection({ content }: { content: any }) {
    const { language } = useLanguage();
    if (!content.videos || content.videos.length === 0) {
        return null;
    }
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline">
                        {content.title?.[language] || content.title || 'Our Video Gallery'}
                    </h2>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:max-w-none mt-12">
                    {content.videos.map((video: any, index: number) => {
                        const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl);
                        if (!embedUrl) return null;

                        return (
                            <Card key={index} className="overflow-hidden">
                                <div className="aspect-video relative">
                                    <iframe
                                        src={embedUrl}
                                        title={video.title?.[language] || video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                                <CardHeader>
                                    <CardTitle>{video.title?.[language] || video.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{video.description?.[language] || video.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

const sectionComponents = {
  'feature-grid': FeatureGridSection,
  'cta': CTASection,
  'text-image': TextImageSection,
  'youtube-gallery': YoutubeGallerySection,
  'services-overview': ServicesOverview,
  'client-showcase': ClientShowcase,
  'funnel-display': MethodSection,
  'results-showcase': ResultsSection,
  'testimonials': Testimonials,
  'team': TeamSection,
  'blog-overview': BlogOverview,
  'newsletter': NewsletterSection,
  'contact-form': ContactSection,
};

export default function DynamicSections() {
  const firestore = useFirestore();
  const sectionsQuery = useMemoFirebase(
    () => query(collection(firestore, 'sections'), orderBy('order')),
    [firestore]
  );
  const { data: sections, isLoading } = useCollection(sectionsQuery);

  if (isLoading) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 text-center">Loading sections...</div>
      </section>
    );
  }

  if (!sections || sections.length === 0) {
    return null;
  }
  
  const visibleSections = sections.filter(section => section.visible !== false);

  return (
    <>
      {visibleSections.map((section) => {
        const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];
        if (!SectionComponent) {
          console.warn(`Unknown section type: ${section.type}`);
          return null;
        }
        // For static components, we just render them. For dynamic ones, we pass content.
        // @ts-ignore
        return <SectionComponent key={section.id} content={section.content} />;
      })}
    </>
  );
}

    