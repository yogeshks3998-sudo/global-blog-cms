import { useState } from 'react';
import { Search, Filter, Eye, Pencil, Trash2, CheckCircle, ChevronLeft, ChevronRight, FileText, ImageIcon } from 'lucide-react';
import type { Blog, BlogStatus, Screen } from '../mockData';
import { StatusBadge } from './StatusBadge';

interface BlogsPageProps {
  blogs: Blog[];
  onNavigate: (screen: Screen, blogId?: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  loading: boolean;
  canApprove: boolean;
}

const PAGE_SIZE = 5;

type FilterTab = 'all' | BlogStatus;

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <FileText size={28} className="text-slate-400" />
      </div>
      <p className="text-slate-700" style={{ fontSize: '16px', fontWeight: 600 }}>
        {hasSearch ? 'No blogs found' : 'No blogs yet'}
      </p>
      <p className="text-slate-400 mt-1 max-w-xs" style={{ fontSize: '14px' }}>
        {hasSearch
          ? "Try adjusting your search or filter to find what you're looking for."
          : 'Blog submissions from visitors will appear here for review.'}
      </p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-40" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-28" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-3.5 bg-slate-100 rounded animate-pulse w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 bg-slate-100 rounded-full animate-pulse w-20" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3.5 bg-slate-100 rounded animate-pulse w-20" />
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
              <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
              <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function BlogThumb({ blog }: { blog: Blog }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!blog.image || imageFailed) {
    return (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 text-slate-400">
        <ImageIcon size={16} />
      </div>
    );
  }

  return (
    <img
      src={blog.image}
      alt={blog.title}
      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100"
      onError={() => setImageFailed(true)}
    />
  );
}

export function BlogsPage({ blogs, onNavigate, onApprove, onDelete, searchQuery, loading, canApprove }: BlogsPageProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const filtered = blogs.filter((b) => {
    const matchStatus = filterTab === 'all' || b.status === filterTab;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePagePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePagePage - 1) * PAGE_SIZE, safePagePage * PAGE_SIZE);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: blogs.length },
    { key: 'pending', label: 'Pending', count: blogs.filter((b) => b.status === 'pending').length },
    { key: 'published', label: 'Published', count: blogs.filter((b) => b.status === 'published').length },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: '22px', fontWeight: 600 }}>
            All Blogs
          </h2>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: '14px' }}>
            Manage and review all blog submissions.
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setFilterTab(tab.key); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                filterTab === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={{ fontSize: '13px', fontWeight: filterTab === tab.key ? 500 : 400 }}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full ${
                  filterTab === tab.key ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                }`}
                style={{ fontSize: '11px' }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search (mobile) */}
        <div className="relative sm:hidden w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ fontSize: '13px' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter size={14} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Filter</span>
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Blog', 'Author', 'Status', 'Date', 'Actions'].map((col) => (
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
              {loading ? (
                <TableSkeleton />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState hasSearch={!!searchQuery || filterTab !== 'all'} />
                  </td>
                </tr>
              ) : (
                paginated.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Blog info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <BlogThumb blog={blog} />
                        <div className="min-w-0">
                          <p
                            className="text-slate-800 truncate max-w-xs cursor-pointer hover:text-blue-600 transition-colors"
                            style={{ fontSize: '14px', fontWeight: 500 }}
                            onClick={() => onNavigate('view-blog', blog.id)}
                          >
                            {blog.title}
                          </p>
                          <p className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>
                            {blog.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-600" style={{ fontSize: '13px' }}>
                        {blog.author}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={blog.status} />
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-400" style={{ fontSize: '13px' }}>
                        {new Date(blog.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
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
                        {canApprove && blog.status === 'pending' && (
                          <button
                            onClick={() => onApprove(blog.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                            title="Approve"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(blog.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-slate-400" style={{ fontSize: '13px' }}>
              Showing {(safePagePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePagePage * PAGE_SIZE, filtered.length)} of {filtered.length} blogs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePagePage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    safePagePage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  style={{ fontSize: '13px', fontWeight: safePagePage === i + 1 ? 600 : 400 }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePagePage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
