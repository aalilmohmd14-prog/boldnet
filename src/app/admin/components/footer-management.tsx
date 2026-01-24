'use client';
import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const defaultLang = { en: '', fr: '' };

export default function FooterManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'footer_settings', 'main'), [firestore]);
  const { data: footerSettings, isLoading } = useDoc(settingsDocRef);

  const [description, setDescription] = useState(defaultLang);
  const [address, setAddress] = useState(defaultLang);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    if (footerSettings) {
      setDescription(footerSettings.description || defaultLang);
      setAddress(footerSettings.address || defaultLang);
      setInstagramUrl(footerSettings.instagramUrl || '');
      setFacebookUrl(footerSettings.facebookUrl || '');
      setLinkedinUrl(footerSettings.linkedinUrl || '');
      setEmail(footerSettings.email || '');
      setPhone(footerSettings.phone || '');
    }
  }, [footerSettings]);

  const handleSave = async () => {
    try {
        const settingsToSave = {
            description,
            address,
            instagramUrl,
            facebookUrl,
            linkedinUrl,
            email,
            phone,
        };
      await setDoc(settingsDocRef, settingsToSave, { merge: true });
      toast({ title: 'Footer Saved', description: 'Your footer content has been updated.' });
    } catch (error) {
      console.error('Error saving footer content:', error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Footer',
        description: 'Could not save your footer content.',
      });
    }
  };

  const handleReset = () => {
    setDescription({ fr: "Amplifiez votre marque. Dominez le marché. Nous aidons les entreprises ambitieuses à créer des expériences numériques qui génèrent des résultats.", en: "Amplify your brand. Dominate the market. We help ambitious companies create digital experiences that drive results." });
    setAddress({ fr: "Technopark Casablanca,\nP.S, Casablanca 20270,\nMaroc", en: "Technopark Casablanca,\nP.S, Casablanca 20270,\nMorocco" });
    setInstagramUrl("https://www.instagram.com/boldnetdigital/");
    setFacebookUrl("https://web.facebook.com/profile.php?id=61580707476970");
    setLinkedinUrl("#");
    setEmail("contact@boldnet.ma");
    setPhone("+212 6 93 37 99 21");
    toast({title: "Reset", description: "Values have been reset. Click save to apply."})
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Footer Content</CardTitle>
          <CardDescription>
            Customize the information displayed in your website's footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid gap-2">
                <Label>Short Description</Label>
                <Tabs defaultValue="fr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="fr">Français</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fr">
                        <Textarea
                        placeholder="Description (Français)"
                        value={description.fr}
                        onChange={(e) => setDescription(prev => ({ ...prev, fr: e.target.value }))}
                        />
                    </TabsContent>
                    <TabsContent value="en">
                        <Textarea
                        placeholder="Description (English)"
                        value={description.en}
                        onChange={(e) => setDescription(prev => ({ ...prev, en: e.target.value }))}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                    id="instagramUrl"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                    id="facebookUrl"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/..."
                    />
                </div>
            </div>
          
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    />
                </div>
            </div>
            
             <div className="grid gap-2">
                <Label>Address</Label>
                <Tabs defaultValue="fr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="fr">Français</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fr">
                        <Textarea
                        placeholder="Adresse (Français)"
                        value={address.fr}
                        onChange={(e) => setAddress(prev => ({ ...prev, fr: e.target.value }))}
                        rows={3}
                        />
                    </TabsContent>
                    <TabsContent value="en">
                        <Textarea
                        placeholder="Address (English)"
                        value={address.en}
                        onChange={(e) => setAddress(prev => ({ ...prev, en: e.target.value }))}
                        rows={3}
                        />
                    </TabsContent>
                </Tabs>
            </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
            <Button onClick={handleSave}>Save Footer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    