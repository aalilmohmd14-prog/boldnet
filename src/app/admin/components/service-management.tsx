'use client';

import { useState } from 'react';
import { collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconSelect } from '@/components/ui/icon-select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLanguage } from '@/app/context/language-context';

const defaultLang = { en: '', fr: '' };

function DescriptionEditorModal({ value, onChange, onOpenChange }: { value: typeof defaultLang, onChange: (value: typeof defaultLang) => void, onOpenChange: (open: boolean) => void }) {
    const [localValue, setLocalValue] = useState(value);

    const handleSave = () => {
        onChange(localValue);
        onOpenChange(false);
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Description</DialogTitle>
                    <DialogDescription>
                        Modify the service description using the rich text editor for both languages.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow min-h-0">
                   <Tabs defaultValue="fr" className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="fr">Français</TabsTrigger>
                            <TabsTrigger value="en">English</TabsTrigger>
                        </TabsList>
                        <TabsContent value="fr" className="flex-grow h-0"><RichTextEditor content={localValue.fr} onChange={(val) => setLocalValue(p => ({...p, fr: val}))} /></TabsContent>
                        <TabsContent value="en" className="flex-grow h-0"><RichTextEditor content={localValue.en} onChange={(val) => setLocalValue(p => ({...p, en: val}))} /></TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Description</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ServiceUploader({ serviceToEdit, onComplete }: { serviceToEdit?: any, onComplete: () => void }) {
  const [name, setName] = useState(serviceToEdit?.name || defaultLang);
  const [slug, setSlug] = useState(serviceToEdit?.slug || '');
  const [description, setDescription] = useState(serviceToEdit?.description || defaultLang);
  const [iconName, setIconName] = useState(serviceToEdit?.iconName || '');
  const [iconUrl, setIconUrl] = useState(serviceToEdit?.iconUrl || '');
  const [imageUrl, setImageUrl] = useState(serviceToEdit?.imageUrl || '');
  const [landingPageId, setLandingPageId] = useState(serviceToEdit?.landingPageId || '');
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const { language } = useLanguage();

  const landingPagesCollection = useMemoFirebase(() => collection(firestore, 'landing_pages'), [firestore]);
  const { data: landingPages } = useCollection(landingPagesCollection);


  const servicesCollection = useMemoFirebase(
    () => collection(firestore, 'services'),
    [firestore]
  );

  const handleUpload = async () => {
    if (!name.en || !name.fr || !description.en || !description.fr || !slug) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a name and description in both languages, and a slug.',
      });
      return;
    }

    const finalLandingPageId = landingPageId === 'unlinked' ? '' : landingPageId;
    const serviceData = { name, slug, description, iconName, iconUrl, imageUrl, landingPageId: finalLandingPageId };

    if (serviceToEdit) {
      const docRef = doc(firestore, 'services', serviceToEdit.id);
      await updateDoc(docRef, serviceData);
      toast({ title: 'Service Updated', description: `${name.en} has been successfully updated.` });
    } else {
      await addDocumentNonBlocking(servicesCollection, serviceData);
      toast({ title: 'Service Added', description: `${name.en} has been successfully added.` });
    }

    onComplete();
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{serviceToEdit ? 'Edit Service' : 'Add New Service'}</CardTitle>
          <CardDescription>
            {serviceToEdit ? `Editing the service: ${serviceToEdit.name[language]}` : 'Add a new service offered by your agency.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Service Name</Label>
                <Tabs defaultValue="fr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="fr">Français</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fr">
                        <Input
                            placeholder="ex: Vidéos UGC"
                            value={name.fr}
                            onChange={(e) => setName(prev => ({...prev, fr: e.target.value}))}
                        />
                    </TabsContent>
                    <TabsContent value="en">
                         <Input
                            placeholder="e.g., UGC Videos"
                            value={name.en}
                            onChange={(e) => {
                                const newName = e.target.value;
                                setName(prev => ({...prev, en: newName}));
                                if (!serviceToEdit?.slug) { 
                                    setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
                                }
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="e.g., ugc-videos"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <div 
                className="prose dark:prose-invert min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                dangerouslySetInnerHTML={{ __html: description[language] || "<p class='text-muted-foreground'>Click edit to add a description.</p>"}}
            />
            <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(true)}>Edit Description</Button>
            
          </div>
          <IconSelect value={iconName} onChange={(val) => { setIconName(val); setIconUrl('')}} />

          <div className="flex items-center gap-4">
              <div className="flex-grow border-t border-muted"></div>
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-grow border-t border-muted"></div>
          </div>

          <ImageUpload 
            label="Upload Custom Icon"
            value={iconUrl}
            onChange={(url) => { setIconUrl(url); setIconName('')}}
          />

          <div className="flex-grow border-t border-muted"></div>

           <ImageUpload 
            label="Service Detail Page Image"
            value={imageUrl}
            onChange={setImageUrl}
          />
          <div className="grid gap-2">
            <Label htmlFor="landingPage">Link to Landing Page (optional)</Label>
            <Select value={landingPageId} onValueChange={setLandingPageId}>
                <SelectTrigger id="landingPage">
                    <SelectValue placeholder="Select a landing page" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unlinked">None</SelectItem>
                    {landingPages?.map((page: any) => (
                        <SelectItem key={page.id} value={page.id}>
                            {page.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onComplete}>Cancel</Button>
          <Button onClick={handleUpload}>
            {serviceToEdit ? 'Update Service' : 'Add Service'}
          </Button>
        </CardFooter>
      </Card>
      {isEditingDescription && (
        <DescriptionEditorModal value={description} onChange={setDescription} onOpenChange={setIsEditingDescription} />
      )}
    </>
  );
}

export default function ServiceManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [editingService, setEditingService] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{id: string; name: {en: string, fr: string}} | null>(null);

  const servicesCollection = useMemoFirebase(
    () => collection(firestore, 'services'),
    [firestore]
  );

  const { data: services, isLoading: isLoadingServices } = useCollection(servicesCollection);

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteDoc(doc(firestore, 'services', serviceToDelete.id));
      toast({ title: 'Service Deleted', description: `"${serviceToDelete.name[language]}" has been removed.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the service.' });
      console.error("Error deleting service:", error);
    } finally {
      setServiceToDelete(null);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsFormVisible(true);
  };
  
  const handleAddNew = () => {
    setEditingService(null);
    setIsFormVisible(true);
  }

  const handleFormComplete = () => {
    setEditingService(null);
    setIsFormVisible(false);
  };
  
  const truncateText = (html: string, length: number) => {
    const text = html.replace(/<[^>]*>?/gm, '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  return (
    <>
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
      {isFormVisible ? (
        <ServiceUploader serviceToEdit={editingService} onComplete={handleFormComplete} />
      ) : (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Services</CardTitle>
              <CardDescription>
                Add, edit, or delete the services your agency offers.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>Add New Service</Button>
          </CardHeader>
          <CardContent>
            {isLoadingServices && <p className="text-center">Loading services...</p>}
            {!isLoadingServices && services && services.length === 0 && <p className="text-center text-muted-foreground">No services added yet.</p>}
            
            {!isLoadingServices && services && services.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name?.[language] || service.name?.en}</TableCell>
                       <TableCell className="text-muted-foreground">/services/{service.slug}</TableCell>
                      <TableCell className="text-muted-foreground max-w-sm truncate">
                        {truncateText(service.description?.[language] || service.description?.en, 100)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setServiceToDelete({id: service.id, name: service.name})}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>

    <AlertDialog open={!!serviceToDelete} onOpenChange={(isOpen) => !isOpen && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-semibold"> {serviceToDelete?.name?.[language] || serviceToDelete?.name?.en} </span> 
              service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    