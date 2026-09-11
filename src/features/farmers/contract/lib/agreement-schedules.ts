export type AgreementScheduleId = 'himalini' | 'b101';

export type AgreementTableRow = {
  sizeEn: string;
  sizeHi: string;
  rateEn: string;
  rateHi: string;
};

export type AnnexureRow = {
  grade: string;
  bags: string;
  rate: string;
};

export type AgreementSchedule = {
  id: AgreementScheduleId;
  varietyDisplayEn: string;
  varietySubtitleHi: string;
  varietyBodyHi: string;
  tokenRupees: string;
  tokenWordsEn: string;
  tokenWordsHi: string;
  advanceRupees: string;
  advanceWordsEn: string;
  advanceWordsHi: string;
  pdcFirstRupees: string;
  pdcFirstWordsEn: string;
  pdcFirstWordsHi: string;
  pdcSecondRupees: string;
  pdcSecondWordsEn: string;
  pdcSecondWordsHi: string;
  pdcEncashmentEn: string;
  normalYieldSeedRupees: string;
  normalYieldSeedWordsEn: string;
  normalYieldSeedWordsHi: string;
  adjustedSeedRupees: string;
  adjustedSeedWordsEn: string;
  adjustedSeedWordsHi: string;
  buybackRows: AgreementTableRow[];
  annexureHeadersEn: string[];
  annexureHeadersHi: string[];
  annexureRows: AnnexureRow[];
  annexureIntroEn: string;
  annexureIntroHi: string;
  annexureFooterEn: string;
  annexureFooterHi: string;
};

const B101_VARIETY_RE = /b[\s.-]*101/i;

export const HIMALINI_SCHEDULE: AgreementSchedule = {
  id: 'himalini',
  varietyDisplayEn: 'KUFRI HIMALINI',
  varietySubtitleHi: 'कुफरी हिमालिनी (KUFRI HIMALINI)',
  varietyBodyHi: 'कुफरी हिमालिनी',
  tokenRupees: '1,000',
  tokenWordsEn: 'Rupees One Thousand only',
  tokenWordsHi: 'एक हजार रुपये',
  advanceRupees: '19,000',
  advanceWordsEn: 'Rupees Nineteen Thousand only',
  advanceWordsHi: 'उन्नीस हजार रुपये',
  pdcFirstRupees: '10,000',
  pdcFirstWordsEn: 'Rupees Ten Thousand only',
  pdcFirstWordsHi: 'दस हजार रुपये',
  pdcSecondRupees: '25,000',
  pdcSecondWordsEn: 'Rupees Twenty-Five Thousand only',
  pdcSecondWordsHi: 'पच्चीस हजार रुपये',
  pdcEncashmentEn: 'postdated cheques',
  normalYieldSeedRupees: '30,000',
  normalYieldSeedWordsEn: 'Rupees Thirty Thousand only',
  normalYieldSeedWordsHi: 'तीस हजार रुपये',
  adjustedSeedRupees: '55,000',
  adjustedSeedWordsEn: 'Rupees Fifty-Five Thousand only',
  adjustedSeedWordsHi: 'पचपन हजार रुपये',
  buybackRows: [
    {
      sizeEn: 'Below 40 mm',
      sizeHi: '40 mm से कम',
      rateEn: 'Rs 15.25 / kg',
      rateHi: '₹15.25 / किलो',
    },
    {
      sizeEn: '40 – 45 mm',
      sizeHi: '40 – 45 mm',
      rateEn: 'Rs 12.25 / kg',
      rateHi: '₹12.25 / किलो',
    },
    {
      sizeEn: 'Above 45 mm',
      sizeHi: '45 mm से ज्यादा',
      rateEn: 'Rs 8.75 / kg',
      rateHi: '₹8.75 / किलो',
    },
    {
      sizeEn: 'Cut and Crack',
      sizeHi: 'कट एंड क्रैक',
      rateEn: 'Rs 2.00 / kg',
      rateHi: '₹2.00 / किलो',
    },
  ],
  annexureHeadersEn: [
    'Designated Grade',
    'Planting Material per Acre (units as 50 Kgs per bag)',
    'Rate per Unit (Rs.)',
  ],
  annexureHeadersHi: [
    'ग्रेड (साइज़)',
    'प्लांटिंग मटीरियल प्रति एकड़ (50 किलो की बोरी)',
    'रेट प्रति यूनिट (₹)',
  ],
  annexureRows: [
    { grade: '40 – 45 mm', bags: '30', rate: '1,000/-' },
    { grade: '45 – 50 mm', bags: '34', rate: '882.35/-' },
  ],
  annexureIntroEn:
    'Planting material and Conditional Seed Value per acre by tuber size, as supplied to the Second Party for multiplication under Clause 1.1 of this Agreement:',
  annexureIntroHi:
    'इस एग्रीमेंट के क्लॉज 1.1 के हिसाब से, सेकंड पार्टी को मल्टीप्लीकेशन के लिए प्रति एकड़ दिया जाने वाला प्लांटिंग मटीरियल, ट्यूबर साइज़ और कंडीशनल सीड वैल्यू इस तरह है:',
  annexureFooterEn:
    'The above table shows the standard quantity and value of planting material per acre for each tuber size/grade. The Second Party must sow the planting material supplied as per the quantities specified herein. If the quantity of planting material supplied changes after signing this Agreement, the area to be planted shall be adjusted in the same proportion as the change in quantity.',
  annexureFooterHi:
    'ऊपर दी टेबल हर ट्यूबर साइज़/ग्रेड के लिए प्रति एकड़ प्लांटिंग मटीरियल की स्टैंडर्ड क्वांटिटी और वैल्यू दिखाती है। सेकंड पार्टी को यहां बताई क्वांटिटी के हिसाब से ही प्लांटिंग मटीरियल बोना होगा। अगर इस एग्रीमेंट पर साइन के बाद दिए जाने वाले प्लांटिंग मटीरियल की क्वांटिटी में बदलाव होता है, तो बोई जाने वाली जमीन का एरिया भी उसी अनुपात में एडजस्ट किया जाएगा।',
};

export const B101_SCHEDULE: AgreementSchedule = {
  id: 'b101',
  varietyDisplayEn: 'B 101',
  varietySubtitleHi: 'B 101',
  varietyBodyHi: 'B 101',
  tokenRupees: '1,000',
  tokenWordsEn: 'Rupees One Thousand only',
  tokenWordsHi: 'एक हजार रुपये',
  advanceRupees: '25,000',
  advanceWordsEn: 'Rupees Twenty-Five Thousand only',
  advanceWordsHi: 'पच्चीस हजार रुपये',
  pdcFirstRupees: '10,000',
  pdcFirstWordsEn: 'Rupees Ten Thousand only',
  pdcFirstWordsHi: 'दस हजार रुपये',
  pdcSecondRupees: '19,000',
  pdcSecondWordsEn: 'Rupees Nineteen Thousand only',
  pdcSecondWordsHi: 'उन्नीस हजार रुपये',
  pdcEncashmentEn: 'postdated cheque',
  normalYieldSeedRupees: '36,000',
  normalYieldSeedWordsEn: 'Rupees Thirty SixThousand only',
  normalYieldSeedWordsHi: 'छत्तीस हजार रुपये',
  adjustedSeedRupees: '55,000',
  adjustedSeedWordsEn: 'Rupees Fifty-Five Thousand only',
  adjustedSeedWordsHi: 'पचपन हजार रुपये',
  buybackRows: [
    {
      sizeEn: 'Below 40 mm',
      sizeHi: '40 mm से कम',
      rateEn: 'Rs 16.75 / kg',
      rateHi: '₹16.75 / किलो',
    },
    {
      sizeEn: '40 – 45 mm',
      sizeHi: '40 – 45 mm',
      rateEn: 'Rs 13.25 / kg',
      rateHi: '₹13.25 / किलो',
    },
    {
      sizeEn: '45 – 50 mm',
      sizeHi: '45 – 50 mm',
      rateEn: 'Rs 11.25 / kg',
      rateHi: '₹11.25 / किलो',
    },
    {
      sizeEn: 'Above 50 mm',
      sizeHi: '50 mm से ज्यादा',
      rateEn: 'Rs 8.75 / kg',
      rateHi: '₹8.75 / किलो',
    },
    {
      sizeEn: 'Cut and Crack',
      sizeHi: 'कट एंड क्रैक',
      rateEn: 'Rs 2.00 / kg',
      rateHi: '₹2.00 / किलो',
    },
  ],
  annexureHeadersEn: [
    'Designated Grade',
    'Planting Material per Acre (units as 50 Kgs per bag)',
    'Conditional Rate (Rs. per Bag)',
  ],
  annexureHeadersHi: [
    'ग्रेड (साइज़)',
    'प्लांटिंग मटीरियल प्रति एकड़ (50 किलो की बोरी)',
    'कंडीशनल रेट (₹ प्रति बोरी)',
  ],
  annexureRows: [
    { grade: '52 – 60 mm', bags: '43', rate: '837.21/-' },
    { grade: '50 – 55 mm', bags: '40', rate: '900.00/-' },
    { grade: '45 – 50 mm', bags: '34', rate: '1,058.82/-' },
    { grade: '40 – 52 mm', bags: '31', rate: '1,161.29/-' },
    { grade: '40 – 45 mm', bags: '30', rate: '1,200.00/-' },
    { grade: '35 – 40 mm', bags: '23', rate: '1,565.22/-' },
    { grade: '30 – 40 mm', bags: '21', rate: '1,714.29/-' },
    { grade: '30 – 35 mm', bags: '19', rate: '1,894.74/-' },
  ],
  annexureIntroEn:
    'Planting material to be supplied per acre by tuber size, as supplied to the Second Party for multiplication under Clause 1.1 of this Agreement. The Conditional Seed Value of Rs. 36,000/- per acre set out in Clause 1.6 applies irrespective of the grade mix actually supplied:',
  annexureIntroHi:
    'इस एग्रीमेंट के क्लॉज 1.1 के हिसाब से, सेकंड पार्टी को मल्टीप्लीकेशन के लिए प्रति एकड़ दिया जाने वाला प्लांटिंग मटीरियल, ट्यूबर साइज़ के हिसाब से इस तरह है। क्लॉज 1.6 में तय ₹36,000/- प्रति एकड़ की कंडीशनल सीड वैल्यू, चाहे कोई भी ग्रेड मिक्स दिया जाए, वही लागू रहेगी:',
  annexureFooterEn:
    'The above table shows the standard quantity of planting material per acre for each tuber size/grade, along with the Conditional Rate per bag for that grade. The Conditional Rate is calculated by dividing the Conditional Seed Value of Rs. 36,000/- per acre (Clause 1.6) by the number of bags per acre applicable to that grade, and is shown for reference only — the amount actually payable by the Second Party remains the flat Conditional Seed Value of Rs. 36,000/- per acre irrespective of the grade mix supplied. The Second Party must sow the planting material supplied as per the quantities specified herein. If the quantity of planting material supplied changes after signing this Agreement, the area to be planted shall be adjusted in the same proportion as the change in quantity.',
  annexureFooterHi:
    'ऊपर दी टेबल हर ट्यूबर साइज़/ग्रेड के लिए प्रति एकड़ प्लांटिंग मटीरियल की स्टैंडर्ड क्वांटिटी दिखाती है, साथ ही उस ग्रेड का कंडीशनल रेट (प्रति बोरी) भी दिखाती है। यह कंडीशनल रेट, क्लॉज 1.6 में तय ₹36,000/- प्रति एकड़ की कंडीशनल सीड वैल्यू को उस ग्रेड की प्रति एकड़ बोरी काउंट से डिवाइड करके निकाला गया है, और यह सिर्फ जानकारी के लिए है — सेकंड पार्टी को असल में जो अमाउंट देना होगा, वो हमेशा ₹36,000/- प्रति एकड़ की कंडीशनल सीड वैल्यू ही रहेगा, चाहे कोई भी ग्रेड मिक्स दिया जाए। सेकंड पार्टी को यहां बताई क्वांटिटी के हिसाब से ही प्लांटिंग मटीरियल बोना होगा। अगर इस एग्रीमेंट पर साइन के बाद दिए जाने वाले प्लांटिंग मटीरियल की क्वांटिटी में बदलाव होता है, तो बोई जाने वाली जमीन का एरिया भी उसी अनुपात में एडजस्ट किया जाएगा।',
};

export function resolveAgreementSchedule(variety: string): AgreementSchedule {
  const trimmed = variety.trim();
  if (B101_VARIETY_RE.test(trimmed)) return B101_SCHEDULE;
  if (/himalini/i.test(trimmed) || trimmed.includes('हिमालिनी')) return HIMALINI_SCHEDULE;

  const display = trimmed ? trimmed.toUpperCase() : HIMALINI_SCHEDULE.varietyDisplayEn;
  return {
    ...HIMALINI_SCHEDULE,
    varietyDisplayEn: display,
    varietySubtitleHi: display,
    varietyBodyHi: display,
  };
}
