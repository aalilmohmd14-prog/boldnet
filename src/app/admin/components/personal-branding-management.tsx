'use client';
import { useState, useEffect, useMemo } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { IconSelect } from '@/components/ui/icon-select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndSectionSorter, SectionItem } from './dnd-section-sorter';

const SECTION_CONFIG: Record<string, { label: string }> = {
    hero: { label: 'Hero Section' },
    team: { label: 'Professions Section' },
    problem: { label: 'Problem Section' },
    expertise: { label: 'Expertise Section' },
    results: { label: 'Results Section' },
    beneficiaries: { label: 'Beneficiaries Section' },
    timelineMethod: { label: 'Timeline Method Section' },
    method: { label: 'Method Section' },
    finalCta: { label: 'Final CTA Section' },
};

const DEFAULT_SECTION_ORDER = [
    'hero',
    'team',
    'problem',
    'expertise',
    'results',
    'beneficiaries',
    'timelineMethod',
    'method',
    'finalCta',
];

export default function PersonalBrandingManagement({ onBack }: { onBack: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const pageDocRef = useMemoFirebase(() => doc(firestore, 'personal_branding_pages', 'main'), [firestore]);
    const { data: pageData, isLoading } = useDoc(pageDocRef);

    const [formData, setFormData] = useState<any>({});
    const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);

    useEffect(() => {
        if (pageData) {
            setFormData(pageData);
            setSectionOrder(pageData.sectionOrder || DEFAULT_SECTION_ORDER);
        } else {
            setFormData({
                hero: { title: "", subtitle: "", ctaButtonText: "", backgroundImageUrl: "", logoSvg: "", logoSize: 96},
                team: { title: "", backgroundImage: "", professions: [] },
                problem: { title: "", mainPoint: "", listItems: [], howToTitle: "", howToListItems: [], question: "", ctaButtonText: ""},
                expertise: { title: "", subtitle: "", backgroundImageUrl: ""},
                beneficiaries: { title: "", items: [], conclusion: "", ctaButtonText: "" },
                results: { title: "", withoutTitle: "", withoutItems: [], withoutImage: "", withTitle: "", withItems: [], withImage: "", bonus: "", ctaButtonText: ""},
                method: { conclusion: "", ctaButtonText: "", steps: [] },
                timelineMethod: { title: "", ctaButtonText: "", steps: [] },
                finalCta: { title: "", subtitle: "", backgroundImageUrl: "" }
            });
            setSectionOrder(DEFAULT_SECTION_ORDER);
        }
    }, [pageData]);
    
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
            toast({ title: 'Page enregistrée', description: 'Le contenu de la page Personal Branding a été mis à jour.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'enregistrer la page.' });
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
    
    const handleSubStepChange = (stepIndex: number, subStepIndex: number, field: 'name' | 'iconName', value: string) => {
        setFormData((prevData: any) => {
            const newData = { ...prevData };
            const steps = [...(newData.method?.steps || [])];
            const subSteps = [...(steps[stepIndex]?.subSteps || [])];
            subSteps[subStepIndex] = { ...subSteps[subStepIndex], [field]: value };
            steps[stepIndex] = { ...steps[stepIndex], subSteps: subSteps };
            newData.method = { ...newData.method, steps: steps };
            return newData;
        });
    };

    const handleAddSubStep = (stepIndex: number) => {
        setFormData((prevData: any) => {
            const newData = { ...prevData };
            const steps = [...(newData.method?.steps || [])];
            const subSteps = [...(steps[stepIndex]?.subSteps || []), { name: "", iconName: "PenTool" }];
            steps[stepIndex] = { ...steps[stepIndex], subSteps: subSteps };
            newData.method = { ...newData.method, steps: steps };
            return newData;
        });
    };

    const handleRemoveSubStep = (stepIndex: number, subStepIndex: number) => {
        setFormData((prevData: any) => {
            const newData = { ...prevData };
            const steps = [...(newData.method?.steps || [])];
            const subSteps = [...(steps[stepIndex]?.subSteps || [])];
            subSteps.splice(subStepIndex, 1);
            steps[stepIndex] = { ...steps[stepIndex], subSteps: subSteps };
            newData.method = { ...newData.method, steps: steps };
            return newData;
        });
    };


    if (isLoading) return <p>Chargement du contenu...</p>;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-center">
                 <Button onClick={onBack} variant="outline">Retour aux pages</Button>
                 <Button onClick={() => handleSave()}>Enregistrer tout</Button>
            </div>
            
            <DndSectionSorter items={sectionItems} onOrderChange={handleOrderChange} />
           
            <Accordion type="single" collapsible className="w-full">
                {/* Hero Section */}
                <AccordionItem value="hero">
                    <AccordionTrigger>{SECTION_CONFIG.hero.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <ImageUpload label="Image de fond" value={formData.hero?.backgroundImageUrl} onChange={(val) => handleFieldChange('hero', 'backgroundImageUrl', val)} enableStyling />
                        <div className="grid gap-2">
                            <Label>Code SVG du Logo</Label>
                            <Textarea value={formData.hero?.logoSvg} onChange={(e) => handleFieldChange('hero', 'logoSvg', e.target.value)} placeholder="<svg>...</svg>" className="h-32 font-mono" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Taille du Logo (px)</Label>
                            <Input type="number" value={formData.hero?.logoSize} onChange={(e) => handleFieldChange('hero', 'logoSize', Number(e.target.value))} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Titre</Label>
                            <Input value={formData.hero?.title} onChange={(e) => handleFieldChange('hero', 'title', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Sous-titre</Label>
                            <Textarea value={formData.hero?.subtitle} onChange={(e) => handleFieldChange('hero', 'subtitle', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Texte du Bouton CTA</Label>
                            <Input value={formData.hero?.ctaButtonText} onChange={(e) => handleFieldChange('hero', 'ctaButtonText', e.target.value)} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                {/* Professions Section */}
                <AccordionItem value="team">
                    <AccordionTrigger>{SECTION_CONFIG.team.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                         <div className="grid gap-2">
                            <Label>Titre</Label>
                            <Input value={formData.team?.title} onChange={(e) => handleFieldChange('team', 'title', e.target.value)} />
                        </div>
                        <ImageUpload label="Image de fond" value={formData.team?.backgroundImageUrl} onChange={(val) => handleFieldChange('team', 'backgroundImageUrl', val)} enableStyling />
                        <Label>Professions</Label>
                        <div className="space-y-2">
                        {(formData.team?.professions || []).map((prof: any, index: number) => (
                             <Collapsible key={index} asChild>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <CollapsibleTrigger asChild>
                                            <button className="flex-1 text-left flex items-center justify-between">
                                                <CardTitle className="text-base">{prof.name || `Profession ${index + 1}`}</CardTitle>
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </CollapsibleTrigger>
                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleRemoveListItem('team', 'professions', index)}><Trash2 className="w-4 h-4" /></Button>
                                    </CardHeader>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 p-4 space-y-4">
                                            <ImageUpload label={`Image ${index+1}`} value={prof.image} onChange={(val) => handleObjectInListChange('team', 'professions', index, 'image', val)} enableStyling />
                                            <Input placeholder="Nom" value={prof.name} onChange={(e) => handleObjectInListChange('team', 'professions', index, 'name', e.target.value)} />
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        ))}
                        </div>
                        <Button variant="outline" onClick={() => handleAddObjectInList('team', 'professions', { name: "", image: "" })}><Plus className="w-4 h-4 mr-2" /> Ajouter une profession</Button>
                    </AccordionContent>
                </AccordionItem>

                 {/* Problem Section */}
                <AccordionItem value="problem">
                    <AccordionTrigger>{SECTION_CONFIG.problem.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <div className="grid gap-2"><Label>Titre</Label><Input value={formData.problem?.title} onChange={(e) => handleFieldChange('problem', 'title', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Point Principal</Label><Input value={formData.problem?.mainPoint} onChange={(e) => handleFieldChange('problem', 'mainPoint', e.target.value)} /></div>
                        <Label>Liste des problèmes</Label>
                        {(formData.problem?.listItems || []).map((item: string, index: number) => (
                            <div key={index} className="flex gap-2 items-center">
                                <Input value={item} onChange={(e) => handleListItemChange('problem', 'listItems', index, e.target.value)} />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('problem', 'listItems', index)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={() => handleAddListItem('problem', 'listItems')}><Plus className="w-4 h-4 mr-2" />Ajouter un élément</Button>
                    </AccordionContent>
                </AccordionItem>
                
                 {/* Expertise Section */}
                <AccordionItem value="expertise">
                    <AccordionTrigger>{SECTION_CONFIG.expertise.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <ImageUpload label="Image de fond" value={formData.expertise?.backgroundImageUrl} onChange={(val) => handleFieldChange('expertise', 'backgroundImageUrl', val)} enableStyling />
                        <div className="grid gap-2"><Label>Titre</Label><Input value={formData.expertise?.title} onChange={(e) => handleFieldChange('expertise', 'title', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Sous-titre</Label><Input value={formData.expertise?.subtitle} onChange={(e) => handleFieldChange('expertise', 'subtitle', e.target.value)} /></div>
                    </AccordionContent>
                </AccordionItem>

                 {/* Results Section */}
                <AccordionItem value="results">
                    <AccordionTrigger>{SECTION_CONFIG.results.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <div className="grid gap-2"><Label>Titre Principal</Label><Input value={formData.results?.title} onChange={(e) => handleFieldChange('results', 'title', e.target.value)} /></div>
                        <Card className="p-4">
                            <Label className="font-bold">Colonne "Avant"</Label>
                            <div className="grid gap-2 mt-2"><Label>Titre</Label><Input value={formData.results?.withoutTitle} onChange={(e) => handleFieldChange('results', 'withoutTitle', e.target.value)} /></div>
                            <ImageUpload label="Image" value={formData.results?.withoutImage} onChange={(val) => handleFieldChange('results', 'withoutImage', val)} enableStyling />
                        </Card>
                        <Card className="p-4">
                             <Label className="font-bold">Colonne "Après"</Label>
                             <div className="grid gap-2 mt-2"><Label>Titre</Label><Input value={formData.results?.withTitle} onChange={(e) => handleFieldChange('results', 'withTitle', e.target.value)} /></div>
                             <ImageUpload label="Image" value={formData.results?.withImage} onChange={(val) => handleFieldChange('results', 'withImage', val)} enableStyling />
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                 {/* Beneficiaries Section */}
                <AccordionItem value="beneficiaries">
                    <AccordionTrigger>{SECTION_CONFIG.beneficiaries.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <div className="grid gap-2"><Label>Titre</Label><Input value={formData.beneficiaries?.title} onChange={(e) => handleFieldChange('beneficiaries', 'title', e.target.value)} /></div>
                        <Label>Éléments</Label>
                        {(formData.beneficiaries?.items || []).map((item: any, index: number) => (
                            <Card key={index} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Bénéficiaire {index + 1}</h4>
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveListItem('beneficiaries', 'items', index)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                                <div className="space-y-4">
                                    <Input placeholder="Nom" value={item.name} onChange={(e) => handleObjectInListChange('beneficiaries', 'items', index, 'name', e.target.value)} />
                                    <Textarea placeholder="Description" value={item.description} onChange={(e) => handleObjectInListChange('beneficiaries', 'items', index, 'description', e.target.value)} />
                                    <ImageUpload label="Image" value={item.imageUrl} onChange={(val) => handleObjectInListChange('beneficiaries', 'items', index, 'imageUrl', val)} enableStyling />
                                </div>
                            </Card>
                        ))}
                        <Button variant="outline" onClick={() => handleAddObjectInList('beneficiaries', 'items', { name: "", description: "", imageUrl: "" })}><Plus className="w-4 h-4 mr-2" /> Ajouter un bénéficiaire</Button>
                    </AccordionContent>
                </AccordionItem>
                
                 {/* Final CTA Section */}
                <AccordionItem value="finalCta">
                    <AccordionTrigger>{SECTION_CONFIG.finalCta.label}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <ImageUpload label="Image de fond" value={formData.finalCta?.backgroundImageUrl} onChange={(val) => handleFieldChange('finalCta', 'backgroundImageUrl', val)} enableStyling />
                        <div className="grid gap-2"><Label>Titre</Label><Input value={formData.finalCta?.title} onChange={(e) => handleFieldChange('finalCta', 'title', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Sous-titre</Label><Input value={formData.finalCta?.subtitle} onChange={(e) => handleFieldChange('finalCta', 'subtitle', e.target.value)} /></div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <div className="text-right mt-4">
                 <Button onClick={() => handleSave()}>Enregistrer tout</Button>
            </div>
        </div>
    );
}