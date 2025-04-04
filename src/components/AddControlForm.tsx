"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ControlStatus, Technician, Control } from '@/lib/types';

interface AddControlFormProps {
  technicians: Technician[];
  currentOrderCount: number; // To determine the order of the new control
  onAddControl: (newControlData: Omit<Control, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function AddControlForm({ 
    technicians, 
    currentOrderCount, 
    onAddControl, 
    onCancel 
}: AddControlFormProps) {
  const [dcfId, setDcfId] = useState('');
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState<ControlStatus>(ControlStatus.InProgress);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<string>(''); // Store as string YYYY-MM-DD
  const [externalUrl, setExternalUrl] = useState<string>(''); // Add state for external URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dcfId.trim() || !title.trim()) {
      setError("DCF ID and Title are required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Validate date before creating a Timestamp
    let dateTimestamp = null;
    if (estimatedCompletionDate) {
      try {
        const dateObj = new Date(estimatedCompletionDate);
        if (isNaN(dateObj.getTime())) {
          setError("Invalid date format. Please use YYYY-MM-DD.");
          setIsSubmitting(false);
          return;
        }
        dateTimestamp = Timestamp.fromDate(dateObj);
      } catch (error) {
        console.error("Date conversion error:", error);
        setError("Failed to process date. Please use YYYY-MM-DD format.");
        setIsSubmitting(false);
        return;
      }
    }

    // Process external URL if provided
    let processedUrl = null;
    if (externalUrl.trim()) {
      let url = externalUrl.trim();
      // Add https:// if no protocol specified
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      processedUrl = url;
    }

    const newControlData: Omit<Control, 'id'> = {
      dcfId: dcfId.trim(),
      title: title.trim(),
      explanation: explanation.trim(),
      status,
      assigneeId: assigneeId || null,
      estimatedCompletionDate: dateTimestamp,
      order: currentOrderCount, // Set order based on current count
      priorityLevel: null,
      tags: [],
      progress: 0,
      lastUpdated: Timestamp.now(),
      externalUrl: processedUrl // Add the external URL
    };

    try {
      await onAddControl(newControlData);
      // Clear form or handle success state (e.g., close modal/form)
      // The parent component (ControlList) will handle adding to the list state
      // and closing the form via onCancel or similar logic.
    } catch (err: any) {
      console.error("Failed to add control:", err);
      setError(err.message || "Failed to save the new control.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <h3 id="modal-title" className="text-xl font-semibold text-gray-900 mb-2">Add New Control</h3>
      
      {/* Row 1: DCF ID & Title */} 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dcfId" className="block text-sm font-medium text-gray-700 mb-1">DCF Identifier <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="dcfId"
            value={dcfId}
            onChange={(e) => setDcfId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-2 py-1 bg-white"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Control Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-2 py-1 bg-white"
            required
          />
        </div>
      </div>

      {/* Row 2: Explanation */} 
      <div>
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
          <textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
          />
      </div>
      
      {/* Row 3: External URL */}
      <div>
        <label htmlFor="external-url" className="block text-sm font-medium text-gray-700 mb-1">External URL</label>
        <div className="flex">
          <input
            type="url"
            id="external-url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://tickets.example.com/ticket/123"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-2 py-1 bg-white"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Link to external ticketing system (optional)</p>
      </div>

      {/* Row 4: Status, Assignee, Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
         <div>
          <label htmlFor="add-status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            id="add-status"
            value={status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as ControlStatus)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-2 py-1 bg-white"
          >
            {Object.values(ControlStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
         <div>
          <label htmlFor="add-assignee" className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
          <select
            id="add-assignee"
            value={assigneeId || ""} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setAssigneeId(e.target.value || null)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-2 py-1 bg-white"
          >
            <option value="">-- Unassigned --</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="add-date" className="block text-xs font-medium text-gray-500 mb-1">Est. Completion</label>
          <input
            type="date"
            id="add-date"
            value={estimatedCompletionDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEstimatedCompletionDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-2 py-1 bg-white"
          />
        </div>
      </div>

      {error && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-red-600 text-xs">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
              Cancel
          </button>
           <button 
            type="submit" 
            disabled={isSubmitting || !dcfId.trim() || !title.trim()}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isSubmitting ? (
               <>
                 <svg className="w-4 h-4 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Adding...
               </>
             ) : 'Add Control'}
          </button>
      </div>
    </form>
  );
} 