'use client';

import { ArrowLeft, CheckCircle, ChevronDown, Plus, MousePointerClick, RefreshCw, CircleDollarSign, TrendingUp, UserPlus, Film, Bot, PenSquare, Camera, Lamp, Users, PenTool, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { FirebaseClientProvider, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { SiteLogo } from '../personal-branding/components';
import { Skeleton } from '@/components/ui/skeleton';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const Section = ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <section className={`py-16 md:py-24 ${className}`} {...props}>
        <div className="container mx-auto px-4">{children}</div>
    </section>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={`text-3xl md:text-5xl font-bold text-center font-headline ${className}`}>{children}</h2>
);

const getStyledImage = (img: any) => {
    if (typeof img === 'string') return { url: img, zoom: 1, x: 0, y: 0, layoutScale: 1, layoutX: 0, layoutY: 0 };
    return { 
        url: img?.url || '', 
        zoom: img?.zoom ?? 1, 
        x: img?.x ?? 0, 
        y: img?.y ?? 0,
        layoutScale: img?.layoutScale ?? 1,
        layoutX: img?.layoutX ?? 0,
        layoutY: img?.layoutY ?? 0
    };
};

const ImageDisplay = ({ styledImg, alt, className, aspect = "aspect-square" }: { styledImg: any, alt: string, className?: string, aspect?: string }) => {
    if (!styledImg.url) return <div className={cn("bg-muted", aspect, className)} />;
    
    return (
        <div 
            className="relative transition-all duration-300"
            style={{ 
                transform: `translate(${styledImg.layoutX || 0}px, ${styledImg.layoutY || 0}px) scale(${styledImg.layoutScale || 1})`,
                zIndex: (styledImg.layoutScale > 1 || styledImg.layoutX !== 0 || styledImg.layoutY !== 0) ? 10 : 1
            }}
        >
            <div className={cn("relative overflow-hidden", aspect, className)}>
                <div 
                    className="relative w-full h-full transition-transform duration-300"
                    style={{ transform: `scale(${styledImg.zoom || 1}) translate(${styledImg.x || 0}px, ${styledImg.y || 0}px)` }}
                >
                    <Image src={styledImg.url} alt={alt} fill className="object-cover" />
                </div>
            </div>
        </div>
    );
};

const HeroSection = ({ content }: { content: any }) => {
    const bg = getStyledImage(content?.backgroundImageUrl);
    return (
        <Section className="bg-gray-900 text-white text-center !py-0 relative h-[50vh] md:h-[60vh] overflow-hidden">
            {bg.url && (
                <div 
                    className="absolute inset-0 opacity-30 transition-all duration-300"
                    style={{ 
                        transform: `translate(${bg.layoutX}px, ${bg.layoutY}px) scale(${bg.layoutScale})`,
                    }}
                >
                    <div 
                        className="relative w-full h-full"
                        style={{ transform: `scale(${bg.zoom}) translate(${bg.x}px, ${bg.y}px)` }}
                    >
                        <Image src={bg.url} layout="fill" objectFit="cover" alt="Background" />
                    </div>
                </div>
            )}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="flex justify-center mb-4 h-16 w-16 relative"><SiteLogo /></div>
                <h1 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">{content?.title || "..."}</h1>
            </div>
        </Section>
    );
};

const ProblemSection = ({ content }: { content: any }) => {
    const img = getStyledImage(content?.mainImageUrl);
    return (
        <Section className="bg-white">
            <div className="text-center">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <div className="w-[150px] h-[150px] flex-shrink-0">
                        <ImageDisplay styledImg={img} alt="Problem" className="rounded-full shadow-lg" aspect="aspect-square" />
                    </div>
                    <div>
                        <h2 className="text-red-600 text-4xl md:text-6xl font-bold font-headline">{content?.title || "..."}</h2>
                        <p className="max-w-md mx-auto mt-2 text-gray-600">{content?.subtitle || "..."}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto mt-12">
                    {(content?.metrics || []).map((metric: any, index: number) => (
                        <div key={index} className="text-center">
                            <DynamicIcon iconName={metric.iconName} className="w-8 h-8 mx-auto text-red-600" />
                            <p className="mt-2 text-sm">{metric.label}</p>
                        </div>
                    ))}
                </div>
                <Button asChild size="lg" className="mt-12 bg-red-600 hover:bg-red-700 text-white text-lg">
                    <Link href="#contact">{content?.ctaButtonText || "Prendre rendez-vous"}</Link>
                </Button>
            </div>
        </Section>
    );
};

const ChecklistSection = ({ content }: { content: any }) => {
    const img = getStyledImage(content?.mainImageUrl);
    return (
        <Section className="bg-red-600 text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <p className="text-lg">{content?.introText || "..."}</p>
                    <ul className="space-y-3">{(content?.positiveListItems || []).map((item: string, i: number) => <li key={i} className="flex items-center gap-3"><CheckCircle className="h-5 w-5" /> {item}</li>)}</ul>
                    <p className="text-lg">{content?.costIntroText || "..."}</p>
                    <ul className="space-y-3">{(content?.costListItems || []).map((item: string, i: number) => <li key={i} className="flex items-center gap-3"><ChevronDown className="h-5 w-5" /> {item}</li>)}</ul>
                </div>
                <div className="w-full max-w-[500px] mx-auto">
                    <ImageDisplay styledImg={img} alt="Checklist" className="rounded-full shadow-2xl" aspect="aspect-square" />
                </div>
            </div>
        </Section>
    );
};

const PainPointSection = ({ content }: { content: any }) => {
    const img = getStyledImage(content?.mainImageUrl);
    return (
        <Section className="bg-white">
            <div className="text-center mb-12">
                <p className="text-gray-500 text-lg">{content?.subtitle || "..."}</p>
                <SectionTitle className="text-red-600">{content?.title || "..."}</SectionTitle>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <ImageDisplay styledImg={img} alt="Pain point" className="rounded-lg shadow-xl" aspect="aspect-[4/3]" />
                <div className="space-y-4">
                    {(content?.painPoints || []).map((point: string, i: number) => (
                        <Card key={i} className="p-4 bg-red-50 border-red-200"><p>{point}</p></Card>
                    ))}
                </div>
            </div>
        </Section>
    );
};

const MetaSection = ({ content }: { content: any }) => {
    const img = getStyledImage(content?.mainImageUrl);
    return (
        <Section className="bg-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <ImageDisplay styledImg={img} alt="Meta" className="rounded-lg shadow-xl" aspect="aspect-[16/9]" />
                <div className="text-center">
                    <Bot className="w-20 h-20 mx-auto text-blue-600 mb-4" />
                    <p className="bg-red-600 text-white p-6 rounded-lg text-lg leading-relaxed">{content?.mainText || "..."}</p>
                </div>
            </div>
        </Section>
    );
};

const WeDoEverythingSection = ({ content }: { content: any }) => {
    const img = getStyledImage(content?.mainImageUrl);
    return (
        <Section className="bg-red-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="w-full max-w-[500px] mx-auto">
                    <ImageDisplay styledImg={img} alt="We Do Everything" className="rounded-lg shadow-xl" aspect="aspect-square" />
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-red-600 font-headline mb-4">{content?.title || "..."}</h2>
                    <ul className="space-y-3 text-gray-700">{(content?.listItems || []).map((item: string, i: number) => <li key={i} className="flex gap-2"><span>✓</span> {item}</li>)}</ul>
                    <Button asChild size="lg" className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white text-lg"><Link href="#contact">{content?.ctaButtonText || "Commencer"}</Link></Button>
                    <p className="text-center text-sm text-gray-500 mt-2">{content?.ctaSubtitle || "..."}</p>
                </div>
            </div>
        </Section>
    );
};

const sectionComponents: Record<string, React.FC<any>> = {
    hero: HeroSection, problem: ProblemSection, checklist: ChecklistSection, painPoint: PainPointSection, focus: ({content}) => null, meta: MetaSection, timeline: ({content}) => null, weDoEverything: WeDoEverythingSection, goals: ({content}) => null, contact: ({content}) => <div id="contact" className="py-20 text-center"><Button asChild><Link href="/quote">Demander un devis</Link></Button></div>
};

function UgcOfferContent() {
    const firestore = useFirestore();
    const pageDocRef = useMemoFirebase(() => doc(firestore, 'ugc_offer_pages', 'main'), [firestore]);
    const { data: pageContent, isLoading } = useDoc(pageDocRef);
    const sectionOrder = useMemo(() => pageContent?.sectionOrder || [], [pageContent]);
    if (isLoading) return <div className="space-y-8"><Skeleton className="h-screen w-full" /><Skeleton className="h-96 w-full" /></div>;
    return (
        <main dir="rtl" className="bg-white text-gray-800 font-sans">
             {sectionOrder.map((sectionKey: string) => {
                const Component = sectionComponents[sectionKey];
                if (!Component || !pageContent?.[sectionKey]) return null;
                return <Component key={sectionKey} content={pageContent[sectionKey]} />;
            })}
        </main>
    );
}

export default function UgcOfferPage() {
    return <FirebaseClientProvider><UgcOfferContent /></FirebaseClientProvider>;
}
