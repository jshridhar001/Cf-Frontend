import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DownloadIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function AgreementPreview({ document }) {
    return (_jsx("div", { className: "h-[min(70dvh,900px)] w-full overflow-hidden rounded-lg border", children: _jsx(PDFViewer, { width: "100%", height: "100%", className: "size-full border-0", showToolbar: true, children: document }) }));
}
export function AgreementDownload({ document, fileName, className, labeled, }) {
    return (_jsx(PDFDownloadLink, { document: document, fileName: fileName, "aria-label": "Download agreement", className: cn(buttonVariants({ size: labeled ? 'default' : 'icon' }), className), children: ({ loading }) => (_jsxs(_Fragment, { children: [_jsx(DownloadIcon, {}), labeled ? (loading ? 'Preparing…' : 'Download') : null] })) }));
}
