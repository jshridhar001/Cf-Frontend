import { Link } from '@tanstack/react-router';
import { MapPin, Phone, SquarePenIcon, Trash2Icon, User } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  type Farmer,
  formatFarmerStatus,
  getFarmerLocalityName,
  getFarmerStationName,
} from '@/features/farmers/types';
import type { Station } from '@/features/master/types';
import { cn } from '@/lib/utils';

function FarmerRow({
  icon: Icon,
  value,
  muted = false,
}: {
  icon: typeof Phone;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <p
        className={cn(
          'truncate text-sm',
          muted ? 'text-muted-foreground' : 'font-medium text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CardIconButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        'relative size-8 text-muted-foreground after:absolute after:-inset-1.5 after:content-[""] hover:text-foreground sm:after:hidden',
        className,
      )}
      {...props}
    />
  );
}

export function FarmerCard({
  farmer,
  stations,
  onEdit,
  onDelete,
}: {
  farmer: Farmer;
  stations?: Station[];
  onEdit: (farmer: Farmer) => void;
  onDelete: (farmer: Farmer) => void;
}) {
  const locality = getFarmerLocalityName(farmer, stations);
  const station = getFarmerStationName(farmer, stations);
  const placeLabel = [locality, station].filter(Boolean).join(' · ');
  const isActive = farmer.status === 'ACTIVE';

  return (
    <Card size="sm">
      <Link
        to="/farmers/$id"
        params={{ id: farmer.id }}
        className="flex flex-col gap-3 rounded-t-4xl outline-none hover:bg-muted/20 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CardHeader>
          <CardTitle className="pr-3">
            {farmer.name}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (#{farmer.accountNumber})
            </span>
          </CardTitle>
          <CardAction>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="size-4 text-primary" aria-hidden />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <FarmerRow icon={Phone} value={farmer.mobileNumber} />
          <FarmerRow icon={MapPin} value={placeLabel} muted />
        </CardContent>
      </Link>

      <Separator className="mx-4" />

      <CardFooter className="justify-between gap-3">
        <Badge
          variant="outline"
          className={
            isActive
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-border bg-muted text-muted-foreground'
          }
        >
          {formatFarmerStatus(farmer.status)}
        </Badge>
        <div className="flex items-center gap-0.5">
          <CardIconButton aria-label={`Edit ${farmer.name}`} onClick={() => onEdit(farmer)}>
            <SquarePenIcon />
          </CardIconButton>
          <CardIconButton
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${farmer.name}`}
            onClick={() => onDelete(farmer)}
          >
            <Trash2Icon />
          </CardIconButton>
        </div>
      </CardFooter>
    </Card>
  );
}
