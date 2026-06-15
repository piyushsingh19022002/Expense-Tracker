import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, AlertOctagon, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getImportReport } from '../services/reportService.js';
import ReportSummary from '../components/report/ReportSummary.jsx';
import ActionsTakenTable from '../components/report/ActionsTakenTable.jsx';
import ImportedRowsTable from '../components/report/ImportedRowsTable.jsx';
import FailedRowsTable from '../components/report/FailedRowsTable.jsx';
import AnomalyReportTable from '../components/report/AnomalyReportTable.jsx';
import SearchBar from '../components/report/SearchBar.jsx';
import ExportButtons from '../components/report/ExportButtons.jsx';
import Button from '../components/common/Button.jsx';

const ImportReportPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  // Primary data states
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active view & search states
  const [activeTab, setActiveTab] = useState('IMPORTED'); // 'IMPORTED' | 'FAILED' | 'ANOMALIES'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getImportReport(batchId);
      if (res?.success && res.data) {
        setReport(res.data);
      } else {
        setError(res?.message || 'Failed to retrieve import report.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while loading import report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchReport();
    }
  }, [batchId]);

  // Client-side search filters
  const filteredData = useMemo(() => {
    if (!report) return { imported: [], failed: [], anomalies: [] };

    const query = searchQuery.trim().toLowerCase();

    // Helper: matches row data fields against query string
    const matchRowData = (data, q) => {
      if (!data) return false;
      const desc = String(data.Description || data.description || '').toLowerCase();
      const paidBy = String(data['Paid By'] || data['paid_by'] || data['payer'] || '').toLowerCase();
      const split = String(data['Split Between'] || data['split_between'] || '').toLowerCase();
      return desc.includes(q) || paidBy.includes(q) || split.includes(q);
    };

    // 1. Filter Imported Rows
    const imported = report.importedRows.filter((row) => {
      if (!query) return true;
      const rowNumMatch = String(row.rowNumber).includes(query);
      const dataMatch = matchRowData(row.data, query);
      return rowNumMatch || dataMatch;
    });

    // 2. Filter Failed Rows
    const failed = report.failedRows.filter((row) => {
      if (!query) return true;
      const rowNumMatch = String(row.rowNumber).includes(query);
      const dataMatch = matchRowData(row.data, query);
      
      // Also match against row anomaly descriptions or types
      const anomalyMatch = (row.anomalies || []).some(
        (a) =>
          String(a.type).toLowerCase().includes(query) ||
          String(a.description).toLowerCase().includes(query)
      );

      return rowNumMatch || dataMatch || anomalyMatch;
    });

    // 3. Filter Anomalies Roster
    const anomalies = report.anomalies.filter((a) => {
      if (!query) return true;
      const rowNumMatch = String(a.rowNumber).includes(query);
      const typeMatch = String(a.type).toLowerCase().includes(query);
      const descMatch = String(a.description).toLowerCase().includes(query);
      const suggestMatch = String(a.suggestedAction).toLowerCase().includes(query);
      return rowNumMatch || typeMatch || descMatch || suggestMatch;
    });

    return { imported, failed, anomalies };
  }, [report, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-brand-accent stroke-[2.5]" size={32} />
        <p className="text-xs text-brand-text-secondary">Generating import report summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger">
          <AlertOctagon size={20} />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-white">Error loading report</h5>
          <p className="text-[10px] text-brand-text-secondary max-w-[280px] leading-normal">{error}</p>
        </div>
        <Button onClick={() => navigate('/imports')} variant="outline" className="gap-1">
          <ChevronLeft size={12} className="stroke-[2.5]" />
          Back to Imports
        </Button>
      </div>
    );
  }

  const { imported: filteredImported, failed: filteredFailed, anomalies: filteredAnomalies } = filteredData;

  const tabItems = [
    { id: 'IMPORTED', label: 'Imported Rows', count: report?.importedRows?.length || 0, icon: CheckCircle2, activeColor: 'border-brand-success text-brand-success bg-brand-success/5' },
    { id: 'FAILED', label: 'Failed/Rejected', count: report?.failedRows?.length || 0, icon: AlertOctagon, activeColor: 'border-brand-danger text-brand-danger bg-brand-danger/5' },
    { id: 'ANOMALIES', label: 'Anomaly Roster', count: report?.anomalies?.length || 0, icon: ShieldAlert, activeColor: 'border-yellow-500 text-yellow-500 bg-yellow-500/5' }
  ];

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-5">
      
      {/* Header bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800/40 bg-brand-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/imports')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-800 text-brand-text-secondary hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <FileText size={16} className="text-brand-accent" />
              CSV Import Report
            </h1>
            <p className="text-[10px] text-brand-text-secondary mt-1">
              Final summary of CSV processing actions & audits.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate(`/imports/${batchId}/anomalies`)} variant="outline">
            Review Workbench
          </Button>
        </div>
      </div>

      {/* Report Metadata Summary */}
      <ReportSummary summary={report?.summary} />

      {/* Aggregated Actions Taken Counts */}
      <ActionsTakenTable actions={report?.actionsTaken} />

      {/* Filters and Search Bar Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800/40 bg-brand-surface p-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <ExportButtons report={report} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/50">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery(''); // Reset search on tab change
              }}
              className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? tab.activeColor
                  : 'border-transparent text-brand-text-secondary hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                isActive ? 'bg-slate-800 text-white' : 'bg-slate-900 text-brand-text-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Work Area */}
      <div className="min-h-0 flex-1">
        {activeTab === 'IMPORTED' && (
          <ImportedRowsTable rows={filteredImported} />
        )}
        {activeTab === 'FAILED' && (
          <FailedRowsTable rows={filteredFailed} />
        )}
        {activeTab === 'ANOMALIES' && (
          <AnomalyReportTable anomalies={filteredAnomalies} />
        )}
      </div>

    </div>
  );
};

export default ImportReportPage;
