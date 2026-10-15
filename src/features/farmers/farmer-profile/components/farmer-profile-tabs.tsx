import { ClipboardList, Sprout, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FarmerSeedAndFieldsTab } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/farmer-seed-and-fields-tab';
import { FarmerSeedDispatchTab } from '@/features/farmers/farmer-profile/seed-dispatch-tab/components/farmer-seed-dispatch-tab';
import { FarmerSeedRequisitionTab } from '@/features/farmers/farmer-profile/seed-requisition-tab/components/farmer-seed-requisition-tab';
import type { Farmer } from '@/features/farmers/overview/types';

export function FarmerProfileTabs({ farmer }: { farmer: Farmer }) {
  return (
    <Tabs defaultValue="requisitions" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto md:overflow-visible">
        <TabsTrigger
          value="requisitions"
          aria-label="Seed Requisitions"
          className="shrink-0 md:flex-1"
        >
          <ClipboardList className="md:hidden" aria-hidden />
          <span className="hidden md:inline">Seed Requisitions</span>
        </TabsTrigger>
        <TabsTrigger value="dispatches" aria-label="Seed Dispatches" className="shrink-0 md:flex-1">
          <Truck className="md:hidden" aria-hidden />
          <span className="hidden md:inline">Seed Dispatches</span>
        </TabsTrigger>
        <TabsTrigger value="fields" aria-label="Seed & fields" className="shrink-0 md:flex-1">
          <Sprout className="md:hidden" aria-hidden />
          <span className="hidden md:inline">Seed & fields</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="requisitions">
        <FarmerSeedRequisitionTab farmer={farmer} />
      </TabsContent>
      <TabsContent value="dispatches">
        <FarmerSeedDispatchTab farmer={farmer} />
      </TabsContent>
      <TabsContent value="fields">
        <FarmerSeedAndFieldsTab farmer={farmer} />
      </TabsContent>
    </Tabs>
  );
}
