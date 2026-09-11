import type { ContractLanguage } from '@/features/farmers/contract/lib/contract-language';

export function agreementLabels(language: ContractLanguage) {
  if (language === 'hindi') {
    return {
      firstParty: 'फर्स्ट पार्टी (First Party)',
      secondParty: 'सेकंड पार्टी (Second Party)',
      signature: 'साइन (Signature)',
      firstPartyCaption: '(फर्स्ट पार्टी - भट्टी एग्रीटेक प्रा. लि.)',
      secondPartyCaption: '(सेकंड पार्टी - किसान)',
      witnesses: 'गवाह (Witnesses):',
    };
  }

  return {
    firstParty: 'First Party',
    secondParty: 'Second Party',
    signature: 'Signature',
    firstPartyCaption: '(First Party - Bhatti Agritech Pvt. Ltd.)',
    secondPartyCaption: '(Second Party- Grower)',
    witnesses: 'Witnesses:',
  };
}
