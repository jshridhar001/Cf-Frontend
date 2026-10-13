import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Farmer } from '@/features/farmers/overview/types';
import { useCreateStockTransfer } from '@/features/transfer-stock/create/api/use-create-stock-transfer';
import { useFarmerStock } from '@/features/transfer-stock/create/api/use-farmer-stock';
import { SourceStockStep } from '@/features/transfer-stock/create/components/source-stock-step';
import { TransferDetailsStep } from '@/features/transfer-stock/create/components/transfer-details-step';
import { TransferFormStepper } from '@/features/transfer-stock/create/components/transfer-form-stepper';
import {
  type BagDrafts,
  type SelectedTransferLine,
  selectedTransferLines,
} from '@/features/transfer-stock/create/lib/stock-lines';
import {
  type CreateTransferInput,
  createTransferSchema,
  emptyTransferDetailsValues,
  type TransferDetailsInput,
} from '@/features/transfer-stock/create/lib/transfer.schema';
import { getApiErrorMessage } from '@/lib/api-client';

type TransferCreateFormProps = {
  farmers: Farmer[];
};

export function TransferCreateForm({ farmers }: TransferCreateFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createTransfer, isPending } = useCreateStockTransfer();
  const [step, setStep] = useState<1 | 2>(1);
  const [fromFarmerId, setFromFarmerId] = useState('');
  const [toFarmerId, setToFarmerId] = useState('');
  const [drafts, setDrafts] = useState<BagDrafts>({});
  const [confirmedLines, setConfirmedLines] = useState<SelectedTransferLine[]>([]);
  const [step2Draft, setStep2Draft] = useState<TransferDetailsInput>(emptyTransferDetailsValues);

  const stockQuery = useFarmerStock(fromFarmerId);
  const stock = stockQuery.data;
  const isStockLoading = Boolean(fromFarmerId) && stock === undefined && !stockQuery.isError;
  const stockErrorMessage = stockQuery.isError
    ? getApiErrorMessage(stockQuery.error, 'Failed to load farmer stock.')
    : null;

  const fromFarmer = useMemo(
    () => farmers.find((farmer) => farmer.id === fromFarmerId),
    [farmers, fromFarmerId],
  );
  const toFarmer = useMemo(
    () => farmers.find((farmer) => farmer.id === toFarmerId),
    [farmers, toFarmerId],
  );

  function handleFromFarmerChange(farmerId: string) {
    setFromFarmerId(farmerId);
    setDrafts({});
    setConfirmedLines([]);
    if (farmerId === toFarmerId) setToFarmerId('');
  }

  function handleNext() {
    const lines = selectedTransferLines(stock ?? [], drafts);
    if (lines.length === 0 || !fromFarmer || !toFarmer) return;
    setConfirmedLines(lines);
    setStep(2);
  }

  async function handleSubmit(values: CreateTransferInput) {
    const parsed = createTransferSchema.safeParse(values);
    if (!parsed.success) {
      toast.error('Failed to create transfer', {
        description: parsed.error.issues[0]?.message ?? 'Invalid transfer details.',
        position: 'bottom-right',
      });
      return;
    }

    try {
      const transfer = await createTransfer(parsed.data);
      void navigate({ to: '/transfer-stock/$id', params: { id: transfer.id } });
    } catch {
      // The mutation shows the error toast.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TransferFormStepper
        currentStep={step}
        onStepChange={(next) => {
          if (next < step) setStep(next);
        }}
      />

      {step === 1 ? (
        <SourceStockStep
          farmers={farmers}
          fromFarmerId={fromFarmerId}
          toFarmerId={toFarmerId}
          drafts={drafts}
          stock={stock}
          isStockLoading={isStockLoading}
          stockErrorMessage={stockErrorMessage}
          onFromFarmerChange={handleFromFarmerChange}
          onToFarmerChange={setToFarmerId}
          onDraftsChange={setDrafts}
          onNext={handleNext}
        />
      ) : fromFarmer && toFarmer ? (
        <TransferDetailsStep
          fromFarmer={fromFarmer}
          toFarmer={toFarmer}
          fromFarmerId={fromFarmerId}
          toFarmerId={toFarmerId}
          lines={confirmedLines}
          defaultValues={step2Draft}
          isPending={isPending}
          onDraftChange={setStep2Draft}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
