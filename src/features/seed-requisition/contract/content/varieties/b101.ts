import {
  AMOUNT_19000,
  AMOUNT_25000,
  AMOUNT_36000,
  CHEQUE_10000,
  CONDITIONAL_ANNEXURE_HEADERS,
  CONDITIONAL_ANNEXURE_INTRO,
  CONDITIONAL_ANNEXURE_NOTE,
  JALANDHAR_DELIVERY,
} from './commercial';
import type { VarietyTerms } from './types';

export const B101: VarietyTerms = {
  label: { en: 'B 101', hi: 'B 101' },
  titleLabel: { en: 'B 101', hi: 'B 101' },
  hindiDeliveryPlace: JALANDHAR_DELIVERY,
  encashCheques: 'cheque',
  advanceAmount: AMOUNT_25000,
  firstCheque: CHEQUE_10000,
  secondCheque: AMOUNT_19000,
  normalYieldSeedValue: AMOUNT_36000,
  buyback: {
    en: {
      headers: ['Tuber Size', 'Rate'],
      rows: [
        ['Below 40 mm', 'Rs 16.75 / kg'],
        ['40 – 45 mm', 'Rs 13.25 / kg'],
        ['45 – 50 mm', 'Rs 11.25 / kg'],
        ['Above 50 mm', 'Rs 8.75 / kg'],
        ['Cut and Crack', 'Rs 2.00 / kg'],
      ],
    },
    hi: {
      headers: ['ट्यूबर साइज़', 'रेट'],
      rows: [
        ['40 mm से कम', '₹16.75 / किलो'],
        ['40 – 45 mm', '₹13.25 / किलो'],
        ['45 – 50 mm', '₹11.25 / किलो'],
        ['50 mm से ज्यादा', '₹8.75 / किलो'],
        ['कट एंड क्रैक', '₹2.00 / किलो'],
      ],
    },
  },
  annexure: {
    en: {
      headers: [...CONDITIONAL_ANNEXURE_HEADERS.en],
      rows: [
        ['52 – 60 mm', '43', '837.21/-'],
        ['50 – 55 mm', '40', '900.00/-'],
        ['45 – 50 mm', '34', '1,058.82/-'],
        ['40 – 52 mm', '31', '1,161.29/-'],
        ['40 – 45 mm', '30', '1,200.00/-'],
        ['35 – 40 mm', '23', '1,565.22/-'],
        ['30 – 40 mm', '21', '1,714.29/-'],
        ['30 – 35 mm', '19', '1,894.74/-'],
      ],
    },
    hi: {
      headers: [...CONDITIONAL_ANNEXURE_HEADERS.hi],
      rows: [
        ['52 – 60 mm', '43', '837.21/-'],
        ['50 – 55 mm', '40', '900.00/-'],
        ['45 – 50 mm', '34', '1,058.82/-'],
        ['40 – 52 mm', '31', '1,161.29/-'],
        ['40 – 45 mm', '30', '1,200.00/-'],
        ['35 – 40 mm', '23', '1,565.22/-'],
        ['30 – 40 mm', '21', '1,714.29/-'],
        ['30 – 35 mm', '19', '1,894.74/-'],
      ],
    },
  },
  annexureIntro: CONDITIONAL_ANNEXURE_INTRO,
  annexureNote: CONDITIONAL_ANNEXURE_NOTE,
};
