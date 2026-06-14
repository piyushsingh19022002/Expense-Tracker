import React, { useState, useEffect } from 'react';
import { getGroups, getGroupDetails } from '../services/groupService.js';
import {
  getGroupExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpense
} from '../services/expenseService.js';
import ExpenseList from '../components/expenses/ExpenseList.jsx';
import ExpenseDetails from '../components/expenses/ExpenseDetails.jsx';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import DeleteExpenseModal from '../components/expenses/DeleteExpenseModal.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { ChevronLeft, FolderKey, AlertCircle, Receipt, ArrowLeft } from 'lucide-react';

/**
 * @description Parent Page container for Expense Management.
 * Manages active group selectors, lists, detail views, and forms.
 */
const ExpensesPage = () => {
  // Global structures
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [groupDetails, setGroupDetails] = useState(null);
  
  // Expenses and Selection states
  const [expenses, setExpenses] = useState([]);
  const [activeExpenseId, setActiveExpenseId] = useState(null);
  
  // View states: null | 'create' | 'edit'
  const [formMode, setFormMode] = useState(null);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState(null);

  // Loading and Error boundaries
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // 1. Fetch user groups list on mount
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      setError('');
      try {
        const response = await getGroups();
        if (response?.success && response.data) {
          setGroups(response.data);
          // Auto-select first group if available
          if (response.data.length > 0) {
            setActiveGroupId(response.data[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load group selectors.');
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // 2. Fetch expenses and group details whenever group selection changes
  const fetchGroupData = async (groupId) => {
    if (!groupId) {
      setExpenses([]);
      setGroupDetails(null);
      return;
    }

    setLoadingExpenses(true);
    setError('');
    setFormMode(null);
    setActiveExpenseId(null);
    try {
      // Parallel fetch of group expenses and member rosters
      const [expensesResponse, detailsResponse] = await Promise.all([
        getGroupExpenses(groupId),
        getGroupDetails(groupId)
      ]);

      if (expensesResponse?.success) {
        setExpenses(expensesResponse.data);
      }
      if (detailsResponse?.success) {
        setGroupDetails(detailsResponse.data);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading group ledger.');
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    fetchGroupData(activeGroupId);
  }, [activeGroupId]);

  // Map active memberships user list for use in selection dropdowns
  const groupMembers = groupDetails
    ? groupDetails.memberships.filter((m) => m.status === 'ACTIVE').map((m) => m.user)
    : [];

  // Submit Handler for Form (Creates or Updates depending on formMode)
  const handleFormSubmit = async (payload) => {
    setFormSubmitLoading(true);
    setFormError('');
    try {
      if (formMode === 'create') {
        const response = await createExpense(activeGroupId, payload);
        if (response?.success) {
          setFormMode(null);
          // Refresh list and select the new expense
          await fetchGroupData(activeGroupId);
          if (response.data) {
            setActiveExpenseId(response.data.id);
          }
        } else {
          setFormError(response?.message || 'Failed to create expense.');
        }
      } else if (formMode === 'edit') {
        const response = await updateExpense(activeExpenseId, payload);
        if (response?.success) {
          setFormMode(null);
          setSelectedExpenseForEdit(null);
          await fetchGroupData(activeGroupId);
          // Reselect active expense details to load updated payload
          const updatedId = activeExpenseId;
          setActiveExpenseId(null);
          setTimeout(() => setActiveExpenseId(updatedId), 50);
        } else {
          setFormError(response?.message || 'Failed to update expense.');
        }
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Triggers edit form mode: fetches full details first
  const handleEditTrigger = async () => {
    setFormError('');
    setFormSubmitLoading(true);
    try {
      const response = await getExpense(activeExpenseId);
      if (response?.success && response.data) {
        setSelectedExpenseForEdit(response.data);
        setFormMode('edit');
      } else {
        setFormError('Failed to fetch current expense details for editing.');
      }
    } catch (err) {
      setFormError('An error occurred while loading edit data.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Confirms and deletes selected expense
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteExpense(activeExpenseId);
      if (response?.success) {
        setIsDeleteOpen(false);
        setActiveExpenseId(null);
        await fetchGroupData(activeGroupId);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-surface border border-slate-800/40 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white tracking-tight">Expenses Ledger</h2>
            <p className="text-[10px] text-brand-text-secondary">Split and settle group outgoings</p>
          </div>

          {/* Group dropdown selector */}
          <div className="flex items-center gap-2 border-l border-slate-800/60 pl-4">
            <select
              value={activeGroupId}
              onChange={(e) => setActiveGroupId(e.target.value)}
              disabled={loadingGroups}
              className="rounded-lg bg-slate-900 border border-slate-800/80 px-3 py-1.5 text-xs text-brand-text-primary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all cursor-pointer"
            >
              <option value="" disabled>Select Group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content layouts */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-white">Error loading ledger</h5>
            <p className="text-[10px] text-brand-text-secondary max-w-[200px] leading-normal">{error}</p>
          </div>
        </div>
      ) : !activeGroupId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/5 border border-brand-accent/15 text-brand-accent mb-5 animate-pulse">
            <FolderKey size={24} className="stroke-[1.5]" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Select an Expense Group</h4>
          <p className="text-[11px] text-brand-text-secondary max-w-[260px] leading-relaxed">
            Please choose or create an expense group using the selector dropdown to manage and audit outgoings.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
          
          {/* Master Panel: Expense List (Hidden on mobile when editing/viewing details) */}
          <div
            className={`w-full md:w-80 h-full shrink-0 flex flex-col ${
              activeExpenseId || formMode ? 'hidden md:flex' : 'flex'
            }`}
          >
            <ExpenseList
              expenses={expenses}
              activeExpenseId={activeExpenseId}
              onSelectExpense={(id) => {
                setFormMode(null);
                setActiveExpenseId(id);
              }}
              onAddExpenseClick={() => {
                setActiveExpenseId(null);
                setSelectedExpenseForEdit(null);
                setFormMode('create');
              }}
              loading={loadingExpenses}
            />
          </div>

          {/* Details & Form Panel (Hidden on mobile when in list view) */}
          <div
            className={`flex-1 h-full flex flex-col ${
              activeExpenseId || formMode ? 'flex' : 'hidden md:flex'
            }`}
          >
            
            {/* Mobile Navigation Header */}
            {(activeExpenseId || formMode) && (
              <button
                onClick={() => {
                  setActiveExpenseId(null);
                  setFormMode(null);
                }}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] font-bold text-brand-text-secondary hover:text-white transition-all mb-3 cursor-pointer self-start"
              >
                <ChevronLeft size={12} className="stroke-[2.5]" />
                <span>Back to List</span>
              </button>
            )}

            {formMode ? (
              // Create / Edit Expense Form View
              <div className="flex flex-col h-full bg-brand-surface border border-slate-800/40 rounded-xl overflow-hidden p-5">
                <div className="mb-5 flex items-center gap-3">
                  <button
                    onClick={() => setFormMode(null)}
                    className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-brand-text-secondary hover:text-white cursor-pointer transition-all"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {formMode === 'create' ? 'Log Expense' : 'Edit Expense'}
                    </h3>
                    <p className="text-[10px] text-brand-text-secondary">
                      {formMode === 'create' ? 'Record a transaction split' : 'Modify expense splits'}
                    </p>
                  </div>
                </div>

                {formError && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3.5 text-xs text-brand-danger animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto pr-1">
                  <ExpenseForm
                    groupMembers={groupMembers}
                    defaultValues={formMode === 'edit' ? selectedExpenseForEdit : null}
                    onSubmit={handleFormSubmit}
                    loading={formSubmitLoading}
                    onCancel={() => setFormMode(null)}
                  />
                </div>
              </div>
            ) : (
              // Detailed Split Readout View
              <ExpenseDetails
                expenseId={activeExpenseId}
                onEditClick={handleEditTrigger}
                onDeleteClick={() => setIsDeleteOpen(true)}
              />
            )}
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      <DeleteExpenseModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ExpensesPage;
