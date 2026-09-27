import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSeedRequisition } from '@/features/seed-requisition/overview/api/use-seed-requisition';
import { getApiErrorMessage } from '@/lib/api-client';
import { englishAgreement } from '../content/en';
import { hindiAgreement } from '../content/hi';
import { varietyTermsFor } from '../content/varieties';
import { PotatoMultiplicationAgreement } from '../document/PotatoMultiplicationAgreement';
import { agreementFileName, toAgreementFields } from '../lib/agreement-fields';
import { AgreementDownload, AgreementPreview } from './AgreementPreview';
export function ContractPage({ id }) {
    const { data, isPending, isError, error } = useSeedRequisition(id);
    const [language, setLanguage] = useState('en');
    const terms = data ? varietyTermsFor(data.variety?.name) : null;
    const fields = useMemo(() => (data && terms ? toAgreementFields(data, language) : null), [data, language, terms]);
    const document = useMemo(() => {
        if (!fields || !terms)
            return null;
        const blocks = language === 'hi' ? hindiAgreement(fields, terms) : englishAgreement(fields, terms);
        return _jsx(PotatoMultiplicationAgreement, { language: language, blocks: blocks });
    }, [fields, language, terms]);
    const fileName = agreementFileName(fields?.growerName ?? '', language);
    const varietyName = data?.variety?.name?.trim() || 'this variety';
    return (_jsxs(PageCard, { children: [_jsxs(PageCardHeader, { className: "has-data-[slot=card-action]:grid-cols-[1fr_auto]", children: [_jsx(CardTitle, { children: "Potato multiplication agreement" }), _jsx(CardDescription, { className: "hidden sm:block", children: "English and Hindi preview of the potato multiplication agreement for this requisition." }), document ? (_jsxs(CardAction, { className: "flex items-center gap-1", children: [_jsx(AgreementDownload, { document: document, fileName: fileName, labeled: false, className: "min-h-11 min-w-11 md:hidden" }), _jsx(AgreementDownload, { document: document, fileName: fileName, labeled: true, className: "hidden md:inline-flex" })] })) : null] }), _jsxs(PageCardContent, { children: [isPending && !data ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "Loading requisition\u2026" })) : null, isError && !data ? (_jsx("p", { className: "text-sm text-destructive", children: getApiErrorMessage(error, 'Failed to load requisition.') })) : null, data && !terms ? (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["The agreement for ", varietyName, " is not available yet."] })) : null, document ? (_jsxs(Tabs, { value: language, onValueChange: (value) => setLanguage(value), className: "gap-4", children: [_jsxs(TabsList, { className: "w-full sm:w-fit", children: [_jsx(TabsTrigger, { value: "en", children: "English" }), _jsx(TabsTrigger, { value: "hi", children: "\u0939\u093F\u0928\u094D\u0926\u0940" })] }), _jsx(TabsContent, { value: "en", children: language === 'en' ? _jsx(AgreementPreview, { document: document }) : null }), _jsx(TabsContent, { value: "hi", children: language === 'hi' ? _jsx(AgreementPreview, { document: document }) : null })] })) : null] })] }));
}
