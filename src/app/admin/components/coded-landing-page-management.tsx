'use client';
import { useState } from 'react';
import { collection, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Code, Trash2, Link as LinkIcon, Edit2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import PersonalBrandingManagement from './personal-branding-management';
import UgcOfferManagement from './ugc-offer-management';

export default function CodedLandingPageManagement() {
  const firestore = useFirestore();
  const codedPagesCollection = useMemoFirebase(() => collection(firestore, 'coded_landing_pages'), [firestore]);
  const { data: pages, isLoading } = useCollection(codedPagesCollection);
  const { toast } = useToast();
  const [deletingPage, setDeletingPage] = useState<any | null>(null);
  const [editingPage, setEditingPage] = useState<any | null>(null);

  const handleAddNew = async () => {
    try {
        const newPageData = {
            title: `New Coded Page ${Date.now()}`,
            slug: `coded-page-${Date.now()}`,
            createdAt: serverTimestamp(),
        };
        await addDocumentNonBlocking(codedPagesCollection, newPageData);
        toast({ title: 'Coded Page Created', description: 'You can now manage its content.' });
    } catch(e) {
        console.error(e);
        toast({variant: 'destructive', title: 'Error creating coded page'});
    }
  }
  
  const handleAddUgcOfferPage = async () => {
    const pageExists = pages?.some(p => p.slug === 'ugc-offer');
    if (pageExists) {
        toast({
            variant: 'destructive',
            title: 'Page already exists',
            description: 'The UGC Offer page has already been added.',
        });
        return;
    }
    
    try {
        const newPageData = {
            title: `UGC Offer Page`,
            slug: `ugc-offer`,
            createdAt: serverTimestamp(),
        };
        await addDocumentNonBlocking(codedPagesCollection, newPageData);
        toast({ title: 'UGC Offer Page Added', description: 'You can now see it in the list.' });
    } catch(e) {
        console.error(e);
        toast({variant: 'destructive', title: 'Error creating coded page'});
    }
  }

  const handleDelete = async () => {
    if (!deletingPage) return;
    try {
      await deleteDoc(doc(firestore, 'coded_landing_pages', deletingPage.id));
      toast({ title: 'Page codée supprimée' });
      setDeletingPage(null);
    } catch (error) {
       console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la page.' });
    }
  }

  const handleAddPersonalBrandingPage = async () => {
    const pageExists = pages?.some(p => p.slug === 'personal-branding');
    if (pageExists) {
        toast({
            variant: 'destructive',
            title: 'Page already exists',
            description: 'The Personal Branding page has already been added.',
        });
        return;
    }
    
    try {
        const newPageData = {
            title: `Personal Branding Page`,
            slug: `personal-branding`,
            createdAt: serverTimestamp(),
        };
        await addDocumentNonBlocking(codedPagesCollection, newPageData);
        toast({ title: 'Personal Branding Page Added', description: 'You can now manage its content.' });
    } catch(e) {
        console.error(e);
        toast({variant: 'destructive', title: 'Error creating coded page'});
    }
  }
  
  const copyLink = (slug: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/coded/${slug}`;
    navigator.clipboard.writeText(url);
    toast({title: "Link Copied!", description: url});
  }

  const handleEdit = (page: any) => {
    if (page.slug === 'personal-branding' || page.slug === 'ugc-offer') {
        setEditingPage(page);
    } else {
        toast({ title: 'Not Editable', description: 'Only the Personal Branding and UGC Offer pages are editable for now.' });
    }
  };
  
  if (editingPage?.slug === 'personal-branding') {
    return <PersonalBrandingManagement onBack={() => setEditingPage(null)} />
  }

  if (editingPage?.slug === 'ugc-offer') {
    return <UgcOfferManagement onBack={() => setEditingPage(null)} />
  }

  return (
    <>
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Coded Landing Pages</CardTitle>
            <CardDescription>Manage metadata for manually coded pages.</CardDescription>
          </div>
           <div className="flex gap-2 flex-wrap">
            <Button onClick={handleAddUgcOfferPage}><Plus className="mr-2 h-4 w-4" /> Add UGC Offer Page</Button>
            <Button onClick={handleAddPersonalBrandingPage}><Plus className="mr-2 h-4 w-4" /> Add Personal Branding Page</Button>
            <Button onClick={handleAddNew} disabled><Plus className="mr-2 h-4 w-4" /> Add New</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-8">Loading coded pages...</p>}
          {!isLoading && (!pages || pages.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Code className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Coded Pages Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add a new coded page to manage its metadata.</p>
                <div className="mt-6">
                    <Button onClick={handleAddNew}>
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Add Coded Page
                    </Button>
                </div>
            </div>
          )}
           {!isLoading && pages && pages.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.map((page: any) => (
                            <TableRow key={page.id}>
                                <TableCell className="font-medium">{page.title}</TableCell>
                                <TableCell className="text-muted-foreground">/coded/{page.slug}</TableCell>
                                <TableCell>{page.createdAt ? format(page.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" title="Copy Link" onClick={() => copyLink(page.slug)}>
                                        <LinkIcon className="h-4 w-4" />
                                        <span className="sr-only">Copy Link</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(page)} disabled={page.slug !== 'personal-branding' && page.slug !== 'ugc-offer'}>
                                        <Edit2 className="h-4 w-4" />
                                        <span className="sr-only">Modifier</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingPage(page)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Supprimer</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
    
    <AlertDialog open={!!deletingPage} onOpenChange={(isOpen) => !isOpen && setDeletingPage(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est irréversible. La page "{deletingPage?.title}" sera définitivement supprimée.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    