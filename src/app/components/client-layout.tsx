'use client';

import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/app/context/language-context';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/app/components/theme-provider';
import DynamicTheme from './dynamic-theme';
import WhatsAppButton from './whatsapp-button';
import DynamicFontLoader from './dynamic-font-loader';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isSanityStudio = pathname?.startsWith('/admin/studio');

  // Studio Sanity total isolation
  if (isSanityStudio) {
    return (
      <div className="sanity-studio-container fixed inset-0 z-[9999] bg-white overflow-auto">
        {children}
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseClientProvider>
        <LanguageProvider>
          {mounted && (
            <>
              <DynamicTheme />
              <DynamicFontLoader />
              <WhatsAppButton phoneNumber="+212719802571" />
            </>
          )}
          <div className="site-animated-bg">
            {children}
          </div>
        </LanguageProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
