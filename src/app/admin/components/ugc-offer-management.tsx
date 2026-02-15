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

    if (isLoading) return <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
    </div>;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-center">
                 <Button onClick={onBack} variant="outline">Back to Coded Pages</Button>
                 <Button onClick={() => handleSave()}>Save Page</Button>
            </div>
            
            <DndSectionSorter
                items={sectionItems}
                onOrderChange={handleOrderChange}
            />
           
            <Accordion type="multiple" className="w-full" defaultValue={['item-hero']}>
                <AccordionItem value="item-hero">
                    <AccordionTrigger>{SECTION_CONFIG.hero.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <div className="grid gap-2">
                            <Label>Title</Label>
                            <Textarea value={formData.hero?.title} onChange={(e) => handleFieldChange('hero', 'title', e.target.value)} />
                        </div>
                        <ImageUpload label="Background Image" value={formData.hero?.backgroundImageUrl} onChange={(url) => handleFieldChange('hero', 'backgroundImageUrl', url)} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-problem">
                    <AccordionTrigger>{SECTION_CONFIG.problem.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <div className="grid gap-2"><Label>Title</Label><Input value={formData.problem?.title} onChange={(e) => handleFieldChange('problem', 'title', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Subtitle</Label><Input value={formData.problem?.subtitle} onChange={(e) => handleFieldChange('problem', 'subtitle', e.target.value)} /></div>
                        <ImageUpload label="Main Image" value={formData.problem?.mainImageUrl} onChange={(url) => handleFieldChange('problem', 'mainImageUrl', url)} />
                        <Label>Metrics</Label>
                        {(formData.problem?.metrics || []).map((item: any, index: number) => (
                            <Card key={index} className="p-2"><div className="flex gap-2 items-center">
                                <IconSelect value={item.iconName} onChange={(val) => handleObjectInListChange('problem', 'metrics', index, 'iconName', val)} />
                                <Input placeholder="Label" value={item.label} onChange={(e) => handleObjectInListChange('problem', 'metrics', index, 'label', e.target.value)} />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('problem', 'metrics', index)}><Trash2 className="w-4 h-4" /></Button>
                            </div></Card>
                        ))}
                        <Button variant="outline" onClick={() => handleAddObjectInList('problem', 'metrics', { iconName: "TrendingUp", label: "" })}><Plus className="w-4 h-4 mr-2" /> Add Metric</Button>
                        <div className="grid gap-2"><Label>CTA Button Text</Label><Input value={formData.problem?.ctaButtonText} onChange={(e) => handleFieldChange('problem', 'ctaButtonText', e.target.value)} /></div>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="item-checklist">
                    <AccordionTrigger>{SECTION_CONFIG.checklist.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                         <div className="grid gap-2"><Label>Intro Text</Label><Textarea value={formData.checklist?.introText} onChange={(e) => handleFieldChange('checklist', 'introText', e.target.value)} /></div>
                         <Label>Positive List</Label>
                        {(formData.checklist?.positiveListItems || []).map((item: string, index: number) => (
                            <div key={index} className="flex gap-2 items-center">
                                <Input value={item} onChange={(e) => handleListItemChange('checklist', 'positiveListItems', index, e.target.value)} />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('checklist', 'positiveListItems', index)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => handleAddListItem('checklist', 'positiveListItems')}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                         <div className="grid gap-2"><Label>Cost Intro Text</Label><Textarea value={formData.checklist?.costIntroText} onChange={(e) => handleFieldChange('checklist', 'costIntroText', e.target.value)} /></div>
                          <Label>Cost List</Label>
                        {(formData.checklist?.costListItems || []).map((item: string, index: number) => (
                             <div key={index} className="flex gap-2 items-center">
                                <Input value={item} onChange={(e) => handleListItemChange('checklist', 'costListItems', index, e.target.value)} />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('checklist', 'costListItems', index)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => handleAddListItem('checklist', 'costListItems')}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                         <ImageUpload label="Main Image" value={formData.checklist?.mainImageUrl} onChange={(url) => handleFieldChange('checklist', 'mainImageUrl', url)} />
                    </AccordionContent>
                </AccordionItem>
                
                 <AccordionItem value="item-painPoint">
                    <AccordionTrigger>{SECTION_CONFIG.painPoint.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <div className="grid gap-2"><Label>Subtitle</Label><Input value={formData.painPoint?.subtitle} onChange={(e) => handleFieldChange('painPoint', 'subtitle', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Title</Label><Input value={formData.painPoint?.title} onChange={(e) => handleFieldChange('painPoint', 'title', e.target.value)} /></div>
                        <ImageUpload label="Main Image" value={formData.painPoint?.mainImageUrl} onChange={(url) => handleFieldChange('painPoint', 'mainImageUrl', url)} />
                         <Label>Pain Points</Label>
                        {(formData.painPoint?.painPoints || []).map((item: string, index: number) => (
                             <div key={index} className="flex gap-2 items-center">
                                <Input value={item} onChange={(e) => handleListItemChange('painPoint', 'painPoints', index, e.target.value)} />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('painPoint', 'painPoints', index)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => handleAddListItem('painPoint', 'painPoints')}><Plus className="w-4 h-4 mr-2" />Add Pain Point</Button>
                    </AccordionContent>
                </AccordionItem>
                {/* Add other accordions for other sections here, following the same pattern */}

            </Accordion>
            <div className="text-right mt-4">
                 <Button onClick={() => handleSave()}>Save Page</Button>
            </div>
        </div>
    );
}

    