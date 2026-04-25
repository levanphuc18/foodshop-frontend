'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
