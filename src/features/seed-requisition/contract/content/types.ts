export type AgreementLanguage = 'en' | 'hi';

export type AgreementTable = {
  headers: string[];
  rows: string[][];
};

export type AgreementSignatures = {
  kind: 'signatures';
  firstParty: string;
  secondParty: string;
  sign: string;
  firstPartyCaption: string;
  secondPartyCaption: string;
  witnesses: string;
};

export type AgreementBlock =
  | { kind: 'year'; text: string }
  | { kind: 'title'; text: string }
  | { kind: 'variety'; text: string; id?: string }
  | { kind: 'p'; text: string; bold?: boolean; align?: 'center' }
  | { kind: 'h2'; text: string; breakBefore?: boolean; underline?: boolean }
  | { kind: 'h3'; text: string }
  | { kind: 'table'; table: AgreementTable }
  | AgreementSignatures;

export type AgreementFields = {
  day: string;
  month: string;
  year: string;
  growerName: string;
  fatherName: string;
  pan: string;
  aadhaar: string;
  bankAccount: string;
  bankName: string;
  branch: string;
  ifsc: string;
  village: string;
  policeStation: string;
  postOffice: string;
  tehsil: string;
  district: string;
  state: string;
  pin: string;
  acres: string;
  landVillage: string;
};
