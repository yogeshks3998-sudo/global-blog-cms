import { LayoutDashboard, FileText, User, Settings, LogOut, X, Globe, UsersRound } from 'lucide-react';
import type { Screen } from '../mockData';
import type { AuthUser } from '../services/api';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  user: AuthUser;
  blogCount: number;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { label: string; screen: Screen; icon: React.FC<{ size?: number; className?: string }> }[] =
  [
    { label: 'Dashboard', screen: 'dashboard', icon: LayoutDashboard },
    { label: 'Clients', screen: 'clients', icon: UsersRound },
    { label: 'Websites', screen: 'websites', icon: Globe },
    { label: 'Blogs', screen: 'blogs', icon: FileText },
    { label: 'Profile', screen: 'profile', icon: User },
    { label: 'Settings', screen: 'settings', icon: Settings },
  ];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function Sidebar({ currentScreen, onNavigate, user, blogCount, onLogout, isOpen, onClose }: SidebarProps) {
  const activeScreen = ['view-blog', 'edit-blog'].includes(currentScreen) ? 'blogs' : currentScreen;
  const visibleNavItems =
    user.role === 'SUPER_ADMIN'
      ? navItems
      : navItems.filter((item) => !['settings', 'clients', 'websites'].includes(item.screen));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-100 z-50
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText size={15} className="text-white" />
            </div>
            <span className="text-slate-800" style={{ fontWeight: 700, fontSize: '15px' }}>
              BlogAdmin
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <p
            className="text-slate-400 px-3 mb-2 mt-2"
            style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Menu
          </p>
          <ul className="space-y-0.5">
            {visibleNavItems.map(({ label, screen, icon: Icon }) => {
              const active = activeScreen === screen;
              return (
                <li key={screen}>
                  <button
                    onClick={() => {
                      onNavigate(screen);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
                      ${active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                    `}
                  >
                    <Icon size={17} className={active ? 'text-blue-600' : undefined} />
                    <span style={{ fontWeight: active ? 500 : 400, fontSize: '14px' }}>{label}</span>
                    {screen === 'blogs' && (
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}
                        style={{ fontSize: '11px', fontWeight: 500 }}
                      >
                        {blogCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info + Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white" style={{ fontSize: '12px', fontWeight: 600 }}>
                {getInitials(user.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 truncate" style={{ fontSize: '13px', fontWeight: 500 }}>
                {user.name}
              </p>
              <p className="text-slate-400 truncate" style={{ fontSize: '11px' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut size={17} />
            <span style={{ fontWeight: 400, fontSize: '14px' }}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
