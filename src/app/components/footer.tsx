'use client';

import { Instagram, Linkedin, Facebook, Zap, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/language-context';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Footer() {
  const { t, language } = useLanguage();
  const firestore = useFirestore();
  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'footer_settings', 'main'), [firestore]);
  const { data: settings, isLoading } = useDoc(settingsDocRef);
  
  const navLinks = [
    { href: '#services', label: t('ourServices') },
    { href: '#funnel', label: t('highPerformanceFunnel') },
    { href: '#testimonials', label: t('testimonials') },
    { href: '#team', label: t('team') },
    { href: '#blog', label: t('blog') },
    { href: '#contact', label: t('contactUs') }
  ];

  const defaultDescription = {
    fr: "Amplifiez votre marque. Dominez le marché. Nous aidons les entreprises ambitieuses à créer des expériences numériques qui génèrent des résultats.",
    en: "Amplify your brand. Dominate the market. We help ambitious companies create digital experiences that drive results."
  };

  const defaultAddress = {
      fr: "Technopark Casablanca, P.S, Casablanca 20270, Maroc",
      en: "Technopark Casablanca, P.S, Casablanca 20270, Morocco"
  }

  const description = settings?.description?.[language] || defaultDescription[language];
  const address = settings?.address?.[language] || defaultAddress[language];

  const instagramUrl = settings?.instagramUrl || "https://www.instagram.com/boldnetdigital/";
  const facebookUrl = settings?.facebookUrl || "https://web.facebook.com/profile.php?id=61580707476970";
  const linkedinUrl = settings?.linkedinUrl || "#";
  const email = settings?.email || "contact@boldnet.ma";
  const phone = settings?.phone || "+212 6 93 37 99 21";

  return (
    <footer className="w-full bg-transparent text-white/80">
      <div className="container px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 text-center sm:text-left sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-white" />
              <span className="text-xl font-bold text-white">BoldNet Digital</span>
            </div>
            <p className="max-w-sm mt-4 text-sm">
                {description}
            </p>
             <div className="flex mt-6 -mx-2">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="mx-2 text-white/80 transition-colors duration-300 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="mx-2 text-white/80 transition-colors duration-300 hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="mx-2 text-white/80 transition-colors duration-300 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-bold text-white uppercase">Navigation</h3>
            <div className="flex flex-col items-center sm:items-start mt-4 space-y-4">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="transition-colors duration-300 hover:underline hover:text-white">{link.label}</Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-bold text-white uppercase">Contact</h3>
            <div className="flex flex-col items-center sm:items-start mt-4 space-y-4">
                <p className="flex items-center gap-2">
                    <Mail className="w-5 h-5"/>
                    <span>{email}</span>
                </p>
                <p className="flex items-center gap-2">
                    <Phone className="w-5 h-5"/>
                    <span>{phone}</span>
                </p>
                 <p className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0"/>
                    <span dangerouslySetInnerHTML={{ __html: address.replace(/\n/g, '<br />') }}></span>
                </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-bold text-white uppercase">Légal</h3>
            <div className="flex flex-col items-center sm:items-start mt-4 space-y-4">
              <a href="#" className="transition-colors duration-300 hover:underline hover:text-white">Mentions légales</a>
              <a href="#" className="transition-colors duration-300 hover:underline hover:text-white">Politique de confidentialité</a>
            </div>
          </div>
        </div>

        <hr className="my-6 border-white/20" />

        <div className="text-center">
          <p className="text-sm">
            {t('footerRights', new Date().getFullYear())}
          </p>
        </div>
      </div>
    </footer>
  );
}

    