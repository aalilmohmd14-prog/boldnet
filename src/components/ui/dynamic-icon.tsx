'use client';

import React from 'react';
import { 
  PenTool, Code, BarChart3, Megaphone, Paintbrush, Camera, Video,
  Server, Cloud, Database, ShieldCheck, Settings, Rocket, Target,
  Lightbulb, Users, Briefcase, MessageSquare, Zap, Globe, Award,
  Film, Scissors, Send, Globe2, ThumbsUp, Heart, HelpCircle,
  Compass, MousePointerClick, RefreshCw, CircleDollarSign, TrendingUp, UserPlus,
  PenSquare, Lamp, Link as LinkIcon
} from 'lucide-react';

const iconMap: Record<string, React.FC<any>> = {
  PenTool, Code, BarChart3, Megaphone, Paintbrush, Camera, Video,
  Server, Cloud, Database, ShieldCheck, Settings, Rocket, Target,
  Lightbulb, Users, Briefcase, MessageSquare, Zap, Globe, Award,
  Film, Scissors, Send, Globe2, ThumbsUp, Heart,
  Compass, MousePointerClick, RefreshCw, CircleDollarSign, TrendingUp, UserPlus,
  PenSquare, Lamp, LinkIcon
};

interface DynamicIconProps extends React.ComponentProps<typeof HelpCircle> {
  iconName: string;
}

export const DynamicIcon = ({ iconName, ...props }: DynamicIconProps) => {
  const IconComponent = iconMap[iconName] || HelpCircle;
  return <IconComponent {...props} />;
};
