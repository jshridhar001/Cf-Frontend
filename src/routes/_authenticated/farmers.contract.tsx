import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/farmers/contract')({
  component: FarmersContractPage,
});

function FarmersContractPage() {
  return <div>Farmers — Contract</div>;
}
