import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { AgreementContext } from '@/features/farmers/lib/farmer-contract';
import {
  type AgreementBlock,
  type AgreementRun,
  type AgreementTable,
  buildPotatoMultiplicationAgreement,
} from '@/features/farmers/lib/potato-multiplication-agreement';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  brand: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    marginBottom: 2,
    textAlign: 'center',
  },
  meta: {
    fontSize: 8,
    color: '#525252',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#166534',
    textAlign: 'center',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#166534',
    marginBottom: 12,
  },
  centered: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  sectionHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  clauseHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
  },
  runStrong: {
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
    marginBottom: 28,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#a3a3a3',
    paddingTop: 4,
    fontSize: 8,
    color: '#525252',
  },
  witnessLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
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
  muted: {
    fontSize: 8,
    marginTop: 4,
    color: '#525252',
  },
  farmerName: {
    fontSize: 8,
    marginTop: 4,
  },
});

function PdfRuns({ runs }: { runs: AgreementRun[] }) {
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

function PdfTable({ table }: { table: AgreementTable }) {
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

function PdfSignatures({ context }: { context: AgreementContext }) {
  return (
    <View style={styles.signatures}>
      <View style={styles.signatureRow}>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>First Party</Text>
          <Text style={styles.signatureLine}>Signature</Text>
          <Text style={styles.muted}>{context.companyName}</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Second Party</Text>
          <Text style={styles.signatureLine}>Signature</Text>
          <Text style={styles.farmerName}>{context.farmerName}</Text>
          <Text style={styles.muted}>Mob. No.: {context.mobileNumber}</Text>
        </View>
      </View>
      <Text style={styles.witnessLabel}>Witnesses:</Text>
      <Text style={styles.witnessLine}>1.</Text>
      <Text style={styles.witnessLine}>2.</Text>
    </View>
  );
}

function renderBlock(block: AgreementBlock, context: AgreementContext, index: number) {
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
      return <PdfRuns key={index} runs={block.runs} />;
    case 'table':
      return <PdfTable key={index} table={block.table} />;
    case 'signatures':
      return <PdfSignatures key={index} context={context} />;
    default:
      return null;
  }
}

type FarmerContractDocumentProps = {
  context: AgreementContext;
};

export function FarmerContractDocument({ context }: FarmerContractDocumentProps) {
  const blocks = buildPotatoMultiplicationAgreement(context);

  return (
    <Document
      title={`${context.contractTitle} — ${context.farmerName} — ${context.varietyDisplay}`}
      author={context.companyName}
      subject={`Potato multiplication agreement for ${context.farmerName} (${context.varietyDisplay})`}
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.brand}>{context.companyName}</Text>
        <Text style={styles.meta}>Generated on {context.generatedAtLabel}</Text>

        {blocks.map((block, index) => renderBlock(block, context, index))}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${context.companyName} · ${context.contractTitle} · ${context.varietyDisplay} · Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
