import { useState } from 'react';
import {
  type AddressMasterId,
  addressMasterIds,
  addressMasters,
} from '@/features/master/lib/address-masters';
import { cn } from '@/lib/utils';
import { NamedMasterSection } from './named-master-section';

export function AddressesTabContent() {
  const [activeSection, setActiveSection] = useState<AddressMasterId>('states');

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
      <nav
        aria-label="Address sections"
        className="flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col md:overflow-visible"
      >
        {addressMasterIds.map((sectionId) => {
          const isActive = sectionId === activeSection;

          return (
            <button
              key={sectionId}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActiveSection(sectionId)}
              className={cn(
                'relative min-h-11 shrink-0 rounded-md px-3 text-left text-sm font-medium whitespace-nowrap transition-colors md:min-h-9 md:w-full',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {addressMasters[sectionId].title}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute bg-foreground transition-opacity',
                  'right-3 bottom-1 left-3 h-0.5 md:inset-y-2 md:right-auto md:left-0 md:h-auto md:w-0.5',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">
        <NamedMasterSection key={activeSection} resourceId={activeSection} />
      </div>
    </div>
  );
}
