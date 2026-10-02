import { ChevronDown } from 'lucide-react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { DataHealthFinding } from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';

function Finding({ finding }: { finding: DataHealthFinding }) {
  return (
    <Collapsible className="rounded-lg border border-border">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{finding.title}</span>
          <span className="block text-xs text-muted-foreground">{finding.detail}</span>
        </span>
        <Badge variant={finding.severity === 'warn' ? 'destructive' : 'secondary'}>
          {finding.count}
        </Badge>
        {finding.rows.length > 0 ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        ) : null}
      </CollapsibleTrigger>
      {finding.rows.length > 0 ? (
        <CollapsibleContent className="px-3 pb-3">
          <ul className="flex flex-col gap-2">
            {finding.rows.map((row) => (
              <li key={row.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span>{row.primary}</span>
                <span className="text-muted-foreground">{row.secondary}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
}

export function NeedsAttention({ findings }: { findings: DataHealthFinding[] }) {
  if (findings.length === 0) return null;

  return (
    <Collapsible>
      <PageCard>
        <PageCardHeader>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left">
            <CardTitle>Needs attention</CardTitle>
            <Badge variant="secondary">{findings.length}</Badge>
            <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </PageCardHeader>
        <CollapsibleContent>
          <PageCardContent className="flex flex-col gap-2">
            {findings.map((finding) => (
              <Finding key={finding.id} finding={finding} />
            ))}
          </PageCardContent>
        </CollapsibleContent>
      </PageCard>
    </Collapsible>
  );
}
