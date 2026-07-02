import { Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  blogTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ blogTitle, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>

        {/* Content */}
        <h3 className="text-slate-800 mb-2" style={{ fontSize: '17px', fontWeight: 600 }}>
          Delete Blog?
        </h3>
        <p className="text-slate-500" style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {blogTitle ? (
            <>
              Are you sure you want to delete{' '}
              <span className="text-slate-700 font-medium">"{blogTitle}"</span>? This action cannot
              be undone.
            </>
          ) : (
            'Are you sure you want to delete this blog? This action cannot be undone.'
          )}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
