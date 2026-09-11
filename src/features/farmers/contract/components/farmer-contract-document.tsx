'use no memo';

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { agreementLabels } from '@/features/farmers/contract/lib/agreement-labels';
import { buildPotatoMultiplicationAgreementForLang } from '@/features/farmers/contract/lib/build-agreement';
import type { ContractLanguage } from '@/features/farmers/contract/lib/contract-language';
import {
  type AgreementContext,
  COMPANY_LOGO_URL,
} from '@/features/farmers/contract/lib/farmer-contract';
import type {
  AgreementBlock,
  AgreementRun,
  AgreementTable,
} from '@/features/farmers/contract/lib/potato-multiplication-agreement';
import {
  DEVANAGARI_PDF_FONT,
  registerDevanagariPdfFont,
} from '@/features/farmers/contract/lib/register-devanagari-pdf-font';

type DocumentStyles = ReturnType<typeof createDocumentStyles>;

function createDocumentStyles(language: ContractLanguage) {
  const isHindi = language === 'hindi';
  const fontFamily = isHindi ? DEVANAGARI_PDF_FONT : 'Helvetica';
  const fontFamilyBold = isHindi ? DEVANAGARI_PDF_FONT : 'Helvetica-Bold';
  const fontWeightBold = isHindi ? 700 : undefined;

  return StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 48,
      paddingHorizontal: 40,
      fontSize: 9,
      fontFamily,
      color: '#1a1a1a',
      lineHeight: 1.4,
    },
    header: {
      alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1.5,
      borderBottomColor: '#166534',
    },
    logo: {
      height: 36,
      width: 140,
      marginBottom: 4,
    },
    year: {
      fontSize: 8,
      color: '#525252',
      textAlign: 'center',
    },
    title: {
      fontSize: 12,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      textAlign: 'center',
      marginBottom: 4,
      textTransform: isHindi ? undefined : 'uppercase',
    },
    subtitle: {
      fontSize: 10,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      textAlign: 'center',
      color: '#166534',
      marginBottom: 12,
    },
    centered: {
      fontSize: 9,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      textAlign: 'center',
      marginVertical: 8,
    },
    sectionHeading: {
      fontSize: 9,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      marginTop: 12,
      marginBottom: 6,
      textTransform: isHindi ? undefined : 'uppercase',
    },
    clauseHeading: {
      fontSize: 9,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      color: '#166534',
      marginTop: 10,
      marginBottom: 4,
    },
    paragraph: {
      fontSize: 9,
      marginBottom: 5,
      textAlign: 'justify',
    },
    table: {
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#d4d4d4',
    },
    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: '#f0fdf4',
      borderBottomWidth: 1,
      borderBottomColor: '#bbf7d0',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e5e5',
    },
    th: {
      flex: 1,
      padding: 5,
      fontSize: 8,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      color: '#166534',
    },
    td: {
      flex: 1,
      padding: 5,
      fontSize: 8,
    },
    tdStrong: {
      flex: 1,
      padding: 5,
      fontSize: 8,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
    },
    runStrong: {
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
    },
    signatures: {
      marginTop: 18,
    },
    signatureRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 20,
      marginBottom: 16,
    },
    signatureBlock: {
      width: '45%',
    },
    signatureLabel: {
      fontSize: 9,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      marginBottom: 28,
    },
    signatureLine: {
      borderTopWidth: 1,
      borderTopColor: '#a3a3a3',
      paddingTop: 4,
      fontSize: 8,
      color: '#525252',
    },
    signatureCaption: {
      fontSize: 8,
      color: '#525252',
      marginTop: 2,
    },
    witnessLabel: {
      fontSize: 9,
      fontFamily: fontFamilyBold,
      fontWeight: fontWeightBold,
      marginBottom: 10,
    },
    witnessLine: {
      borderTopWidth: 1,
      borderTopColor: '#a3a3a3',
      marginTop: 22,
      paddingTop: 4,
      fontSize: 8,
      color: '#525252',
    },
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 40,
      right: 40,
      fontSize: 7,
      color: '#a3a3a3',
      textAlign: 'center',
    },
  });
}

const englishStyles = createDocumentStyles('english');
const hindiStyles = createDocumentStyles('hindi');

function PdfRuns({ runs, styles }: { runs: AgreementRun[]; styles: DocumentStyles }) {
  let offset = 0;
  return (
    <Text style={styles.paragraph}>
      {runs.map((run) => {
        const start = offset;
        offset += run.text.length;
        const key = `${run.strong ? 's' : 'p'}:${start}:${run.text}`;
        return run.strong ? (
          <Text key={key} style={styles.runStrong}>
            {run.text}
          </Text>
        ) : (
          <Text key={key}>{run.text}</Text>
        );
      })}
    </Text>
  );
}

function PdfTable({ table, styles }: { table: AgreementTable; styles: DocumentStyles }) {
  const strongColumns = new Set(table.strongColumns ?? []);

  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {table.headers.map((header) => (
          <Text key={header} style={styles.th}>
            {header}
          </Text>
        ))}
      </View>
      {table.rows.map((row) => (
        <View key={row.join('|')} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <Text
              key={`${table.headers[cellIndex]}-${cell}`}
              style={strongColumns.has(cellIndex) ? styles.tdStrong : styles.td}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function PdfSignatures({
  language,
  styles,
}: {
  language: ContractLanguage;
  styles: DocumentStyles;
}) {
  const labels = agreementLabels(language);

  return (
    <View style={styles.signatures}>
      <View style={styles.signatureRow}>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>{labels.firstParty}</Text>
          <Text style={styles.signatureLine}>{labels.signature}</Text>
          <Text style={styles.signatureCaption}>{labels.firstPartyCaption}</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>{labels.secondParty}</Text>
          <Text style={styles.signatureLine}>{labels.signature}</Text>
          <Text style={styles.signatureCaption}>{labels.secondPartyCaption}</Text>
        </View>
      </View>
      <Text style={styles.witnessLabel}>{labels.witnesses}</Text>
      <Text style={styles.witnessLine}>1.</Text>
      <Text style={styles.witnessLine}>2.</Text>
    </View>
  );
}

function renderBlock(
  block: AgreementBlock,
  language: ContractLanguage,
  styles: DocumentStyles,
  index: number,
) {
  switch (block.type) {
    case 'title':
      return (
        <Text key={index} style={styles.title}>
          {block.text}
        </Text>
      );
    case 'subtitle':
      return (
        <Text key={index} style={styles.subtitle}>
          {block.text}
        </Text>
      );
    case 'centered':
      return (
        <Text key={index} style={styles.centered}>
          {block.text}
        </Text>
      );
    case 'sectionHeading':
      return (
        <Text key={index} style={styles.sectionHeading}>
          {block.text}
        </Text>
      );
    case 'clauseHeading':
      return (
        <Text key={index} style={styles.clauseHeading}>
          {block.text}
        </Text>
      );
    case 'paragraph':
      return <PdfRuns key={index} runs={block.runs} styles={styles} />;
    case 'table':
      return <PdfTable key={index} table={block.table} styles={styles} />;
    case 'signatures':
      return <PdfSignatures key={index} language={language} styles={styles} />;
    default:
      return null;
  }
}

type FarmerContractDocumentProps = {
  context: AgreementContext;
  language?: ContractLanguage;
};

export function FarmerContractDocument({
  context,
  language = 'english',
}: FarmerContractDocumentProps) {
  if (language === 'hindi') registerDevanagariPdfFont();

  const styles = language === 'hindi' ? hindiStyles : englishStyles;
  const blocks = buildPotatoMultiplicationAgreementForLang(context, language);
  const title =
    language === 'hindi'
      ? `${blocks.find((block) => block.type === 'title')?.text ?? context.contractTitle} — ${context.farmerName} — ${context.varietyDisplay}`
      : `${context.contractTitle} — ${context.farmerName} — ${context.varietyDisplay}`;

  return (
    <Document
      title={title}
      author={context.companyName}
      subject={`Potato multiplication agreement for ${context.farmerName} (${context.varietyDisplay})`}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Image src={COMPANY_LOGO_URL} style={styles.logo} />
          <Text style={styles.year}>{context.agreementYear}</Text>
        </View>

        {blocks.map((block, index) => renderBlock(block, language, styles, index))}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
