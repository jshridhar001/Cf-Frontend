import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function PageCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn('gap-4 py-4 sm:gap-6 sm:py-6', className)} {...props} />;
}

function PageCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('px-4 sm:px-6', className)} {...props} />;
}

function PageCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('px-4 sm:px-6', className)} {...props} />;
}

function PageCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return <CardFooter className={cn('px-4 sm:px-6', className)} {...props} />;
}

export { PageCard, PageCardContent, PageCardFooter, PageCardHeader };
