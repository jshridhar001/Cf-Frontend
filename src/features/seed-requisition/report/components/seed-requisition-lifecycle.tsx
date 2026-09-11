import { Check, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeedRequisitionDetail } from '@/features/seed-requisition/report/types';
import { formatDateTime } from '@/lib/format-date';
import { cn } from '@/lib/utils';

type StepState = 'complete' | 'pending' | 'rejected';

type LifecycleStep = {
  title: string;
  description: string;
  state: StepState;
};

function buildSteps(requisition: SeedRequisitionDetail): LifecycleStep[] {
  const createdBy = requisition.createdByName ?? 'Unknown';
  const submittedDescription = `Created by ${createdBy} on ${formatDateTime(requisition.createdAt)}`;

  let review: LifecycleStep;

  if (requisition.status === 'approved') {
    const approvedBy = requisition.approvedByName ?? 'Unknown';
    const onDate = requisition.approvedAt ? ` on ${formatDateTime(requisition.approvedAt)}` : '';
    review = {
      title: 'Review',
      description: `Approved by ${approvedBy}${onDate}`,
      state: 'complete',
    };
  } else if (requisition.status === 'rejected') {
    const rejectedBy = requisition.rejectedByName ?? 'Unknown';
    const onDate = requisition.rejectedAt ? ` on ${formatDateTime(requisition.rejectedAt)}` : '';
    review = {
      title: 'Review',
      description: `Rejected by ${rejectedBy}${onDate}`,
      state: 'rejected',
    };
  } else {
    review = {
      title: 'Review',
      description: 'Awaiting review',
      state: 'pending',
    };
  }

  return [
    {
      title: 'Submitted',
      description: submittedDescription,
      state: 'complete',
    },
    review,
  ];
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'complete') {
    return (
      <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }

  if (state === 'rejected') {
    return (
      <span className="bg-destructive text-destructive-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
        <X className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="border-border bg-background flex size-7 shrink-0 items-center justify-center rounded-full border-2">
      <span className="bg-muted-foreground/40 size-2 rounded-full" />
    </span>
  );
}

type SeedRequisitionLifecycleProps = {
  requisition: SeedRequisitionDetail;
};

export function SeedRequisitionLifecycle({ requisition }: SeedRequisitionLifecycleProps) {
  const steps = buildSteps(requisition);

  return (
    <Card className="border-border/50 h-fit shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Lifecycle</CardTitle>
        <CardDescription>Requisition approval workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const connectorComplete =
              step.state === 'complete' && steps[index + 1]?.state !== 'pending';

            return (
              <li key={step.title} className="relative flex gap-3 pb-8 last:pb-0">
                {!isLast ? (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-7 left-3.5 w-px -translate-x-1/2',
                      'h-[calc(100%-1.75rem)]',
                      connectorComplete ? 'bg-primary' : 'bg-border',
                    )}
                  />
                ) : null}

                <StepIcon state={step.state} />

                <div className="min-w-0 space-y-0.5 pt-0.5">
                  <p className="text-foreground text-sm font-semibold">{step.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
