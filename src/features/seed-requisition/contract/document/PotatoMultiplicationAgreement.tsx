import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { BRAND_LEGAL_NAME, BRAND_LOGO_SRC } from '@/lib/brand';
import type { AgreementBlock, AgreementLanguage } from '../content/types';
import './fonts';
import { styles } from './styles';

type PotatoMultiplicationAgreementProps = {
  language: AgreementLanguage;
  blocks: AgreementBlock[];
};

export function PotatoMultiplicationAgreement({
  language,
  blocks,
}: PotatoMultiplicationAgreementProps) {
  const title = blocks.find((block) => block.kind === 'title');

  return (
    <Document
      title={title?.kind === 'title' ? title.text : 'Potato Multiplication Agreement'}
      author={BRAND_LEGAL_NAME}
      subject="Potato Multiplication Agreement"
      language={language === 'hi' ? 'hi-IN' : 'en-IN'}
    >
      <Page size="A4" style={language === 'hi' ? [styles.page, styles.pageHindi] : styles.page}>
        <View style={styles.header} fixed>
          <Image src={BRAND_LOGO_SRC} style={styles.logo} />
        </View>

        {blocks.map((block) => (
          <AgreementBlockView key={agreementBlockKey(block)} block={block} />
        ))}

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}

function agreementBlockKey(block: AgreementBlock): string {
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

function AgreementBlockView({ block }: { block: AgreementBlock }) {
  switch (block.kind) {
    case 'year':
      return <Text style={styles.year}>{block.text}</Text>;
    case 'title':
      return <Text style={styles.title}>{block.text}</Text>;
    case 'variety':
      return (
        <Text style={block.id === 'annexure' ? styles.varietyAnnexure : styles.variety}>
          {block.text}
        </Text>
      );
    case 'p':
      return <RichText text={block.text} bold={block.bold} align={block.align} />;
    case 'h2':
      return (
        <Text
          style={block.underline ? [styles.h2, styles.underline] : styles.h2}
          minPresenceAhead={32}
          break={block.breakBefore}
        >
          {block.text}
        </Text>
      );
    case 'h3':
      return (
        <Text style={styles.h3} minPresenceAhead={24}>
          {block.text}
        </Text>
      );
    case 'table':
      return <AgreementTableView headers={block.table.headers} rows={block.table.rows} />;
    case 'signatures':
      return (
        <View wrap={false}>
          <View style={styles.signatures}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureRole}>{block.firstParty}</Text>
              <View style={styles.signatureLine} />
              <Text>{block.sign}</Text>
              <Text>{block.firstPartyCaption}</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureRole}>{block.secondParty}</Text>
              <View style={styles.signatureLine} />
              <Text>{block.sign}</Text>
              <Text>{block.secondPartyCaption}</Text>
            </View>
          </View>
          <Text style={styles.witnesses}>{block.witnesses}</Text>
          <Text style={styles.witnessLine}>1.</Text>
          <Text style={styles.witnessLine}>2.</Text>
        </View>
      );
    default:
      return null;
  }
}

function RichText({
  text,
  bold = false,
  align,
}: {
  text: string;
  bold?: boolean;
  align?: 'center';
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);
  const seen = new Map<string, number>();

  return (
    <Text
      style={[styles.paragraph, bold ? styles.bold : {}, align === 'center' ? styles.center : {}]}
    >
      {parts.map((part) => {
        const marked = part.startsWith('**') && part.endsWith('**');
        const value = marked ? part.slice(2, -2) : part;
        const occurrence = (seen.get(value) ?? 0) + 1;
        seen.set(value, occurrence);
        return marked ? (
          <Text key={`${occurrence}-${value}`} style={styles.bold}>
            {value}
          </Text>
        ) : (
          value
        );
      })}
    </Text>
  );
}

function AgreementTableView({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const width = `${100 / headers.length}%`;

  return (
    <View style={styles.table}>
      <View style={styles.tableRow} wrap={false}>
        {headers.map((header) => (
          <Text key={header} style={[styles.tableCell, styles.tableHeader, { width }]}>
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View
          key={row.join('|')}
          style={
            rowIndex === rows.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow
          }
          wrap={false}
        >
          {row.map((cell, cellIndex) => (
            <Text key={headers[cellIndex]} style={[styles.tableCell, { width }]}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
