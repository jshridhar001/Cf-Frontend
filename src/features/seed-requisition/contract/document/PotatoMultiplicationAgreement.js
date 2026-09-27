import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { BRAND_LEGAL_NAME, BRAND_LOGO_SRC } from '@/lib/brand';
import './fonts';
import { styles } from './styles';
export function PotatoMultiplicationAgreement({ language, blocks, }) {
    const title = blocks.find((block) => block.kind === 'title');
    return (_jsx(Document, { title: title?.kind === 'title' ? title.text : 'Potato Multiplication Agreement', author: BRAND_LEGAL_NAME, subject: "Potato Multiplication Agreement", language: language === 'hi' ? 'hi-IN' : 'en-IN', children: _jsxs(Page, { size: "A4", style: language === 'hi' ? [styles.page, styles.pageHindi] : styles.page, children: [_jsx(View, { style: styles.header, fixed: true, children: _jsx(Image, { src: BRAND_LOGO_SRC, style: styles.logo }) }), blocks.map((block) => (_jsx(AgreementBlockView, { block: block }, agreementBlockKey(block)))), _jsx(Text, { fixed: true, style: styles.footer, render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}` })] }) }));
}
function agreementBlockKey(block) {
    switch (block.kind) {
        case 'year':
        case 'title':
        case 'p':
        case 'h2':
        case 'h3':
            return `${block.kind}:${block.text}`;
        case 'variety':
            return `${block.kind}:${block.id ?? block.text}`;
        case 'table':
            return `table:${block.table.headers.join('|')}`;
        case 'signatures':
            return `signatures:${block.firstParty}`;
    }
}
function AgreementBlockView({ block }) {
    switch (block.kind) {
        case 'year':
            return _jsx(Text, { style: styles.year, children: block.text });
        case 'title':
            return _jsx(Text, { style: styles.title, children: block.text });
        case 'variety':
            return (_jsx(Text, { style: block.id === 'annexure' ? styles.varietyAnnexure : styles.variety, children: block.text }));
        case 'p':
            return _jsx(RichText, { text: block.text, bold: block.bold, align: block.align });
        case 'h2':
            return (_jsx(Text, { style: block.underline ? [styles.h2, styles.underline] : styles.h2, minPresenceAhead: 32, break: block.breakBefore, children: block.text }));
        case 'h3':
            return (_jsx(Text, { style: styles.h3, minPresenceAhead: 24, children: block.text }));
        case 'table':
            return _jsx(AgreementTableView, { headers: block.table.headers, rows: block.table.rows });
        case 'signatures':
            return (_jsxs(View, { wrap: false, children: [_jsxs(View, { style: styles.signatures, children: [_jsxs(View, { style: styles.signatureBlock, children: [_jsx(Text, { style: styles.signatureRole, children: block.firstParty }), _jsx(View, { style: styles.signatureLine }), _jsx(Text, { children: block.sign }), _jsx(Text, { children: block.firstPartyCaption })] }), _jsxs(View, { style: styles.signatureBlock, children: [_jsx(Text, { style: styles.signatureRole, children: block.secondParty }), _jsx(View, { style: styles.signatureLine }), _jsx(Text, { children: block.sign }), _jsx(Text, { children: block.secondPartyCaption })] })] }), _jsx(Text, { style: styles.witnesses, children: block.witnesses }), _jsx(Text, { style: styles.witnessLine, children: "1." }), _jsx(Text, { style: styles.witnessLine, children: "2." })] }));
        default:
            return null;
    }
}
function RichText({ text, bold = false, align, }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);
    const seen = new Map();
    return (_jsx(Text, { style: [styles.paragraph, bold ? styles.bold : {}, align === 'center' ? styles.center : {}], children: parts.map((part) => {
            const marked = part.startsWith('**') && part.endsWith('**');
            const value = marked ? part.slice(2, -2) : part;
            const occurrence = (seen.get(value) ?? 0) + 1;
            seen.set(value, occurrence);
            return marked ? (_jsx(Text, { style: styles.bold, children: value }, `${occurrence}-${value}`)) : (value);
        }) }));
}
function AgreementTableView({ headers, rows }) {
    const width = `${100 / headers.length}%`;
    return (_jsxs(View, { style: styles.table, children: [_jsx(View, { style: styles.tableRow, wrap: false, children: headers.map((header) => (_jsx(Text, { style: [styles.tableCell, styles.tableHeader, { width }], children: header }, header))) }), rows.map((row, rowIndex) => (_jsx(View, { style: rowIndex === rows.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow, wrap: false, children: row.map((cell, cellIndex) => (_jsx(Text, { style: [styles.tableCell, { width }], children: cell }, headers[cellIndex]))) }, row.join('|'))))] }));
}
