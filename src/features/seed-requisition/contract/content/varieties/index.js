import { B101 } from './b101';
import { HIMALINI } from './himalini';
import { SANTANA } from './santana';
const VARIETIES = [
    { names: ['himalini', 'kufri himalini'], terms: HIMALINI },
    { names: ['b 101', 'b101'], terms: B101 },
    { names: ['santana'], terms: SANTANA },
];
export function varietyTermsFor(name) {
    const normalized = name
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!normalized)
        return null;
    const compact = normalized.replace(/ /g, '');
    return (VARIETIES.find((variety) => variety.names.includes(normalized) || variety.names.includes(compact))?.terms ?? null);
}
