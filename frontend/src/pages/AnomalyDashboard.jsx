import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldAlert, CheckCircle2, AlertOctagon, RefreshCw, FileText } from 'lucide-react';
import { getAnomalies, getImportReport, approveAnomaly, rejectAnomaly, editAnomaly } from '../services/anomalyService.js';
import AnomalyFilters from '../components/anomalies/AnomalyFilters.jsx';
import AnomalyTable from '../components/anomalies/AnomalyTable.jsx';
import EditAnomalyModal from '../components/anomalies/EditAnomalyModal.jsx';
import ReviewHistoryDrawer from '../components/anomalies/ReviewHistoryDrawer.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

const AnomalyDashboard = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  // Primary data states
  const [anomalies, setAnomalies] = useState([]);
  const [report, setReport] = useState(null);
  
  // Loading & error boundaries
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [filters, setFilters] = useState({
    status: 'PENDING', // Default to showing pending items first
    severity: '',
    type: ''
  });

  // Modal / Drawer control states
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [anomaliesRes, reportRes] = await Promise.all([
        getAnomalies({ batchId }),
        getImportReport(batchId)
      ]);

      if (anomaliesRes?.success && reportRes?.success) {
        setAnomalies(anomaliesRes.data);
        setReport(reportRes.data);
      } else {
        setError('Failed to load anomaly data or import report.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while loading anomaly dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchDashboardData();
    }
  }, [batchId]);

  // Client-side filtering of anomalies for instant reactivity
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((anomaly) => {
      const statusMatch = !filters.status || anomaly.status === filters.status;
      const severityMatch = !filters.severity || anomaly.severity === filters.severity;
      const typeMatch = !filters.type || anomaly.anomalyType === filters.type;
      return statusMatch && severityMatch && typeMatch;
    });
  }, [anomalies, filters]);

  // Action: Approve
  const handleApprove = async (id) => {
    try {
      const res = await approveAnomaly(id);
      if (res?.success) {
        // Optimistically update anomaly state
        setAnomalies((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a))
        );
        // Refresh import report statistics
        const reportRes = await getImportReport(batchId);
        if (reportRes?.success) {
          setReport(reportRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to approve anomaly.');
    }
  };

  // Action: Reject
  const handleReject = async (id) => {
    try {
      const res = await rejectAnomaly(id);
      if (res?.success) {
        // Optimistically update anomaly state
        setAnomalies((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a))
        );
        // Refresh import report statistics
        const reportRes = await getImportReport(batchId);
        if (reportRes?.success) {
          setReport(reportRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to reject anomaly.');
    }
  };

  // Action: Save Corrected Row values
  const handleSaveCorrection = async (id, correctedPayload) => {
    try {
      const res = await editAnomaly(id, correctedPayload);
      if (res?.success && res.data) {
        // Update both anomaly properties (history & status) and refresh data
        setAnomalies((prev) =>
          prev.map((a) => (a.id === id ? res.data.anomaly : a))
        );
        // Refresh report stats and rows
        const reportRes = await getImportReport(batchId);
        if (reportRes?.success) {
          setReport(reportRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save correction.');
    }
  };

  const handleResetFilters = () => {
    setFilters({ status: 'PENDING', severity: '', type: '' });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-brand-accent stroke-[2.5]" size={32} />
        <p className="text-xs text-brand-text-secondary">Loading anomaly review workbench...</p>
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
          <h5 className="text-xs font-bold text-white">Error loading workspace</h5>
          <p className="text-[10px] text-brand-text-secondary max-w-[280px] leading-normal">{error}</p>
        </div>
        <Button onClick={() => navigate('/imports')} variant="outline" className="gap-1">
          <ChevronLeft size={12} className="stroke-[2.5]" />
          Back to Imports
        </Button>
      </div>
    );
  }

  const { imported = 0, rejected = 0, pendingReview = 0 } = report?.actionsTaken || {};

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
            <h1 className="text-sm font-bold tracking-tight text-white">
              Import Review Workbench
            </h1>
            <p className="text-[10px] text-brand-text-secondary leading-none mt-1">
              File: <span className="text-white font-semibold">{report?.summary?.fileName}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate(`/imports/${batchId}/report`)} variant="outline" className="gap-2">
            <FileText size={12} />
            View Report
          </Button>
          <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
            <RefreshCw size={12} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Row Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        {/* Metric 1: Imported (Approved / Clean) */}
        <div className="relative flex items-center justify-between gap-4 rounded-xl border border-brand-success/20 bg-brand-success/5 p-4 shadow-lg">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Imported Rows
            </p>
            <p className="text-xl font-black text-brand-success leading-none">{imported}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-success/15 text-brand-success border border-brand-success/10">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Metric 2: Pending Review */}
        <div className="relative flex items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 shadow-lg">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Pending Review
            </p>
            <p className="text-xl font-black text-yellow-500 leading-none">{pendingReview}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/15 text-yellow-500 border border-yellow-500/10">
            <ShieldAlert size={16} />
          </div>
        </div>

        {/* Metric 3: Rejected */}
        <div className="relative flex items-center justify-between gap-4 rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-4 shadow-lg">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Rejected Rows
            </p>
            <p className="text-xl font-black text-brand-danger leading-none">{rejected}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-danger/15 text-brand-danger border border-brand-danger/10">
            <AlertOctagon size={16} />
          </div>
        </div>

      </div>

      {/* Filters */}
      <AnomalyFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Anomalies Table */}
      <AnomalyTable
        anomalies={filteredAnomalies}
        onApprove={handleApprove}
        onReject={handleReject}
        onEditClick={(anomaly) => {
          setSelectedAnomaly(anomaly);
          setIsEditOpen(true);
        }}
        onHistoryClick={(anomaly) => {
          setSelectedAnomaly(anomaly);
          setIsHistoryOpen(true);
        }}
      />

      {/* Edit row correction modal */}
      <EditAnomalyModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedAnomaly(null);
        }}
        anomaly={selectedAnomaly}
        onSaveSuccess={handleSaveCorrection}
      />

      {/* Edit Audit History Drawer */}
      <ReviewHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setSelectedAnomaly(null);
        }}
        anomaly={selectedAnomaly}
      />

    </div>
  );
};

export default AnomalyDashboard;
