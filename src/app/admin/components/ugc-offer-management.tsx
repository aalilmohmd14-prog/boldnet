'use client';
import { useState, useEffect, useMemo } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Trash2 } from 'lucide-react';
import { IconSelect } from '@/components/ui/icon-select';
import { DndSectionSorter, SectionItem } from './dnd-section-sorter';
import { Skeleton } from '@/components/ui/skeleton';

const SECTION_CONFIG: Record<string, { label: string }> = {
    hero: { label: 'Hero Section' },
    problem: { label: 'Problem Section' },
    checklist: { label: 'Checklist Section' },
    painPoint: { label: 'Pain Point Section' },
    focus: { label: 'Focus Section' },
    meta: { label: 'Meta Section' },
    timeline: { label: 'Timeline Section' },
    weDoEverything: { label: 'We Do Everything Section' },
    goals: { label: 'Goals Section' },
    contact: { label: 'Contact Section' },
};

const DEFAULT_SECTION_ORDER = [
    'hero',
    'problem',
    'checklist',
    'painPoint',
    'focus',
    'meta',
    'timeline',
    'weDoEverything',
    'goals',
    'contact',
];

const DEFAULT_FORM_DATA = {
    hero: { title: "BOLDNET ليست الخيار المناسب لك إذا كنت تبحث عن فيديوهات UGC عادية", backgroundImageUrl: "https://picsum.photos/seed/ugc-hero/1200/800" },
    problem: { title: "الحل في BOLDNET", subtitle: "لأن 95% من البراندات تفشل في تحقيق أهدافها التسويقية بسبب ضعف المحتوى البصري.", mainImageUrl: "https://picsum.photos/seed/megaphone/200/200", metrics: [{iconName: "MousePointerClick", label: "CTR"}, {iconName: "RefreshCw", label: "CONV"}, {iconName: "CircleDollarSign", label: "AOV"}, {iconName: "TrendingUp", label: "ROAS"}, {iconName: "UserPlus", label: "C.ACQ"}], ctaButtonText: "خذ أفضل ما في السوق وبأقل تكلفة من BOLDNET" },
    checklist: { introText: "من خلال خبرة مدتها 3 سنوات في التجارة الإلكترونية، اكتشفنا أن أفضل الممارسات التسويقية هي:", positiveListItems: ["فيديوهات إحترافية", "محتوى متجدد", "مواكبة الترند"], costIntroText: "ولكن هذا ما سيكلفك...", costListItems: ["تكلفة الإعلانات", "فريق تسويق", "توظيف وتدريب"], mainImageUrl: "https://picsum.photos/seed/checklist-man/500/500" },
    painPoint: { subtitle: "ما سئمت من هذا الوضع؟", title: "لهذا أغلب البراندات فيديوهاتها كلها متشابهة", mainImageUrl: "https://picsum.photos/seed/confused-woman/500/500", painPoints: ["تعرف أن المنافسين يقلدونها بعد مدة فقط", "تضطر لدفع مبالغ ضخمة للمؤثرين", "لا تجد صناع محتوى UGC"] },
    focus: { title: "في BOLDNET نركز على العكس +", mainPoint: "كل ما عليك هو أن ترسل لنا منتجك والباقي علينا", features: [{iconName: "PenSquare", label: "أفكار إبداعية"}, {iconName: "Users", label: "صناع محتوى"}, {iconName: "PenTool", label: "كتابة السيناريو"}, {iconName: "Camera", label: "تصوير احترافي"}, {iconName: "Lamp", label: "بناء الديكور"}, {iconName: "Film", label: "مونتاج احترافي"}] },
    meta: { mainImageUrl: "https://picsum.photos/seed/meta-guy/500/300", mainText: "نعرف ما تريد META وهذا ما نوفره لها، لا نكتفي بالفيديو الجميل بل بفعاليته" },
    timeline: { steps: [{stepNumber: "1", text: "استلام المنتج"}, {stepNumber: "2", text: "تحليل المنتج"}, {stepNumber: "3", text: "التصوير"}, {stepNumber: "4", text: "المونتاج"}], conclusionText: "وفي النهاية تحصل على فيديو إعلاني احتراfi يبيع" },
    weDoEverything: { mainImageUrl: "https://picsum.photos/seed/woman-camera/500/500", title: "BOLDNET نقوم بكل شيء", listItems: ["✓ فيديوهات إعلانية احترافية عالية الجودة", "✓ فريق من صناع المحتوى والممثلين", "✓ سيناريوهات وحوارات احترافية ومبيعية", "✓ مونتاج احتراfi وموسيقى بدون حقوق ملكية"], ctaButtonText: "لتطوير عملك", ctaSubtitle: "شاهد كيف سنساعدك في تحقيق أهدافك" },
    goals: { title: "أما إن كنت تريد", goals: ["زيادة المبيعات", "الوعي", "CTR", "CVR"], conclusionText: "أنت في المكان المناسب في الوقت المناسب" },
    contact: { title: "تواصل معنا", subtitle: "املأ النموذج أدناه وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن لمناقشة كيف يمكننا مساعدتك في تحقيق أهدافك." }
};

export default function UgcOfferManagement({ onBack }: { onBack: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const pageDocRef = useMemoFirebase(() => doc(firestore, 'ugc_offer_pages', 'main'), [firestore]);
    const { data: pageData, isLoading } = useDoc(pageDocRef);

    const [formData, setFormData] = useState<any>({});
    const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);

    useEffect(() => {
        if (pageData) {
            setFormData(pageData);
            setSectionOrder(pageData.sectionOrder || DEFAULT_SECTION_ORDER);
        } else if (!isLoading) {
            setFormData(DEFAULT_FORM_DATA);
            setSectionOrder(DEFAULT_SECTION_ORDER);
        }
    }, [pageData, isLoading]);

    const sectionItems: SectionItem[] = useMemo(() => {
        return sectionOrder.map(key => ({
            id: key,
            label: SECTION_CONFIG[key]?.label || key,
        }));
    }, [sectionOrder]);

    const handleSave = async (newOrder?: string[]) => {
        const orderToSave = newOrder || sectionOrder;
        try {
            await setDoc(pageDocRef, { ...formData, sectionOrder: orderToSave }, { merge: true });
            toast({ title: 'Page Saved', description: 'UGC Offer page content has been updated.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the page content.' });
        }
    };
    
    const handleOrderChange = (newOrder: string[]) => {
        setSectionOrder(newOrder);
        handleSave(newOrder); 
    };

    const handleFieldChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleListItemChange = (section: string, listName: string, index: number, value: string) => {
        const newList = [...(formData[section]?.[listName] || [])];
        newList[index] = value;
        handleFieldChange(section, listName, newList);
    };

    const handleAddListItem = (section: string, listName: string) => {
        const newList = [...(formData[section]?.[listName] || []), ""];
        handleFieldChange(section, listName, newList);
    };
    
    const handleRemoveListItem = (section: string, listName: string, index: number) => {
        const newList = [...(formData[section]?.[listName] || [])];
        newList.splice(index, 1);
        handleFieldChange(section, listName, newList);
    };

    const handleObjectInListChange = (section: string, listName: string, index: number, field: string, value: any) => {
        setFormData((prevData: any) => {
            const newData = { ...prevData };
            const newList = [...(newData[section]?.[listName] || [])];
            newList[index] = { ...newList[index], [field]: value };
            newData[section] = { ...newData[section], [listName]: newList };
            return newData;
        });
    };
    
    const handleAddObjectInList = (section: string, listName: string, defaultObject: any) => {
        const newList = [...(formData[section]?.[listName] || []), defaultObject];
        handleFieldChange(section, listName, newList);
    };

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /></div>;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-center">
                 <Button onClick={onBack} variant="outline">Retour aux pages</Button>
                 <Button onClick={() => handleSave()}>Enregistrer tout</Button>
            </div>
            
            <DndSectionSorter items={sectionItems} onOrderChange={handleOrderChange} />
           
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="hero">
                    <AccordionTrigger>{SECTION_CONFIG.hero.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <Textarea label="Titre" value={formData.hero?.title} onChange={(e) => handleFieldChange('hero', 'title', e.target.value)} />
                        <ImageUpload label="Image de fond" value={formData.hero?.backgroundImageUrl} onChange={(val) => handleFieldChange('hero', 'backgroundImageUrl', val)} enableStyling />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="problem">
                    <AccordionTrigger>{SECTION_CONFIG.problem.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <Input label="Titre" value={formData.problem?.title} onChange={(e) => handleFieldChange('problem', 'title', e.target.value)} />
                        <Input label="Sous-titre" value={formData.problem?.subtitle} onChange={(e) => handleFieldChange('problem', 'subtitle', e.target.value)} />
                        <ImageUpload label="Image Principale" value={formData.problem?.mainImageUrl} onChange={(val) => handleFieldChange('problem', 'mainImageUrl', val)} enableStyling />
                        <Label>Métriques</Label>
                        {(formData.problem?.metrics || []).map((item: any, index: number) => (
                            <div key={index} className="flex gap-2 items-center border p-2 rounded-md">
                                <IconSelect value={item.iconName} onChange={(val) => handleObjectInListChange('problem', 'metrics', index, 'iconName', val)} />
                                <Input placeholder="Label" value={item.label} onChange={(e) => handleObjectInListChange('problem', 'metrics', index, 'label', e.target.value)} />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('problem', 'metrics', index)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => handleAddObjectInList('problem', 'metrics', { iconName: "TrendingUp", label: "" })}><Plus className="w-4 h-4 mr-2" /> Ajouter une métrique</Button>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="checklist">
                    <AccordionTrigger>{SECTION_CONFIG.checklist.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                         <Textarea label="Texte d'intro" value={formData.checklist?.introText} onChange={(e) => handleFieldChange('checklist', 'introText', e.target.value)} />
                         <ImageUpload label="Image Principale" value={formData.checklist?.mainImageUrl} onChange={(val) => handleFieldChange('checklist', 'mainImageUrl', val)} enableStyling />
                    </AccordionContent>
                </AccordionItem>
                
                 <AccordionItem value="painPoint">
                    <AccordionTrigger>{SECTION_CONFIG.painPoint.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <Input label="Titre" value={formData.painPoint?.title} onChange={(e) => handleFieldChange('painPoint', 'title', e.target.value)} />
                        <ImageUpload label="Image Principale" value={formData.painPoint?.mainImageUrl} onChange={(val) => handleFieldChange('painPoint', 'mainImageUrl', val)} enableStyling />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="meta">
                    <AccordionTrigger>{SECTION_CONFIG.meta.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <ImageUpload label="Image Meta" value={formData.meta?.mainImageUrl} onChange={(val) => handleFieldChange('meta', 'mainImageUrl', val)} enableStyling />
                        <Textarea label="Texte" value={formData.meta?.mainText} onChange={(e) => handleFieldChange('meta', 'mainText', e.target.value)} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="weDoEverything">
                    <AccordionTrigger>{SECTION_CONFIG.weDoEverything.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <ImageUpload label="Image" value={formData.weDoEverything?.mainImageUrl} onChange={(val) => handleFieldChange('weDoEverything', 'mainImageUrl', val)} enableStyling />
                        <Input label="Titre" value={formData.weDoEverything?.title} onChange={(e) => handleFieldChange('weDoEverything', 'title', e.target.value)} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="text-right mt-4">
                 <Button onClick={() => handleSave()}>Enregistrer tout</Button>
            </div>
        </div>
    );
}