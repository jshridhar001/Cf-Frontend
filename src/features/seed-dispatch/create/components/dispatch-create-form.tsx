import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateSeedDispatch } from '@/features/seed-dispatch/create/api/use-create-seed-dispatch';
import {
  type CreateDispatchInput,
  createDispatchSchema,
  type DispatchCreateStep2Input,
  emptyDispatchCreateStep2Values,
} from '@/features/seed-dispatch/create/lib/dispatch.schema';
import type { DispatchRequisitionSelectionMap } from '@/features/seed-dispatch/create/lib/dispatch-form-types';
import type { DispatchFormOptions } from '@/features/seed-dispatch/create/lib/form-options';
import type { DispatchableRequisition } from '@/features/seed-dispatch/create/types';

import { DispatchDetailsStep } from './dispatch-details-step';
import { DispatchFormStepper } from './dispatch-form-stepper';
import { DispatchRequisitionSelectionStep } from './dispatch-requisition-selection-step';

type DispatchCreateFormProps = {
  requisitions: DispatchableRequisition[];
  formOptions: DispatchFormOptions;
};

export function DispatchCreateForm({ requisitions, formOptions }: DispatchCreateFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createDispatch, isPending } = useCreateSeedDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [selections, setSelections] = useState<DispatchRequisitionSelectionMap>(new Map());
  const [step2Draft, setStep2Draft] = useState<DispatchCreateStep2Input>(
    emptyDispatchCreateStep2Values,
  );

  async function handleSubmit(values: CreateDispatchInput) {
    const parsed = createDispatchSchema.safeParse(values);
    if (!parsed.success) {
      toast.error('Failed to create dispatch', {
        description: parsed.error.issues[0]?.message ?? 'Invalid dispatch details.',
      });
      return;
    }

    try {
      await createDispatch(parsed.data);
      void navigate({ to: '/seed-dispatches/overview' });
    } catch {
      // Error toast is handled by the mutation.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DispatchFormStepper
        currentStep={step}
        onStepChange={(next) => {
          if (next < step) setStep(next);
        }}
      />

      {step === 1 ? (
        <DispatchRequisitionSelectionStep
          requisitions={requisitions}
          formOptions={formOptions}
          selections={selections}
          onSelectionsChange={setSelections}
          onNext={() => setStep(2)}
        />
      ) : (
        <DispatchDetailsStep
          selections={selections}
          requisitions={requisitions}
          formOptions={formOptions}
          defaultValues={step2Draft}
          isPending={isPending}
          onDraftChange={setStep2Draft}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
