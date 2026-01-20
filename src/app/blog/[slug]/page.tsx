'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Award, Zap, Target, ArrowRight, Presentation, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';
import ContactSection from '@/app/components/contact-section';
import { format } from 'date-fns';

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

// Re-usable section components
function FeatureGridSection({ content }: { content: any }) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline text-white">
            {content.title}
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
                <CardTitle>{col.title}</CardTitle>
                <p className="text-muted-foreground">{col.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ content }: { content: any }) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-black/20">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight font-headline text-white">
            {content.title}
          </h2>
          <p className="mx-auto max-w-[600px] text-white/80 md:text-xl/relaxed">
            {content.subtitle}
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href={content.buttonLink}>{content.buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TextImageSection({ content }: { content: any }) {
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
              alt={content.title}
              width={600}
              height={400}
              className="rounded-lg object-cover"
              data-ai-hint={content.imageHint}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline text-white">
              {content.title}
            </h2>
            <p className="text-white/80 md:text-xl/relaxed">
              {content.text}
            </p>
             {content.buttonText && (
               <Button asChild>
                 <Link href={content.buttonLink || '#'}>
                   {content.buttonText}
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
    if (!content.videos || content.videos.length === 0) {
        return null;
    }
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline text-white">
                        {content.title || 'Our Video Gallery'}
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
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                                <CardHeader>
                                    <CardTitle>{video.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{video.description}</p>
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
};

function DynamicSectionsRenderer({ sections }: { sections: any[] }) {
    if (!sections || sections.length === 0) {
        return null;
    }
  
    const visibleSections = sections
        .filter(section => section.visible !== false)
        .sort((a,b) => a.order - b.order);

    return (
        <>
            {visibleSections.map((section) => {
                const SectionComponent = sectionComponents[section.type as keyof typeof sectionComponents];
                if (!SectionComponent) {
                    return null;
                }
                return <SectionComponent key={section.id} content={section.content} />;
            })}
        </>
    );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const [postData, setPostData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !params.slug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(collection(firestore, 'blog_posts'), where('slug', '==', params.slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Blog post not found');
        } else {
          const doc = querySnapshot.docs[0];
          setPostData({ id: doc.id, ...doc.data() });
        }
      } catch (e) {
        console.error("Error fetching blog post:", e);
        setError('Error loading page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [firestore, params.slug]);
  
  const renderHeader = () => {
      if (!postData) return null;
      return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28">
            <div className="absolute inset-0">
                {postData.imageUrl ? (
                    <Image
                        src={postData.imageUrl}
                        alt={postData.title}
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
                    {postData.title}
                </h1>
                {postData.createdAt && (
                     <p className="mt-4 text-white/80">
                        Posted on {format(postData.createdAt.toDate(), 'PPP')}
                    </p>
                )}
            </div>
        </section>
      )
  }

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-dvh bg-transparent">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                 <p className="text-white">Loading Post...</p>
            </main>
            <Footer />
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col min-h-dvh bg-transparent">
            <Header />
            <main className="flex-1 flex items-center justify-center text-center">
                 <div>
                    <h1 className="text-4xl font-bold text-white">404</h1>
                    <p className="text-red-200">{error}</p>
                    <Button asChild variant="link" className="mt-4"><Link href="/">Go back home</Link></Button>
                 </div>
            </main>
            <Footer />
        </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
        <Header />
        <main className="flex-1">
            {renderHeader()}
            <div className="container py-8 max-w-4xl">
                 <DynamicSectionsRenderer sections={postData?.content || []} />
            </div>
            <ContactSection />
        </main>
        <Footer />
    </div>
  );
}
