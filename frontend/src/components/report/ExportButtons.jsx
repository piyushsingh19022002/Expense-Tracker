import React from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

const ExportButtons = ({ report }) => {
  if (!report) return null;

  // Helper to trigger file download in browser
  const triggerDownload = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. JSON Export
  const handleExportJson = () => {
    const content = JSON.stringify(report, null, 2);
    const filename = `import_report_${report.summary.importBatchId}.json`;
    triggerDownload(content, filename, 'application/json');
  };

  // 2. CSV Export
  const handleExportCsv = () => {
    const csvRows = [];
    
    // Header section
    csvRows.push('--- IMPORT SUMMARY ---');
    csvRows.push(`Batch ID,${report.summary.importBatchId}`);
    csvRows.push(`File Name,${report.summary.fileName}`);
    csvRows.push(`Upload Date,${report.summary.uploadDate}`);
    csvRows.push(`Total Rows,${report.summary.totalRows}`);
    csvRows.push(''); // Empty line spacing

    csvRows.push('--- TRANSACTION LEDGER DETAILS ---');
    // Ledger headers
    csvRows.push('Row Number,Status,Description,Date,Amount,Currency,Paid By,Split Participants,Anomalies Count');

    // Helper to format participant list
    const getParticipantsStr = (data) => {
      const splitBetween = data['Split Between'] || data['split_between'] || '';
      return String(splitBetween).replace(/,/g, ';');
    };

    // Helper to format anomaly summary
    const getAnomalyCount = (rowNum) => {
      return report.anomalies.filter((a) => a.rowNumber === rowNum).length;
    };

    // Helper to safely format cell content for CSV (wraps in quotes if comma exists)
    const formatCell = (val) => {
      if (val === undefined || val === null) return '';
      const str = String(val).trim();
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Map imported rows
    report.importedRows.forEach((row) => {
      const { data } = row;
      const desc = formatCell(data.Description || data.description);
      const date = formatCell(data.Date || data.date);
      const amt = formatCell(data.Amount || data.amount);
      const curr = formatCell(data.Currency || data.currency || 'USD');
      const paidBy = formatCell(data['Paid By'] || data['paid_by'] || data['payer']);
      const split = formatCell(getParticipantsStr(data));
      const anomCount = getAnomalyCount(row.rowNumber);

      csvRows.push(`${row.rowNumber},Imported,${desc},${date},${amt},${curr},${paidBy},${split},${anomCount}`);
    });

    // Map pending rows
    report.pendingRows.forEach((row) => {
      const { data } = row;
      const desc = formatCell(data.Description || data.description);
      const date = formatCell(data.Date || data.date);
      const amt = formatCell(data.Amount || data.amount);
      const curr = formatCell(data.Currency || data.currency || 'USD');
      const paidBy = formatCell(data['Paid By'] || data['paid_by'] || data['payer']);
      const split = formatCell(getParticipantsStr(data));
      const anomCount = getAnomalyCount(row.rowNumber);

      csvRows.push(`${row.rowNumber},Pending Review,${desc},${date},${amt},${curr},${paidBy},${split},${anomCount}`);
    });

    // Map failed rows
    report.failedRows.forEach((row) => {
      const { data } = row;
      const desc = formatCell(data.Description || data.description);
      const date = formatCell(data.Date || data.date);
      const amt = formatCell(data.Amount || data.amount);
      const curr = formatCell(data.Currency || data.currency || 'USD');
      const paidBy = formatCell(data['Paid By'] || data['paid_by'] || data['payer']);
      const split = formatCell(getParticipantsStr(data));
      const anomCount = getAnomalyCount(row.rowNumber);

      csvRows.push(`${row.rowNumber},Rejected,${desc},${date},${amt},${curr},${paidBy},${split},${anomCount}`);
    });

    // Spacing
    csvRows.push('');
    csvRows.push('--- DETECTED ANOMALIES LIST ---');
    csvRows.push('Row Number,Anomaly Type,Severity,Description,Suggested Action,Review Status');

    report.anomalies.forEach((a) => {
      csvRows.push(
        `${a.rowNumber},${a.type},${a.severity},${formatCell(a.description)},${formatCell(a.suggestedAction)},${a.status}`
      );
    });

    const csvContent = csvRows.join('\n');
    const filename = `import_report_${report.summary.importBatchId}.csv`;
    triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="flex gap-2">
      {/* Export CSV */}
      <button
        onClick={handleExportCsv}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-4 text-xs font-bold text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-sm"
      >
        <FileSpreadsheet size={13} className="text-green-500" />
        <span>Export CSV</span>
      </button>

      {/* Export JSON */}
      <button
        onClick={handleExportJson}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-4 text-xs font-bold text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-sm"
      >
        <FileJson size={13} className="text-brand-accent" />
        <span>Export JSON</span>
      </button>
    </div>
  );
};

export default ExportButtons;
