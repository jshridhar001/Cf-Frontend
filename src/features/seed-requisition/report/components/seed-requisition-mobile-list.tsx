import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  type LucideIcon,
  Package,
  Pencil,
  Sprout,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ColumnHeadings } from '@/features/seed-requisition/report/lib/column-headings';
import type {
  SeedRequisitionRow,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/report/types';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

import { RemarksPill } from './remarks-pill';

const STATUS_LABEL: Record<SeedRequisitionStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

type InfoBlockProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  valueClassName?: string;
};

function InfoBlock({ label, value, icon: Icon, valueClassName }: InfoBlockProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </span>
      <p className={cn('text-foreground text-sm font-semibold', valueClassName)}>{value}</p>
    </div>
  );
}

type SeedRequisitionMobileCardProps = {
  data: SeedRequisitionRow;
  headings: ColumnHeadings;
  onView: (requisition: SeedRequisitionRow) => void;
};

function SeedRequisitionMobileCard({ data, headings, onView }: SeedRequisitionMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shortId = data.id.slice(0, 8).toUpperCase();

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="border-border/40 bg-muted/10 flex flex-col gap-4 border-b pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="bg-primary h-2 w-2 rounded-full" />
              SR <span className="text-primary">#{shortId}</span>
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'border-transparent text-[11px] font-medium',
                data.status === 'approved' &&
                  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                data.status === 'pending' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                data.status === 'rejected' && 'bg-destructive/10 text-destructive',
              )}
            >
              {STATUS_LABEL[data.status]}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {headings.requisitionDate}: {formatDate(data.requisitionDate)}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="bg-background max-w-40 truncate text-[11px]"
            title={data.variety}
          >
            {data.variety}
          </Badge>
          {data.acres > 0 ? (
            <Badge variant="outline" className="bg-background text-[11px] tabular-nums">
              {data.acres} Acres
            </Badge>
          ) : null}
          {data.seedBags > 0 ? (
            <Badge variant="outline" className="bg-background text-[11px] tabular-nums">
              {data.seedBags.toLocaleString('en-IN')} Bags
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6">
          <InfoBlock label={headings.farmer} value={data.farmer} icon={User} />
          <InfoBlock label={headings.variety} value={data.variety} icon={Package} />
          {data.acres > 0 ? (
            <InfoBlock label={headings.acres} value={`${data.acres} acres`} icon={Sprout} />
          ) : null}
          {data.seedBags > 0 ? (
            <InfoBlock
              label={headings.seedBags}
              value={`${data.seedBags.toLocaleString('en-IN')} bags`}
              icon={Package}
            />
          ) : null}
        </div>

        {isExpanded ? (
          <div className="animate-in fade-in slide-in-from-top-4 mt-6 duration-300">
            <Separator className="mb-6" />
            <div className="space-y-6">
              <div>
                <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="text-primary h-4 w-4" />
                  Delivery Details
                </h4>
                <div className="border-border/50 bg-muted/20 grid grid-cols-2 gap-4 rounded-xl border p-4">
                  <InfoBlock
                    label={headings.requestedDeliveryDate}
                    value={formatDate(data.requestedDeliveryDate)}
                  />
                  <InfoBlock
                    label={headings.approvedDelivery}
                    value={formatDate(data.approvedDelivery)}
                  />
                  <InfoBlock
                    label={headings.rejectionDate}
                    value={formatDate(data.rejectionDate)}
                  />
                  <InfoBlock label={headings.status} value={STATUS_LABEL[data.status]} />
                </div>
              </div>

              <div>
                <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="text-primary h-4 w-4" />
                  {headings.remarks}
                </h4>
                <div className="border-border/50 bg-muted/20 rounded-xl border p-4">
                  {(() => {
                    const text =
                      data.status === 'rejected' && data.rejectionRemarks
                        ? data.rejectionRemarks
                        : data.remarks;
                    return text ? (
                      <RemarksPill remarks={text} label={headings.remarks} />
                    ) : (
                      <p className="text-muted-foreground text-sm italic">No remarks provided.</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="border-border/40 bg-muted/10 flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((open) => !open)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              View Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Expand
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-background h-8"
            onClick={() => onView(data)}
          >
            <FileText className="mr-2 h-3.5 w-3.5" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-background h-8"
            onClick={() =>
              toast.message('Edit requisition', {
                description: `Editing ${data.farmer} (${data.id})`,
              })
            }
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

type SeedRequisitionMobileListProps = {
  data: SeedRequisitionRow[];
  headings: ColumnHeadings;
  onView: (requisition: SeedRequisitionRow) => void;
};

export function SeedRequisitionMobileList({
  data,
  headings,
  onView,
}: SeedRequisitionMobileListProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
        No results.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((row) => (
        <li key={row.id}>
          <SeedRequisitionMobileCard data={row} headings={headings} onView={onView} />
        </li>
      ))}
    </ul>
  );
}
