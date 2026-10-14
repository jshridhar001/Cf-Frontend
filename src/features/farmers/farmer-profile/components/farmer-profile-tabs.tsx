import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FarmerSeedAndFieldsTab } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/farmer-seed-and-fields-tab';
import { FarmerSeedDispatchTab } from '@/features/farmers/farmer-profile/seed-dispatch-tab/components/farmer-seed-dispatch-tab';
import { FarmerSeedRequisitionTab } from '@/features/farmers/farmer-profile/seed-requisition-tab/components/farmer-seed-requisition-tab';
import type { Farmer } from '@/features/farmers/overview/types';

export function FarmerProfileTabs({ farmer }: { farmer: Farmer }) {
  return (
    <Tabs defaultValue="requisitions">
      <TabsList className="h-11 w-full justify-start overflow-x-auto sm:overflow-visible">
        <TabsTrigger value="requisitions" className="flex-none sm:flex-1">
          Seed Requisitions
        </TabsTrigger>
        <TabsTrigger value="dispatches" className="flex-none sm:flex-1">
          Seed Dispatches
        </TabsTrigger>
        <TabsTrigger value="fields" className="flex-none sm:flex-1">
          Seed & fields
        </TabsTrigger>
      </TabsList>
      <TabsContent value="requisitions">
        <FarmerSeedRequisitionTab farmer={farmer} />
      </TabsContent>
      <TabsContent value="dispatches">
        <FarmerSeedDispatchTab farmer={farmer} />
      </TabsContent>
      <TabsContent value="fields">
        <FarmerSeedAndFieldsTab />
      </TabsContent>
    </Tabs>
  );
}
