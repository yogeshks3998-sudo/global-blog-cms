import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import type { Screen } from '../mockData';
import type { AuthUser } from '../services/api';

interface TopNavbarProps {
  currentScreen: Screen;
  user: AuthUser;
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const screenTitles: Record<Screen, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  websites: 'Websites',
  blogs: 'Blog Management',
  'view-blog': 'View Blog',
  'edit-blog': 'Edit Blog',
  profile: 'Profile',
  settings: 'Settings',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function TopNavbar({ currentScreen, user, onMenuClick, searchQuery, onSearchChange }: TopNavbarProps) {
  return (
    <header
      className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center px-4 gap-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-slate-800 truncate" style={{ fontSize: '16px', fontWeight: 600 }}>
          {screenTitles[currentScreen]}
        </h1>
      </div>

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search blogs..."
          className="pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-48 focus:w-56"
          style={{ fontSize: '13px' }}
        />
      </div>

      {/* Notifications */}
      <button className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white" style={{ fontSize: '12px', fontWeight: 600 }}>
            {getInitials(user.name)}
          </span>
        </div>
        <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
      </button>
    </header>
  );
}
