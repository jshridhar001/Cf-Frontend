import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { SeedRequisitionDetail } from '@/features/seed-requisition/report/types';

import { ApproveSeedRequisitionDialog } from './approve-seed-requisition-dialog';
import { RejectSeedRequisitionDialog } from './reject-seed-requisition-dialog';

type SeedRequisitionDetailActionsProps = {
  requisition: SeedRequisitionDetail;
};

export function SeedRequisitionDetailActions({ requisition }: SeedRequisitionDetailActionsProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  if (requisition.status !== 'pending') {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setIsApproveOpen(true)}>
          <CheckCircle2 className="size-4" />
          Approve
        </Button>
        <Button type="button" variant="destructive" onClick={() => setIsRejectOpen(true)}>
          <XCircle className="size-4" />
          Reject
        </Button>
      </div>

      <ApproveSeedRequisitionDialog
        requisition={isApproveOpen ? requisition : null}
        onOpenChange={setIsApproveOpen}
      />

      <RejectSeedRequisitionDialog
        requisition={isRejectOpen ? requisition : null}
        onOpenChange={setIsRejectOpen}
      />
    </>
  );
}
