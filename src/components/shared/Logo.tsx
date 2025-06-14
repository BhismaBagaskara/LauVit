import { Weight } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Weight className={`text-primary ${iconSizeClasses[size]}`} />
      <h1 className={`font-headline font-bold text-foreground ${sizeClasses[size]}`}>
        {APP_NAME}
      </h1>
    </div>
  );
}
