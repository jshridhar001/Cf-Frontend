export const CONTRACT_LANGUAGES = ['english', 'hindi'] as const;

export type ContractLanguage = (typeof CONTRACT_LANGUAGES)[number];

export function isContractLanguage(value: string): value is ContractLanguage {
  return CONTRACT_LANGUAGES.includes(value as ContractLanguage);
}
