import type { AgreementTable } from '../types';

export const CURING: Record<'en' | 'hi', AgreementTable> = {
  en: {
    headers: ['De-haulming Window', 'Minimum Curing Period Before Harvest'],
    rows: [
      ['1st December – 15th January', '42 days'],
      ['16th January – 31st January', '35 days'],
      ['February (entire month)', '27 days'],
    ],
  },
  hi: {
    headers: ['डी-हॉलमिंग विंडो', 'हार्वेस्ट से पहले मिनिमम क्यूरिंग पीरियड'],
    rows: [
      ['1 दिसंबर – 15 जनवरी', '42 दिन'],
      ['16 जनवरी – 31 जनवरी', '35 दिन'],
      ['फरवरी (पूरा महीना)', '27 दिन'],
    ],
  },
};
