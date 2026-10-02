import { useMemo, useState } from 'react';
import type { Farmer, FarmerSeedRequisition } from '@/features/farmers/overview/types';
import { RequisitionSampleProvider } from '@/features/seed-requisition/overview/components/requisition-sample-store';
import { SeedRequisitionList } from '@/features/seed-requisition/overview/components/SeedRequisitionOverviewPage';
import type { SeedRequisitionSearch } from '@/features/seed-requisition/overview/lib/search';
import type {
  SeedRequisition,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

function toProfileSeedRequisition(farmer: Farmer, row: FarmerSeedRequisition): SeedRequisition {
  return {
    id: row.id,
    farmerId: row.farmerId,
    varietyId: row.varietyId,
    status: row.status,
    requestedBags: row.requestedBags,
    requestedAcres: row.requestedAcres,
    fulfilledBags: row.fulfilledBags,
    fulfilledAcres: row.fulfilledAcres,
    requisitionDate: row.requisitionDate,
    contractDate: row.contractDate,
    engContractUrl: row.engContractUrl,
    hindiContractUrl: row.hindiContractUrl,
    requestedDeliveryDate: row.requestedDeliveryDate,
    approvedDeliveryDate: row.approvedDeliveryDate,
    remarks: row.remarks,
    rejectionRemarks: row.rejectionRemarks,
    createdById: row.createdById,
    approvedById: row.approvedById,
    rejectedById: row.rejectedById,
    approvedAt: row.approvedAt,
    rejectedAt: row.rejectedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    farmer: {
      id: farmer.id,
      name: farmer.name,
      accountNumber: farmer.accountNumber,
      mobileNumber: farmer.mobileNumber,
      aadharNumber: farmer.aadharNumber,
      panNumber: farmer.panNumber,
      bankName: farmer.bankName,
      bankAccountNumber: farmer.bankAccountNumber,
      ifscCode: farmer.ifscCode,
      accountType: farmer.accountType,
      status: farmer.status,
      stationId: farmer.stationId,
      villageId: farmer.villageId,
      postOfficeId: farmer.postOfficeId,
      policeStationId: farmer.policeStationId,
      districtId: farmer.districtId,
      stateId: farmer.stateId,
      pincodeId: farmer.pincodeId,
      familyId: farmer.familyId,
      createdAt: farmer.createdAt,
      updatedAt: farmer.updatedAt,
      state: farmer.state,
      district: farmer.district,
      station: farmer.station,
      policeStation: farmer.policeStation,
      pincode: farmer.pincode,
      postOffice: farmer.postOffice,
      village: farmer.village,
    },
    variety: row.variety ? { id: row.variety.id, name: row.variety.name } : null,
  };
}

export function FarmerSeedRequisitionTab({ farmer }: { farmer: Farmer }) {
  const [status, setStatus] = useState<SeedRequisitionStatus | undefined>();
  const search: SeedRequisitionSearch = { farmerId: farmer.id, status };
  const requisitions = useMemo(
    () => farmer.seedRequisitions.map((row) => toProfileSeedRequisition(farmer, row)),
    [farmer],
  );

  return (
    <RequisitionSampleProvider>
      <SeedRequisitionList
        search={search}
        lockedFarmerId={farmer.id}
        requisitions={requisitions}
        onSearchChange={(updater) => {
          setStatus(updater(search).status);
        }}
      />
    </RequisitionSampleProvider>
  );
}
