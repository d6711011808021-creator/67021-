import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20, style }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name] || Icons.CircleDot;
  return <IconComponent className={className} size={size} style={style} />;
};
