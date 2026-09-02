import type { ComponentProps } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

function PageTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn('w-full justify-start overflow-x-auto md:overflow-visible', className)}
      {...props}
    />
  );
}

function PageTabsTrigger({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger className={cn('shrink-0 md:flex-1', className)} {...props} />;
}

export { PageTabsList, PageTabsTrigger };
