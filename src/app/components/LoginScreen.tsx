import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (identity: string, password: string, remember: boolean) => Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await onLogin(email, password, remember);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileText size={20} className="text-white" />
          </div>
          <span className="text-slate-800" style={{ fontWeight: 700, fontSize: '20px' }}>
            BlogAdmin
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h1
              className="text-slate-800"
              style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1.3 }}
            >
              Welcome back
            </h1>
            <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>
              Sign in to your admin account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-slate-700 mb-2"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Email or username
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com or username"
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-slate-700 mb-2"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  style={{ fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-slate-600" style={{ fontSize: '14px' }}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
                onClick={() => toast.info('Password reset link sent to your email!')}
              >
                Forgot password?
              </button>
            </div>

            {/* Hint */}
            <p className="text-slate-400" style={{ fontSize: '12px' }}>
              Use your Super Admin or Client Admin credentials.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6" style={{ fontSize: '12px' }}>
          © 2024 BlogAdmin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
