'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { type LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  iconName: string;
}

export const DynamicIcon = ({ iconName, ...props }: DynamicIconProps) => {
  // We use a safe lookup to avoid importing everything if possible, 
  // but for dynamic usage from DB, we need the Icons object.
  // To optimize compilation, we ensure iconName is a valid key.
  const IconComponent = (Icons as any)[iconName];

  if (!IconComponent) {
    return <Icons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};