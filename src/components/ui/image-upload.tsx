'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, X, Eye, Settings2, ZoomIn, Move } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageCropper } from './image-cropper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from './slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface StyledImage {
  url: string;
  zoom?: number;
  x?: number;
  y?: number;
}

interface ImageUploadProps {
  value: string | StyledImage;
  onChange: (value: any) => void;
  label?: string;
  className?: string;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  enableStyling?: boolean;
}

const CLOUDINARY_CLOUD_NAME = 'ddbj70ziv';
const CLOUDINARY_UPLOAD_PRESET = 'boldnet_unsigned';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export function ImageUpload({ value, onChange, label, className, aspectRatio, cropShape, enableStyling = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isStylingOpen, setIsStylingOpen] = useState(false);
  const { toast } = useToast();

  const url = typeof value === 'string' ? value : value?.url || '';
  const zoom = typeof value === 'string' ? 1 : value?.zoom ?? 1;
  const x = typeof value === 'string' ? 0 : value?.x ?? 0;
  const y = typeof value === 'string' ? 0 : value?.y ?? 0;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
        toast({
            variant: 'destructive',
            title: 'Fichier trop volumineux',
            description: 'La taille de l\'image ne peut pas dépasser 50 Mo.',
        });
        return;
    }

    setImageType(file.type === 'image/png' ? 'image/png' : 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async (blob: Blob) => {
     setIsUploading(true);
     setImageToCrop(null);

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        
        if (enableStyling) {
            onChange({ url: data.secure_url, zoom, x, y });
        } else {
            onChange(data.secure_url);
        }
        toast({ title: 'Image téléversée', description: 'Votre image a été enregistrée avec succès.' });

    } catch (error) {
         console.error('Error uploading to Cloudinary:', error);
         toast({
            variant: 'destructive',
            title: 'Échec du téléversement',
            description: 'Une erreur est survenue lors de l\'envoi de l\'image.',
         });
    } finally {
        setIsUploading(false);
    }
  }

  const updateStyling = (updates: Partial<StyledImage>) => {
    if (enableStyling) {
        onChange({ url, zoom, x, y, ...updates });
    }
  };

  const clearImage = () => {
    onChange(enableStyling ? { url: '', zoom: 1, x: 0, y: 0 } : '');
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="w-full">
        {url ? (
          <div className="space-y-4">
            <div className="relative group w-full h-40 rounded-md overflow-hidden border border-input bg-muted/20">
                <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                    <div 
                        className="relative w-full h-full transition-transform duration-200"
                        style={{ transform: `scale(${zoom}) translate(${x}px, ${y}px)` }}
                    >
                        <Image src={url} alt="Uploaded" layout="fill" objectFit="contain" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button type="button" variant="secondary" size="icon" onClick={() => setIsPreviewOpen(true)} title="Aperçu"><Eye className="h-4 w-4" /></Button>
                <Button type="button" variant="destructive" size="icon" onClick={clearImage} title="Supprimer"><X className="h-4 w-4" /></Button>
                </div>
            </div>

            {enableStyling && (
                <Collapsible open={isStylingOpen} onOpenChange={setIsStylingOpen} className="border rounded-md p-3 bg-muted/10">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                            <div className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> <span>Ajuster l'affichage (Zoom & Position)</span></div>
                            <Settings2 className={cn("h-4 w-4 transition-transform", isStylingOpen && "rotate-90")} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><Label className="text-xs flex items-center gap-2"><ZoomIn className="h-3 w-3" /> Zoom ({zoom.toFixed(2)}x)</Label></div>
                            <Slider value={[zoom]} min={0.5} max={3} step={0.05} onValueChange={(v) => updateStyling({ zoom: v[0] })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs flex items-center gap-2"><Move className="h-3 w-3" /> Décalage X (px)</Label>
                                <Input type="number" size="sm" value={x} onChange={(e) => updateStyling({ x: Number(e.target.value) })} className="h-8" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs flex items-center gap-2"><Move className="h-3 w-3 rotate-90" /> Décalage Y (px)</Label>
                                <Input type="number" size="sm" value={y} onChange={(e) => updateStyling({ y: Number(e.target.value) })} className="h-8" />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-[10px] h-7" onClick={() => updateStyling({ zoom: 1, x: 0, y: 0 })}>Réinitialiser les réglages</Button>
                    </CollapsibleContent>
                </Collapsible>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent hover:border-primary transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 mb-3 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Téléversement...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Cliquez pour téléverser</span></p>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, GIF, SVG jusqu'à 50 Mo</p>
                </>
              )}
            </div>
            <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif, image/svg+xml" disabled={isUploading} />
          </label>
        )}
      </div>

       {imageToCrop && (
        <ImageCropper image={imageToCrop} onCropComplete={handleUpload} onCancel={() => setImageToCrop(null)} aspect={aspectRatio} cropShape={cropShape} imageType={imageType} />
      )}

      {isPreviewOpen && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl h-auto">
             <DialogHeader><DialogTitle>Aperçu de l'image</DialogTitle></DialogHeader>
            <div className="relative w-full aspect-video mt-4 bg-muted/20 rounded-md overflow-hidden flex items-center justify-center">
              <div 
                className="relative w-full h-full"
                style={{ transform: `scale(${zoom}) translate(${x}px, ${y}px)` }}
              >
                <Image src={url} alt="Aperçu" layout="fill" objectFit="contain" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}