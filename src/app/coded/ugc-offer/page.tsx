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
import { DndSectionSorter } from '@/app/admin/components/dnd-section-sorter';

const Section = ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <section className={`py-16 md:py-24 ${className}`} {...props}>
        <div className="container mx-auto px-4">
            {children}
        </div>
    </section>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={`text-3xl md:text-5xl font-bold text-center font-headline ${className}`}>{children}</h2>
);


const HeroSection = ({ content }: { content: any }) => (
    <Section className="bg-gray-900 text-white text-center !py-0">
        <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center">
            <Image src={content?.backgroundImageUrl || "https://picsum.photos/seed/ugc-hero/1200/800"} layout="fill" objectFit="cover" alt="Video Shoot" className="opacity-30" />
            <div className="relative z-10">
                <div className="flex justify-center mb-4 h-16 w-16 relative">
                    <SiteLogo />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
                    {content?.title || <Skeleton className="h-12 w-3/4 mx-auto" />}
                </h1>
            </div>
        </div>
    </Section>
);

const ProblemSection = ({ content }: { content: any }) => (
    <Section className="bg-white">
        <div className="text-center">
            <div className="flex justify-center items-center gap-4">
                 <Image src={content?.mainImageUrl || "https://picsum.photos/seed/megaphone/200/200"} width={150} height={150} alt="Megaphone" className="rounded-full" data-ai-hint="woman megaphone" />
                <div>
                    <h2 className="text-red-600 text-4xl md:text-6xl font-bold font-headline">{content?.title || <Skeleton className="h-12 w-64" />}</h2>
                    <p className="max-w-md mx-auto mt-2 text-gray-600">
                        {content?.subtitle || <Skeleton className="h-6 w-full mt-2" />}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto mt-12">
                {(content?.metrics || []).map((metric: any, index: number) => (
                     <div key={index} className="text-center">
                        <DynamicIcon iconName={metric.iconName} className="w-8 h-8 mx-auto text-red-600" />
                        <p>{metric.label}</p>
                    </div>
                ))}
            </div>
            <Button asChild size="lg" className="mt-12 bg-red-600 hover:bg-red-700 text-white text-lg">
                <Link href="#contact">{content?.ctaButtonText || "خذ أفضل ما في السوق وبأقل تكلفة من BOLDNET"}</Link>
            </Button>
        </div>
    </Section>
);

const ChecklistSection = ({ content }: { content: any }) => (
    <Section className="bg-red-600 text-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <p>{content?.introText || "..."}</p>
                <ul className="space-y-3">
                    {(content?.positiveListItems || []).map((item: string, i: number) => <li key={i} className="flex items-center gap-3"><CheckCircle /> {item}</li>)}
                </ul>
                <p>{content?.costIntroText || "..."}</p>
                 <ul className="space-y-3">
                    {(content?.costListItems || []).map((item: string, i: number) => <li key={i} className="flex items-center gap-3"><ChevronDown /> {item}</li>)}
                </ul>
            </div>
            <div>
                <Image src={content?.mainImageUrl || "https://picsum.photos/seed/checklist-man/500/500"} width={500} height={500} alt="Happy man" className="rounded-full" data-ai-hint="man laptop thumbs up"/>
            </div>
        </div>
    </Section>
);

const PainPointSection = ({ content }: { content: any }) => (
    <Section className="bg-white">
        <div className="text-center mb-8">
            <p className="text-gray-500 text-lg">{content?.subtitle || "..."}</p>
            <SectionTitle className="text-red-600">{content?.title || "..."}</SectionTitle>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
                <Image src={content?.mainImageUrl || "https://picsum.photos/seed/confused-woman/500/500"} width={500} height={500} alt="Confused woman" className="rounded-lg" data-ai-hint="woman confused phone" />
            </div>
            <div className="space-y-4">
                {(content?.painPoints || []).map((point: string, i: number) => (
                    <Card key={i} className="p-4 bg-red-50 border-red-200"><p>{point}</p></Card>
                ))}
            </div>
        </div>
    </Section>
);

const FocusSection = ({ content }: { content: any }) => (
    <Section className="bg-red-600 text-white">
         <SectionTitle>{content?.title || "..."}</SectionTitle>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-1 bg-white/10 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-4">{content?.mainPoint || "..."}</h3>
                <p>نحن نتكفل بكل شيء من الألف إلى الياء لنوفر لك محتوى يبيع.</p>
            </div>
             <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(content?.features || []).map((feature: any, i: number) => (
                    <Card key={i} className="bg-white/20 p-4 text-center">
                        <DynamicIcon iconName={feature.iconName} className="w-10 h-10 mx-auto mb-2" />
                        <p>{feature.label}</p>
                    </Card>
                ))}
            </div>
        </div>
    </Section>
);

const MetaSection = ({ content }: { content: any }) => (
    <Section className="bg-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                 <Image src={content?.mainImageUrl || "https://picsum.photos/seed/meta-guy/500/300"} width={500} height={300} alt="Man with laptop" className="rounded-lg" data-ai-hint="man business suit laptop"/>
            </div>
            <div className="text-center">
                <Bot className="w-20 h-20 mx-auto text-blue-600 mb-4"/>
                <p className="bg-red-600 text-white p-4 rounded-lg text-lg">{content?.mainText || "..."}</p>
            </div>
        </div>
    </Section>
);

const TimelineSection = ({ content }: { content: any }) => (
    <Section className="bg-white text-center">
        <Plus className="w-10 h-10 mx-auto text-red-600 bg-red-100 rounded-full p-2 mb-8" />
        <div className="relative max-w-sm mx-auto">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-12">
                {(content?.steps || []).map((step: any, i: number) => (
                    <div key={i} className={`relative flex items-center gap-8 ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center z-10">{step.stepNumber}</div>
                        <p>{step.text}</p>
                    </div>
                ))}
            </div>
        </div>
        <p className="mt-8 text-gray-600">{content?.conclusionText || "..."}</p>
    </Section>
);

const WeDoEverythingSection = ({ content }: { content: any }) => (
    <Section className="bg-red-100">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                 <Image src={content?.mainImageUrl || "https://picsum.photos/seed/woman-camera/500/500"} width={500} height={500} alt="Woman with camera" className="rounded-lg" data-ai-hint="woman laptop camera" />
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-red-600 font-headline mb-4">{content?.title || "..."}</h2>
                <ul className="space-y-3 text-gray-700">
                    {(content?.listItems || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
                 <Button asChild size="lg" className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white text-lg">
                    <Link href="#contact">{content?.ctaButtonText || "..."}</Link>
                </Button>
                <p className="text-center text-sm text-gray-500 mt-2">{content?.ctaSubtitle || "..."}</p>
            </div>
        </div>
    </Section>
);

const GoalsSection = ({ content }: { content: any }) => (
    <Section className="bg-white text-center">
        <SectionTitle className="text-red-600">{content?.title || "..."}</SectionTitle>
         <div className="relative max-w-2xl mx-auto mt-8">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center z-10"><Plus /></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            {(content?.goals || []).map((goal: string, i: number) => <div key={i} className="bg-red-600 text-white p-4 rounded-lg">{goal}</div>)}
        </div>
        <p className="mt-8 text-xl font-bold">{content?.conclusionText || "..."}</p>
    </Section>
);

const ContactSection = ({ content }: { content: any }) => (
    <div id="contact">
        <Section className="bg-gray-100">
            <h2 className="text-3xl font-bold text-center mb-8">{content?.title || "..."}</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                {content?.subtitle || "..."}
            </p>
            <div className="max-w-xl mx-auto mt-8">
                <Card className="p-8">
                    <Link href="/quote">
                        <Button size="lg" className="w-full text-lg">اطلب عرض سعر الآن</Button>
                    </Link>
                </Card>
            </div>
        </Section>
    </div>
);


const sectionComponents: Record<string, React.FC<any>> = {
    hero: HeroSection,
    problem: ProblemSection,
    checklist: ChecklistSection,
    painPoint: PainPointSection,
    focus: FocusSection,
    meta: MetaSection,
    timeline: TimelineSection,
    weDoEverything: WeDoEverythingSection,
    goals: GoalsSection,
    contact: ContactSection,
};

function UgcOfferContent() {
    const firestore = useFirestore();
    const pageDocRef = useMemoFirebase(() => doc(firestore, 'ugc_offer_pages', 'main'), [firestore]);
    const { data: pageContent, isLoading } = useDoc(pageDocRef);

    const sectionOrder = useMemo(() => pageContent?.sectionOrder || [], [pageContent]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-screen w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <main dir="rtl" className="bg-white text-gray-800 font-sans">
             {sectionOrder.map((sectionKey: string) => {
                const Component = sectionComponents[sectionKey];
                if (!Component || !pageContent?.[sectionKey]) {
                    return null;
                }
                const content = pageContent[sectionKey];
                return <Component key={sectionKey} content={content} />;
            })}
        </main>
    );
}

export default function UgcOfferPage() {
    return (
        <FirebaseClientProvider>
            <UgcOfferContent />
        </FirebaseClientProvider>
    );
}

    