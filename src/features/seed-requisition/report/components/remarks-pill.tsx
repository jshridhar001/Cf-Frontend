import { cn } from '@/lib/utils';

type RemarksPillProps = {
  remarks: string;
  label?: string;
  className?: string;
};

export function RemarksPill({ remarks, label = 'Remarks', className }: RemarksPillProps) {
  const text = remarks.trim();
  if (!text) return null;

  return (
    <span
      title={`${label}: ${text}`}
      className={cn(
        'bg-muted/60 text-foreground inline-block max-w-full truncate rounded-md px-2 py-1 text-xs leading-relaxed',
        className,
      )}
    >
      {text}
    </span>
  );
}
