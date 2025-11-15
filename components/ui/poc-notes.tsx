import { Info } from 'lucide-react';

interface POCNotesProps {
  children: React.ReactNode;
}

export function POCNotes({ children }: POCNotesProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mt-3 max-w-3xl">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">
            POC Demo Notes
          </h3>
          <div className="text-sm text-slate-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
