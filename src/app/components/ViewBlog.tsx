import { ArrowLeft, Calendar, Tag, Pencil, CheckCircle2, Trash2, User } from 'lucide-react';
import type { Blog, Screen } from '../mockData';
import { StatusBadge } from './StatusBadge';

interface ViewBlogProps {
  blog: Blog;
  onNavigate: (screen: Screen, blogId?: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  canApprove: boolean;
}

function ContentRenderer({ content }: { content: string }) {
  const blocks = content.split('\n\n');
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <h2
              key={i}
              className="text-slate-800 mt-8 mb-3"
              style={{ fontSize: '19px', fontWeight: 600, lineHeight: 1.4 }}
            >
              {block.slice(3)}
            </h2>
          );
        }
        return (
          <p
            key={i}
            className="text-slate-600 mb-4"
            style={{ fontSize: '15px', lineHeight: '1.8' }}
          >
            {block}
          </p>
        );
      })}
    </div>
  );
}

export function ViewBlog({ blog, onNavigate, onApprove, onDelete, canApprove }: ViewBlogProps) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top actions bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => onNavigate('blogs')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          <ArrowLeft size={16} />
          Back to Blogs
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('edit-blog', blog.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Pencil size={14} />
            Edit
          </button>
          {canApprove && blog.status === 'pending' && (
            <button
              onClick={() => onApprove(blog.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
          )}
          <button
            onClick={() => onDelete(blog.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Hero image */}
        <div className="relative h-56 sm:h-72 md:h-80 bg-slate-100 overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <StatusBadge status={blog.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Category + Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              {blog.category}
            </span>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full"
                style={{ fontSize: '12px' }}
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="text-slate-800 mb-4"
            style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.3 }}
          >
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={13} className="text-blue-600" />
              </div>
              <span style={{ fontSize: '14px' }}>{blog.author}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={14} />
              <span style={{ fontSize: '13px' }}>
                {new Date(blog.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Excerpt */}
          <p
            className="text-slate-500 mb-6 p-4 bg-slate-50 rounded-xl border-l-4 border-blue-400"
            style={{ fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic' }}
          >
            {blog.excerpt}
          </p>

          {/* Content */}
          <ContentRenderer content={blog.content} />
        </div>

        {/* Bottom action bar */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => onNavigate('blogs')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            Back
          </button>
          <button
            onClick={() => onNavigate('edit-blog', blog.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Pencil size={13} />
            Edit Blog
          </button>
          {canApprove && blog.status === 'pending' && (
            <button
              onClick={() => onApprove(blog.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              <CheckCircle2 size={13} />
              Approve & Publish
            </button>
          )}
          <button
            onClick={() => onDelete(blog.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
