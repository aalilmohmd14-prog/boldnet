'use client';

import { useState } from 'react';
import { collection, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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
import { Edit, Trash2, GripVertical, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import Image from 'next/image';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function ClientForm({ clientToEdit, onComplete, clientsCount }: { clientToEdit?: any, onComplete: () => void, clientsCount: number }) {
  const [name, setName] = useState(clientToEdit?.name || '');
  const [logoUrl, setLogoUrl] = useState(clientToEdit?.logoUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(clientToEdit?.websiteUrl || '');
  const firestore = useFirestore();
  const { toast } = useToast();

  const clientsCollection = useMemoFirebase(
    () => collection(firestore, 'clients'),
    [firestore]
  );

  const handleAction = async () => {
    if (!name || !logoUrl) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a name and a logo URL.',
      });
      return;
    }

    const clientData = { name, logoUrl, websiteUrl };

    if (clientToEdit) {
      const docRef = doc(firestore, 'clients', clientToEdit.id);
      await updateDoc(docRef, clientData);
      toast({ title: 'Client Updated', description: `${name} has been successfully updated.` });
    } else {
      await addDocumentNonBlocking(clientsCollection, { ...clientData, order: clientsCount });
      toast({ title: 'Client Added', description: `${name} has been successfully added.` });
    }
    
    onComplete();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{clientToEdit ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>
          {clientToEdit ? 'Update the details for this client.' : "Add a new client to your showcase."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Client Name</Label>
          <Input
            id="name"
            placeholder="Acme Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <ImageUpload 
            label="Client Logo"
            value={logoUrl}
            onChange={setLogoUrl}
            cropShape="square"
        />
        <div className="grid gap-2">
          <Label htmlFor="websiteUrl">Website URL (optional)</Label>
          <Input
            id="websiteUrl"
            placeholder="https://acmeinc.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onComplete}>Cancel</Button>
        <Button onClick={handleAction}>
          {clientToEdit ? 'Update Client' : 'Add Client'}
        </Button>
      </CardFooter>
    </Card>
  );
}


function SortableClientItem({ client, onEdit, onDelete }: { client: any; onEdit: () => void; onDelete: () => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({id: client.id});
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <Card ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 touch-none">
            <button {...attributes} {...listeners} className="cursor-grab p-2 -ml-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <Image src={client.logoUrl} alt={client.name} width={40} height={40} className="rounded-md object-contain" />
            <div className="flex-1">
                <p className="font-semibold">{client.name}</p>
                {client.websiteUrl && (
                    <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
                        {client.websiteUrl}
                    </a>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
            </div>
        </Card>
    );
}

export default function ClientManagement() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [editingClient, setEditingClient] = useState<any | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<{id: string; name: string} | null>(null);

    const clientsCollection = useMemoFirebase(
        () => collection(firestore, 'clients'),
        [firestore]
    );

    const { data: clients, isLoading: isLoadingClients } = useCollection(clientsCollection);
    
    const sortedClients = clients?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        try {
          await deleteDoc(doc(firestore, 'clients', clientToDelete.id));
          toast({ title: 'Client Deleted', description: `"${clientToDelete.name}" has been removed.` });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the client.' });
          console.error("Error deleting client:", error);
        } finally {
          setClientToDelete(null);
        }
    };

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setIsFormVisible(true);
    };
    
    const handleAddNew = () => {
        setEditingClient(null);
        setIsFormVisible(true);
    }

    const handleFormComplete = () => {
        setEditingClient(null);
        setIsFormVisible(false);
    };

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over?.id && sortedClients) {
            const oldIndex = sortedClients.findIndex((c) => c.id === active.id);
            const newIndex = sortedClients.findIndex((c) => c.id === over!.id);
            const newSortedClients = arrayMove(sortedClients, oldIndex, newIndex);
            
            const batch = writeBatch(firestore);
            newSortedClients.forEach((client, index) => {
                const docRef = doc(firestore, "clients", client.id);
                batch.update(docRef, { order: index });
            });
            
            try {
                await batch.commit();
                toast({ title: "Order Updated" });
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: "Could not reorder clients." });
            }
        }
    }


    return (
        <>
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
                {isFormVisible ? (
                    <ClientForm clientToEdit={editingClient} onComplete={handleFormComplete} clientsCount={clients?.length || 0} />
                ) : (
                    <Card className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manage Clients</CardTitle>
                                <CardDescription>
                                    Add, edit, delete, and reorder the clients in your showcase.
                                </CardDescription>
                            </div>
                            <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4" /> Add New Client</Button>
                        </CardHeader>
                        <CardContent>
                             {isLoadingClients && <p className="text-center">Loading clients...</p>}
                             {!isLoadingClients && sortedClients && sortedClients.length === 0 && <p className="text-center text-muted-foreground py-8">No clients added yet.</p>}
                             {!isLoadingClients && sortedClients && sortedClients.length > 0 && (
                                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={sortedClients.map((c:any) => c.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {sortedClients.map((client) => (
                                                <SortableClientItem 
                                                    key={client.id} 
                                                    client={client} 
                                                    onEdit={() => handleEdit(client)} 
                                                    onDelete={() => setClientToDelete({id: client.id, name: client.name})}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                             )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={!!clientToDelete} onOpenChange={(isOpen) => !isOpen && setClientToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    <span className="font-semibold"> {clientToDelete?.name} </span> 
                    client.
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
