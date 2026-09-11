import { describe, expect, it } from 'vitest';
import { buildPotatoMultiplicationAgreementForLang } from './build-agreement';
import type { AgreementContext } from './farmer-contract';
import {
  COMPANY_DELIVERY_ADDRESS,
  COMPANY_DELIVERY_ADDRESS_HI,
  CONTRACT_TITLE,
} from './farmer-contract';
import { type AgreementBlock, flattenAgreementBlocks } from './potato-multiplication-agreement';

function context(variety: string): AgreementContext {
  return {
    companyName: 'Bhatti Agritech Pvt. Ltd.',
    companyAddress:
      'Village - Alipur, PO - Mithapur, P.S – Sadar, Jalandhar, Tehsil & District- Jalandhar (Punjab)-144022',
    companyDeliveryAddress: COMPANY_DELIVERY_ADDRESS,
    contractTitle: CONTRACT_TITLE,
    variety,
    varietyDisplay: variety.toUpperCase(),
    agreementDay: '11',
    agreementMonth: 'September',
    agreementYear: '2026',
    farmerName: 'Test Farmer',
    fatherName: '---',
    panNumber: '---',
    aadharNumber: '---',
    bankAccountNumber: '---',
    bankName: '---',
    bankBranch: '---',
    ifsCode: '---',
    village: 'Alipur',
    policeStation: '---',
    postOffice: '---',
    tehsil: '---',
    district: 'Jalandhar',
    state: 'Punjab',
    pinCode: '---',
    landAcres: '2',
    landVillage: 'Alipur',
    mobileNumber: '9999999999',
    accountNumber: 'CF-1',
    totalBags: '---',
    generatedAtLabel: '11 Sep 2026',
  };
}

function text(blocks: AgreementBlock[]) {
  return flattenAgreementBlocks(blocks);
}

describe('potato multiplication agreement golden strings', () => {
  it('uses Himalini English commercial terms, annexure, and Bazpur delivery', () => {
    const blocks = buildPotatoMultiplicationAgreementForLang(context('Kufri Himalini'), 'english');
    const body = text(blocks);

    expect(body).toContain('Rs. 19,000/-');
    expect(body).toContain('Rs. 30,000/-');
    expect(body).toContain('Rs 15.25 / kg');
    expect(body).toContain('Rate per Unit (Rs.)');
    expect(body).toContain('40 – 45 mm | 30 | 1,000/-');
    expect(body).toContain('ANNEXURE 1');
    expect(body).toContain(COMPANY_DELIVERY_ADDRESS);
    expect(body).toContain('between 58 and 65 days');
    expect(body).toContain('between 35 and 45 days');
    expect(body).not.toContain('65 and 70');
    expect(body).not.toContain('45 and 55');
  });

  it('uses B 101 English commercial terms and annexure', () => {
    const blocks = buildPotatoMultiplicationAgreementForLang(context('B 101'), 'english');
    const body = text(blocks);

    expect(body).toContain('Rs. 25,000/-');
    expect(body).toContain('Rs. 36,000/-');
    expect(body).toContain('Rupees Thirty SixThousand only');
    expect(body).toContain('Rs 16.75 / kg');
    expect(body).toContain('45 – 50 mm | Rs 11.25 / kg');
    expect(body).toContain('Conditional Rate (Rs. per Bag)');
    expect(body).toContain('52 – 60 mm | 43 | 837.21/-');
    expect(body).toContain('encash the postdated cheque');
  });

  it('uses Himalini Hindi commercial terms, Hinglish wording, and Alipur delivery', () => {
    const blocks = buildPotatoMultiplicationAgreementForLang(context('Kufri Himalini'), 'hindi');
    const body = text(blocks);

    expect(body).toContain('पोटैटो मल्टीप्लीकेशन एग्रीमेंट');
    expect(body).toContain('फर्स्ट पार्टी');
    expect(body).toContain('सेकंड पार्टी');
    expect(body).toContain('₹19,000/-');
    expect(body).toContain('₹30,000/-');
    expect(body).toContain('₹15.25 / किलो');
    expect(body).toContain('रेट प्रति यूनिट (₹)');
    expect(body).toContain(COMPANY_DELIVERY_ADDRESS_HI);
    expect(body).toContain('58 से 65 दिन');
    expect(body).toContain('35 से 45 दिन');
    expect(body).not.toContain('आलू गुणन समझौता');
    expect(body).not.toContain('प्रथम पक्ष');
  });

  it('uses B 101 Hindi commercial terms', () => {
    const blocks = buildPotatoMultiplicationAgreementForLang(context('B 101'), 'hindi');
    const body = text(blocks);

    expect(body).toContain('₹25,000/-');
    expect(body).toContain('₹36,000/-');
    expect(body).toContain('₹16.75 / किलो');
    expect(body).toContain('कंडीशनल रेट (₹ प्रति बोरी)');
    expect(body).toContain('52 – 60 mm | 43 | 837.21/-');
  });
});
