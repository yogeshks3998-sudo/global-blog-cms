import { Clock, CheckCircle2, FileText, ArrowRight, Eye, Pencil } from 'lucide-react';
import type { Blog, Screen } from '../mockData';
import { StatusBadge } from './StatusBadge';
import type { AuthUser, DashboardData } from '../services/api';

interface DashboardProps {
  blogs: Blog[];
  dashboard: DashboardData | null;
  user: AuthUser;
  onNavigate: (screen: Screen, blogId?: string) => void;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-slate-500" style={{ fontSize: '13px', fontWeight: 400 }}>
          {label}
        </p>
        <p className="text-slate-800 mt-0.5" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-48" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 bg-slate-100 rounded-full animate-pulse w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-16" />
      </td>
    </tr>
  );
}

export function Dashboard({ blogs, dashboard, user, onNavigate }: DashboardProps) {
  const pendingCount = dashboard?.cards.pendingBlogs ?? blogs.filter((b) => b.status === 'pending').length;
  const publishedCount = dashboard?.cards.publishedBlogs ?? blogs.filter((b) => b.status === 'published').length;
  const totalCount = blogs.length;
  const totalWebsites = dashboard?.cards.totalWebsites ?? 0;
  const totalClients = dashboard?.cards.totalClients ?? 0;
  const todaysBlogs = dashboard?.cards.todaysBlogs ?? 0;

  const recentBlogs = [...blogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div>
        <h2 className="text-slate-800" style={{ fontSize: '22px', fontWeight: 600 }}>
          Overview
        </h2>
        <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>
          Here's what's happening with your blog today.
          {user.role === 'SUPER_ADMIN' ? ' You are viewing the global CMS.' : ' You are viewing your assigned website only.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {user.role === 'SUPER_ADMIN' && (
          <>
            <StatCard
              label="Total Websites"
              value={totalWebsites}
              icon={FileText}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              label="Total Clients"
              value={totalClients}
              icon={FileText}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
          </>
        )}
        <StatCard
          label="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label="Published Blogs"
          value={publishedCount}
          icon={CheckCircle2}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label={user.role === 'CLIENT_ADMIN' ? "Today's Blogs" : 'Total Blogs'}
          value={user.role === 'CLIENT_ADMIN' ? todaysBlogs : totalCount}
          icon={FileText}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontSize: '15px', fontWeight: 600 }}>
            Recent Activity
          </h3>
          <button
            onClick={() => onNavigate('blogs')}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th
                  className="text-left px-6 py-3 text-slate-500"
                  style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Title
                </th>
                <th
                  className="text-left px-6 py-3 text-slate-500"
                  style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Author
                </th>
                <th
                  className="text-left px-6 py-3 text-slate-500"
                  style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Status
                </th>
                <th
                  className="text-left px-6 py-3 text-slate-500"
                  style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Date
                </th>
                <th
                  className="text-left px-6 py-3 text-slate-500"
                  style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentBlogs.length === 0
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                : recentBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p
                          className="text-slate-800 truncate max-w-xs"
                          style={{ fontSize: '14px', fontWeight: 500 }}
                        >
                          {blog.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-500" style={{ fontSize: '13px' }}>
                          {blog.author}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={blog.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-400" style={{ fontSize: '13px' }}>
                          {new Date(blog.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('view-blog', blog.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onNavigate('edit-blog', blog.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-800" style={{ fontSize: '14px', fontWeight: 600 }}>
              {pendingCount} blog{pendingCount !== 1 ? 's' : ''} awaiting review
            </p>
            <p className="text-amber-700 mt-0.5" style={{ fontSize: '13px' }}>
              Review and approve or delete pending submissions to keep your blog up to date.
            </p>
          </div>
          <button
            onClick={() => onNavigate('blogs')}
            className="flex-shrink-0 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            Review Now
          </button>
        </div>
      )}
    </div>
  );
}
