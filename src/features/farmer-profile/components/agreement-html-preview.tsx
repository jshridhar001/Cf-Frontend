import type { AgreementContext } from '@/features/farmers/lib/farmer-contract';
import {
  type AgreementBlock,
  type AgreementRun,
  buildPotatoMultiplicationAgreement,
} from '@/features/farmers/lib/potato-multiplication-agreement';

function blockKey(block: AgreementBlock): string {
  if (block.type === 'paragraph') return `p:${block.runs.map((run) => run.text).join('')}`;
  if (block.type === 'table')
    return `t:${block.table.headers.join('|')}:${block.table.rows[0]?.join('|') ?? ''}`;
  if (block.type === 'signatures') return 'signatures';
  return `${block.type}:${block.text}`;
}

function Runs({ runs }: { runs: AgreementRun[] }) {
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

function BlockView({ block, context }: { block: AgreementBlock; context: AgreementContext }) {
  switch (block.type) {
    case 'title':
      return (
        <h4 className="scroll-m-20 text-center text-base font-semibold tracking-tight uppercase">
          {block.text}
        </h4>
      );
    case 'subtitle':
      return <p className="text-center text-sm font-semibold text-green-800">{block.text}</p>;
    case 'centered':
      return <p className="py-2 text-center text-sm font-semibold">{block.text}</p>;
    case 'sectionHeading':
      return (
        <h4 className="mt-4 scroll-m-20 text-sm font-semibold tracking-tight uppercase">
          {block.text}
        </h4>
      );
    case 'clauseHeading':
      return (
        <h4 className="mt-3 scroll-m-20 text-sm font-semibold tracking-tight text-green-800">
          {block.text}
        </h4>
      );
    case 'paragraph':
      return (
        <p className="text-justify text-sm leading-6">
          <Runs runs={block.runs} />
        </p>
      );
    case 'table': {
      const strongColumns = new Set(block.table.strongColumns ?? []);
      return (
        <div className="my-3 w-full overflow-x-auto">
          <table className="w-full border border-neutral-300 text-sm">
            <thead>
              <tr className="bg-green-50">
                {block.table.headers.map((header) => (
                  <th
                    key={header}
                    className="border border-neutral-300 px-2 py-1.5 text-left font-semibold text-green-800"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${block.table.headers[cellIndex]}-${cell}`}
                      className={`border border-neutral-300 px-2 py-1.5 ${
                        strongColumns.has(cellIndex) ? 'font-semibold' : ''
                      }`}
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
    case 'signatures':
      return (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="sm:w-[45%]">
              <p className="mb-10 text-sm font-semibold">First Party</p>
              <p className="border-t border-neutral-400 pt-1 text-xs text-neutral-600">Signature</p>
              <p className="mt-1 text-xs text-neutral-600">{context.companyName}</p>
            </div>
            <div className="sm:w-[45%]">
              <p className="mb-10 text-sm font-semibold">Second Party</p>
              <p className="border-t border-neutral-400 pt-1 text-xs text-neutral-600">Signature</p>
              <p className="mt-1 text-sm">{context.farmerName}</p>
              <p className="mt-0.5 text-xs text-neutral-600">Mob. No.: {context.mobileNumber}</p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Witnesses:</p>
            <p className="mt-6 border-t border-neutral-400 pt-1 text-xs text-neutral-600">1.</p>
            <p className="mt-6 border-t border-neutral-400 pt-1 text-xs text-neutral-600">2.</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function AgreementHtmlPreview({ context }: { context: AgreementContext }) {
  const blocks = buildPotatoMultiplicationAgreement(context);

  return (
    <article className="bg-white px-4 py-6 text-neutral-900 sm:px-8 sm:py-8">
      <p className="text-center text-sm font-semibold text-green-800">{context.companyName}</p>
      <p className="mb-4 border-b-2 border-green-800 pb-2 text-center text-xs text-neutral-600">
        Generated on {context.generatedAtLabel}
      </p>
      <div className="flex flex-col gap-2">
        {blocks.map((block) => (
          <BlockView key={blockKey(block)} block={block} context={context} />
        ))}
      </div>
    </article>
  );
}
