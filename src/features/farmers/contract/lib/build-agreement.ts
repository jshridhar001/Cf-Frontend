import type { ContractLanguage } from '@/features/farmers/contract/lib/contract-language';
import type { AgreementContext } from '@/features/farmers/contract/lib/farmer-contract';
import {
  type AgreementBlock,
  buildPotatoMultiplicationAgreement,
} from '@/features/farmers/contract/lib/potato-multiplication-agreement';
import { buildPotatoMultiplicationAgreementHi } from '@/features/farmers/contract/lib/potato-multiplication-agreement-hi';

export function buildPotatoMultiplicationAgreementForLang(
  ctx: AgreementContext,
  language: ContractLanguage = 'english',
): AgreementBlock[] {
  if (language === 'hindi') return buildPotatoMultiplicationAgreementHi(ctx);
  return buildPotatoMultiplicationAgreement(ctx);
}
