import { useState } from 'react';
import { Globe, Save, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const [siteName, setSiteName] = useState('My Awesome Blog');
  const [siteUrl, setSiteUrl] = useState('https://myawesomeblog.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!siteName.trim()) {
      toast.error('Website name is required');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success('Settings saved!');
  };

  return (
    <div className="space-y-6 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h2 className="text-slate-800" style={{ fontSize: '22px', fontWeight: 600 }}>
          Settings
        </h2>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: '14px' }}>
          Configure your website and blog settings.
        </p>
      </div>

      {/* Website settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-slate-800 mb-1" style={{ fontSize: '15px', fontWeight: 600 }}>
          Website Information
        </h3>
        <p className="text-slate-400 mb-6" style={{ fontSize: '13px' }}>
          Basic information about your website shown to visitors.
        </p>

        <div className="space-y-5">
          {/* Website Name */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Website Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your website name"
              style={{ fontSize: '14px' }}
            />
            <p className="text-slate-400 mt-1.5" style={{ fontSize: '12px' }}>
              This name appears in the browser tab and navigation.
            </p>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Website URL
            </label>
            <div className="relative">
              <Globe
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://yourwebsite.com"
                style={{ fontSize: '14px' }}
              />
            </div>
            <p className="text-slate-400 mt-1.5" style={{ fontSize: '12px' }}>
              The public URL where your blog is hosted.
            </p>
          </div>

          {/* Logo upload */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Website Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                <span className="text-slate-400" style={{ fontSize: '24px', fontWeight: 700 }}>B</span>
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-2 w-fit cursor-pointer px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                  <Upload size={14} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Upload Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={() => toast.success('Logo uploaded!')} />
                </label>
                <p className="text-slate-400 mt-1.5" style={{ fontSize: '12px' }}>
                  PNG, JPG or SVG. Recommended: 200×200px.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-slate-800 mb-1" style={{ fontSize: '15px', fontWeight: 600 }}>
          Blog Settings
        </h3>
        <p className="text-slate-400 mb-6" style={{ fontSize: '13px' }}>
          Configure how your blog behaves.
        </p>

        <div className="space-y-4">
          {[
            {
              label: 'Email notifications for new submissions',
              description: 'Receive an email when a new blog is submitted for review.',
              defaultOn: true,
            },
            {
              label: 'Auto-publish approved blogs',
              description: 'Immediately publish blogs as soon as you approve them.',
              defaultOn: true,
            },
            {
              label: 'Allow visitor submissions',
              description: 'Show the blog submission form to website visitors.',
              defaultOn: true,
            },
          ].map((setting, i) => (
            <SettingToggle key={i} {...setting} />
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            saved
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-slate-700" style={{ fontSize: '14px', fontWeight: 500 }}>
          {label}
        </p>
        <p className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          on ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            on ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
