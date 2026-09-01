import type { AgreementContext } from '@/features/farmers/lib/farmer-contract';
import {
  type AgreementBlock,
  type AgreementRun,
  type AgreementTable,
  buildPotatoMultiplicationAgreement,
} from '@/features/farmers/lib/potato-multiplication-agreement';
import { cn } from '@/lib/utils';

type FarmerContractPreviewProps = {
  context: AgreementContext;
};

function AgreementRuns({ runs }: { runs: AgreementRun[] }) {
  let offset = 0;
  return (
    <>
      {runs.map((run) => {
        const start = offset;
        offset += run.text.length;
        const key = `${run.strong ? 's' : 'p'}:${start}:${run.text}`;
        return run.strong ? (
          <strong key={key} className="font-semibold">
            {run.text}
          </strong>
        ) : (
          <span key={key}>{run.text}</span>
        );
      })}
    </>
  );
}

function AgreementTableView({ table }: { table: AgreementTable }) {
  const strongColumns = new Set(table.strongColumns ?? []);

  return (
    <div className="my-3 overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-emerald-50 text-left dark:bg-emerald-950/40">
            {table.headers.map((header) => (
              <th
                key={header}
                className="px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join('|')} className="border-t">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${table.headers[cellIndex]}-${cell}`}
                  className={cn('px-3 py-2', strongColumns.has(cellIndex) && 'font-semibold')}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignaturesBlock({ context }: { context: AgreementContext }) {
  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm font-semibold">First Party</p>
          <div className="border-t border-muted-foreground/40 pt-2">
            <p className="text-xs text-muted-foreground">Signature</p>
          </div>
          <p className="text-xs text-muted-foreground">{context.companyName}</p>
        </div>
        <div className="space-y-6">
          <p className="text-sm font-semibold">Second Party</p>
          <div className="border-t border-muted-foreground/40 pt-2">
            <p className="text-xs text-muted-foreground">Signature</p>
          </div>
          <p className="text-sm">{context.farmerName}</p>
          <p className="text-xs text-muted-foreground">Mob. No.: {context.mobileNumber}</p>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-sm font-semibold">Witnesses:</p>
        <div className="border-t border-muted-foreground/40 pt-2">
          <p className="text-xs text-muted-foreground">1.</p>
        </div>
        <div className="border-t border-muted-foreground/40 pt-2">
          <p className="text-xs text-muted-foreground">2.</p>
        </div>
      </div>
    </div>
  );
}

function renderBlock(block: AgreementBlock, context: AgreementContext, index: number) {
  switch (block.type) {
    case 'title':
      return (
        <h2
          key={index}
          className="scroll-m-20 text-center text-xl font-semibold tracking-tight uppercase"
        >
          {block.text}
        </h2>
      );
    case 'subtitle':
      return (
        <p key={index} className="mt-2 text-center text-sm font-semibold text-emerald-800 dark:text-emerald-400">
          {block.text}
        </p>
      );
    case 'centered':
      return (
        <p key={index} className="my-3 text-center text-sm font-semibold">
          {block.text}
        </p>
      );
    case 'sectionHeading':
      return (
        <h3
          key={index}
          className="mt-6 mb-3 scroll-m-20 text-sm font-semibold tracking-tight uppercase"
        >
          {block.text}
        </h3>
      );
    case 'clauseHeading':
      return (
        <h3
          key={index}
          className="mt-6 mb-2 scroll-m-20 text-sm font-semibold tracking-tight text-emerald-800 dark:text-emerald-400"
        >
          {block.text}
        </h3>
      );
    case 'paragraph':
      return (
        <p key={index} className="mt-2 text-sm leading-relaxed text-pretty">
          <AgreementRuns runs={block.runs} />
        </p>
      );
    case 'table':
      return <AgreementTableView key={index} table={block.table} />;
    case 'signatures':
      return <SignaturesBlock key={index} context={context} />;
    default:
      return null;
  }
}

export function FarmerContractPreview({ context }: FarmerContractPreviewProps) {
  const blocks = buildPotatoMultiplicationAgreement(context);

  return (
    <article className="mx-auto w-full max-w-3xl rounded-2xl border bg-background shadow-sm">
      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <header className="border-b-2 border-emerald-800 pb-4 text-center dark:border-emerald-600">
          <p className="text-lg font-semibold tracking-tight text-emerald-800 dark:text-emerald-400">
            {context.companyName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generated on {context.generatedAtLabel}
          </p>
        </header>

        <div className="mt-6">
          {blocks.map((block, index) => renderBlock(block, context, index))}
        </div>

        <footer className="mt-10 border-t pt-4 text-center text-[11px] text-muted-foreground">
          {context.companyName} · {context.contractTitle} · {context.varietyDisplay}
        </footer>
      </div>
    </article>
  );
}
