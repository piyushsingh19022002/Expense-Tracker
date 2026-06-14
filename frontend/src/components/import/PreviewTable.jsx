import { useMemo } from 'react';
import { TableProperties } from 'lucide-react';
import Card from '../common/Card.jsx';

const MAX_PREVIEW_ROWS = 25;

const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (String(value).trim() === '') {
    return 'EMPTY';
  }

  return String(value);
};

const PreviewTable = ({ rows = [] }) => {
  const columns = useMemo(() => {
    const columnSet = new Set();
    rows.forEach((row) => {
      Object.keys(row.data || {}).forEach((key) => columnSet.add(key));
    });
    return Array.from(columnSet);
  }, [rows]);

  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);

  return (
    <Card className="flex min-h-0 flex-1 flex-col p-0">
      <div className="flex flex-col gap-2 border-b border-slate-800/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-brand-accent">
            <TableProperties size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Parsed Rows Preview</h3>
            <p className="text-[11px] text-brand-text-secondary">
              Showing {previewRows.length} of {rows.length} parsed rows
            </p>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="max-w-sm text-xs leading-relaxed text-brand-text-secondary">
            Upload a CSV file to see the parsed rows here.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-brand-surface">
              <tr>
                <th className="border-b border-slate-800/80 px-4 py-3 text-[10px] font-bold uppercase text-brand-text-secondary">
                  Row
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-slate-800/80 px-4 py-3 text-[10px] font-bold uppercase text-brand-text-secondary"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.rowNumber} className="hover:bg-slate-900/45">
                  <td className="border-b border-slate-800/45 px-4 py-3 text-xs font-semibold text-brand-accent">
                    {row.rowNumber}
                  </td>
                  {columns.map((column) => (
                    <td
                      key={`${row.rowNumber}-${column}`}
                      className="max-w-72 border-b border-slate-800/45 px-4 py-3 text-xs text-brand-text-primary"
                    >
                      <span className="block truncate" title={formatCellValue(row.data?.[column])}>
                        {formatCellValue(row.data?.[column])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default PreviewTable;
