'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../../sanity.config';
import { useEffect, useState } from 'react';

export default function StudioPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full bg-white">
      <NextStudio config={config} />
    </div>
  );
}
