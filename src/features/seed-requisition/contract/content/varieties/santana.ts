import {
  AMOUNT_19000,
  AMOUNT_25000,
  AMOUNT_36000,
  BAZPUR_DELIVERY,
  CHEQUE_10000,
  CONDITIONAL_ANNEXURE_HEADERS,
  CONDITIONAL_ANNEXURE_INTRO,
  CONDITIONAL_ANNEXURE_NOTE,
} from './commercial';
import type { VarietyTerms } from './types';

export const SANTANA: VarietyTerms = {
  label: { en: 'SANTANA', hi: 'SANTANA' },
  titleLabel: { en: 'SANTANA', hi: 'SANTANA' },
  hindiDeliveryPlace: BAZPUR_DELIVERY,
  encashCheques: 'cheques',
  advanceAmount: AMOUNT_25000,
  firstCheque: CHEQUE_10000,
  secondCheque: AMOUNT_19000,
  normalYieldSeedValue: AMOUNT_36000,
  buyback: {
    en: {
      headers: ['Tuber Size', 'Rate'],
      rows: [
        ['25 – 55 mm', 'Rs 13.25 / kg'],
        ['Above 55 mm', 'Rs 7.00 / kg'],
        ['Below 25 mm', 'Rs 7.00 / kg'],
        ['Cut and Crack', 'Rs 1.00 / kg'],
      ],
    },
    hi: {
      headers: ['ट्यूबर साइज़', 'रेट'],
      rows: [
        ['25 – 55 mm', '₹13.25 / किलो'],
        ['55 mm से ज्यादा', '₹7.00 / किलो'],
        ['25 mm से कम', '₹7.00 / किलो'],
        ['कट एंड क्रैक', '₹1.00 / किलो'],
      ],
    },
  },
  annexure: {
    en: {
      headers: [...CONDITIONAL_ANNEXURE_HEADERS.en],
      rows: [
        ['52 – 60 mm', '50', '720.00/-'],
        ['40 – 52 mm', '38', '947.37/-'],
        ['30 – 40 mm', '26', '1,384.62/-'],
        ['Below 30 mm', '15', '2,400.00/-'],
      ],
    },
    hi: {
      headers: [...CONDITIONAL_ANNEXURE_HEADERS.hi],
      rows: [
        ['52 – 60 mm', '50', '720.00/-'],
        ['40 – 52 mm', '38', '947.37/-'],
        ['30 – 40 mm', '26', '1,384.62/-'],
        ['30 mm से कम', '15', '2,400.00/-'],
      ],
    },
  },
  annexureIntro: CONDITIONAL_ANNEXURE_INTRO,
  annexureNote: CONDITIONAL_ANNEXURE_NOTE,
};
