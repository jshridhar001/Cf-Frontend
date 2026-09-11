import type { ContractLanguage } from '@/features/farmers/lib/contract-language';
import type { AgreementContext } from '@/features/farmers/lib/farmer-contract';
import {
  type AgreementBlock,
  buildPotatoMultiplicationAgreement,
} from '@/features/farmers/lib/potato-multiplication-agreement';
import { buildPotatoMultiplicationAgreementHi } from '@/features/farmers/lib/potato-multiplication-agreement-hi';

export function buildPotatoMultiplicationAgreementForLang(
  ctx: AgreementContext,
  language: ContractLanguage = 'english',
): AgreementBlock[] {
  if (language === 'hindi') return buildPotatoMultiplicationAgreementHi(ctx);
  return buildPotatoMultiplicationAgreement(ctx);
}
