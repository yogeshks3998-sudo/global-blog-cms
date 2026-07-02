import { useState } from 'react';
import { Camera, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api, type AuthUser } from '../services/api';

interface ProfilePageProps {
  user: AuthUser;
  onUserChange: (user: AuthUser) => void;
}

export function ProfilePage({ user, onUserChange }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile(user.role, { name, email, username });
      onUserChange(updated);
      setSaving(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      setSaving(false);
      toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.changePassword(user.role, currentPwd, newPwd);
      toast.success('Password updated successfully!');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update password');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h2 className="text-slate-800" style={{ fontSize: '22px', fontWeight: 600 }}>
          Profile
        </h2>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: '14px' }}>
          Manage your account information and password.
        </p>
      </div>

      {/* Profile info card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-slate-800 mb-6" style={{ fontSize: '15px', fontWeight: 600 }}>
          Account Information
        </h3>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
                {name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
              <Camera size={12} className="text-slate-500" />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-slate-800" style={{ fontSize: '16px', fontWeight: 600 }}>
              {name}
            </p>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: '13px' }}>
              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Client Admin'}
            </p>
            <button
              className="mt-2 text-blue-600 hover:text-blue-700 transition-colors"
              style={{ fontSize: '12px', fontWeight: 500 }}
              onClick={() => toast.info('Upload a photo by clicking the camera icon')}
            >
              Change photo
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              style={{ fontSize: '14px' }}
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              style={{ fontSize: '14px' }}
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-slate-800 mb-1" style={{ fontSize: '15px', fontWeight: 600 }}>
          Change Password
        </h3>
        <p className="text-slate-400 mb-6" style={{ fontSize: '13px' }}>
          Choose a strong password you haven't used before.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Current password */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full px-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter current password"
                style={{ fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
                style={{ fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Confirm new password"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
