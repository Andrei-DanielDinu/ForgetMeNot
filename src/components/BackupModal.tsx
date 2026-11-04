import React, { useRef } from 'react';
import { Topic } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { X, Download, Upload, RefreshCw, AlertTriangle, Database } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  onImport: (importedTopics: Topic[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  topics,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupJSON(topics);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importBackupJSON(file);
      onImport(imported);
      alert(`Successfully restored ${imported.length} topics!`);
      onClose();
    } catch (err: any) {
      alert(`Import failed: ${err.message || 'Invalid file format'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        role="dialog"
        aria-labelledby="backup-title"
        aria-modal="true"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h2 id="backup-title" className="text-base font-bold text-white">
              Data & Backup
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-300">
            All your topics, custom sequences, milestones, and recap notes are stored locally on your device.
          </p>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download Backup File (.json)</span>
          </button>

          {/* Import button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Restore from Backup (.json)</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
