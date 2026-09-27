import type { AgreementLanguage, AgreementTable } from '../types';

export type LocalizedText = Record<AgreementLanguage, string>;

export type VarietyTerms = {
  label: LocalizedText;
  titleLabel: LocalizedText;
  hindiDeliveryPlace: string;
  encashCheques: 'cheque' | 'cheques';
  advanceAmount: LocalizedText;
  firstCheque: LocalizedText;
  secondCheque: LocalizedText;
  normalYieldSeedValue: LocalizedText;
  buyback: Record<AgreementLanguage, AgreementTable>;
  annexure: Record<AgreementLanguage, AgreementTable>;
  annexureIntro: LocalizedText;
  annexureNote: LocalizedText;
};
