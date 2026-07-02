import { KeyRound, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { Website } from '../services/api';

interface WebsitesPageProps {
  websites: Website[];
  onRegenerateApiKey: (id: string) => Promise<void>;
}

export function WebsitesPage({ websites, onRegenerateApiKey }: WebsitesPageProps) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h2 className="text-slate-800" style={{ fontSize: '22px', fontWeight: 600 }}>
          Websites
        </h2>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: '14px' }}>
          Manage tenant websites and API keys.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Website', 'URL', 'API Key', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3.5 text-slate-500 whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {websites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400" style={{ fontSize: '14px' }}>
                    No websites found.
                  </td>
                </tr>
              ) : (
                websites.map((website) => (
                  <tr key={website._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-slate-800" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {website.websiteName}
                    </td>
                    <td className="px-6 py-4 text-blue-600" style={{ fontSize: '13px' }}>
                      {website.websiteUrl}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs text-slate-500" style={{ fontSize: '12px' }}>
                        <KeyRound size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{website.apiKey}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border ${website.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                        {website.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onRegenerateApiKey(website._id).catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to regenerate key'))}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      >
                        <RotateCcw size={13} />
                        Regenerate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
