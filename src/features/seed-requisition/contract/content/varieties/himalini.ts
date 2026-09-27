import {
  AMOUNT_19000,
  AMOUNT_25000,
  AMOUNT_30000,
  CHEQUE_10000,
  JALANDHAR_DELIVERY,
} from './commercial';
import type { VarietyTerms } from './types';

export const HIMALINI: VarietyTerms = {
  label: { en: 'KUFRI HIMALINI', hi: 'कुफरी हिमालिनी' },
  titleLabel: { en: 'KUFRI HIMALINI', hi: 'कुफरी हिमालिनी (KUFRI HIMALINI)' },
  hindiDeliveryPlace: JALANDHAR_DELIVERY,
  encashCheques: 'cheques',
  advanceAmount: AMOUNT_19000,
  firstCheque: CHEQUE_10000,
  secondCheque: AMOUNT_25000,
  normalYieldSeedValue: AMOUNT_30000,
  buyback: {
    en: {
      headers: ['Tuber Size', 'Rate'],
      rows: [
        ['Below 40 mm', 'Rs 15.25 / kg'],
        ['40 – 45 mm', 'Rs 12.25 / kg'],
        ['Above 45 mm', 'Rs 8.75 / kg'],
        ['Cut and Crack', 'Rs 2.00 / kg'],
      ],
    },
    hi: {
      headers: ['ट्यूबर साइज़', 'रेट'],
      rows: [
        ['40 mm से कम', '₹15.25 / किलो'],
        ['40 – 45 mm', '₹12.25 / किलो'],
        ['45 mm से ज्यादा', '₹8.75 / किलो'],
        ['कट एंड क्रैक', '₹2.00 / किलो'],
      ],
    },
  },
  annexure: {
    en: {
      headers: [
        'Designated Grade',
        'Planting Material per Acre (units as 50 Kgs per bag)',
        'Rate per Unit (Rs.)',
      ],
      rows: [
        ['40 – 45 mm', '30', '1,000/-'],
        ['45 – 50 mm', '34', '882.35/-'],
      ],
    },
    hi: {
      headers: ['ग्रेड (साइज़)', 'प्लांटिंग मटीरियल प्रति एकड़ (50 किलो की बोरी)', 'रेट प्रति यूनिट (₹)'],
      rows: [
        ['40 – 45 mm', '30', '1,000/-'],
        ['45 – 50 mm', '34', '882.35/-'],
      ],
    },
  },
  annexureIntro: {
    en: 'Planting material and Conditional Seed Value per acre by tuber size, as supplied to the Second Party for multiplication under Clause 1.1 of this Agreement:',
    hi: 'इस एग्रीमेंट के क्लॉज 1.1 के हिसाब से, सेकंड पार्टी को मल्टीप्लीकेशन के लिए प्रति एकड़ दिया जाने वाला प्लांटिंग मटीरियल, ट्यूबर साइज़ और कंडीशनल सीड वैल्यू इस तरह है:',
  },
  annexureNote: {
    en: 'The above table shows the standard quantity and value of planting material per acre for each tuber size/grade. The Second Party must sow the planting material supplied as per the quantities specified herein. If the quantity of planting material supplied changes after signing this Agreement, the area to be planted shall be adjusted in the same proportion as the change in quantity.',
    hi: 'ऊपर दी टेबल हर ट्यूबर साइज़/ग्रेड के लिए प्रति एकड़ प्लांटिंग मटीरियल की स्टैंडर्ड क्वांटिटी और वैल्यू दिखाती है। सेकंड पार्टी को यहां बताई क्वांटिटी के हिसाब से ही प्लांटिंग मटीरियल बोना होगा। अगर इस एग्रीमेंट पर साइन के बाद दिए जाने वाले प्लांटिंग मटीरियल की क्वांटिटी में बदलाव होता है, तो बोई जाने वाली जमीन का एरिया भी उसी अनुपात में एडजस्ट किया जाएगा।',
  },
};
