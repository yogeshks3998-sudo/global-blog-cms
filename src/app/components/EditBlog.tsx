import { useState } from 'react';
import { ArrowLeft, ImageIcon, X, CheckCircle2, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Blog, Screen } from '../mockData';
import { CATEGORIES } from '../mockData';

interface EditBlogProps {
  blog: Blog;
  onNavigate: (screen: Screen, blogId?: string) => void;
  onSave: (blog: Blog) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  canApprove: boolean;
}

export function EditBlog({ blog, onNavigate, onSave, onApprove, onDelete, canApprove }: EditBlogProps) {
  const [form, setForm] = useState({ ...blog });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const update = (field: keyof Blog, value: string | string[]) => {
    if (field === 'image') setImageFailed(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      update('tags', [...form.tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    update('tags', form.tags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      setSaving(false);
      toast.success('Blog saved successfully!');
    } catch (error) {
      setSaving(false);
      toast.error(error instanceof Error ? error.message : 'Unable to save blog');
    }
  };

  const handleApprove = async () => {
    try {
      await onSave(form);
      await onApprove(blog.id);
      onNavigate('blogs');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to approve blog');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => onNavigate('view-blog', blog.id)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {canApprove && blog.status === 'pending' && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
          )}
          <button
            onClick={() => onDelete(blog.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Image section */}
        <div className="relative h-48 bg-slate-100 group overflow-hidden">
          {form.image && !imageFailed ? (
            <img src={form.image} alt="Featured" className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <ImageIcon size={36} />
              <p className="mt-2" style={{ fontSize: '13px' }}>No image</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-xl shadow" style={{ fontSize: '13px', fontWeight: 500 }}>
              Change Image
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Image URL */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Featured Image URL
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => update('image', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://example.com/image.jpg"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter blog title..."
              style={{ fontSize: '16px', fontWeight: 500 }}
            />
          </div>

          {/* Category + Author row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                style={{ fontSize: '14px' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                Author
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => update('author', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Author name"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add a tag and press Enter"
                style={{ fontSize: '13px' }}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-slate-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Brief summary of the blog post..."
              style={{ fontSize: '14px', lineHeight: '1.6' }}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-700" style={{ fontSize: '13px', fontWeight: 500 }}>
                Content
              </label>
              <span className="text-slate-400" style={{ fontSize: '12px' }}>
                Use ## for headings, blank line for new paragraph
              </span>
            </div>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border border-slate-200 border-b-0 rounded-t-xl">
              {['H2', 'B', 'I', '¶'].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  className="px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}
                >
                  {btn}
                </button>
              ))}
            </div>
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              rows={14}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-b-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Write your blog content here..."
              style={{ fontSize: '14px', lineHeight: '1.8' }}
            />
            <p className="text-right text-slate-400 mt-1" style={{ fontSize: '11px' }}>
              {form.content.length} characters
            </p>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => onNavigate('view-blog', blog.id)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <Save size={13} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {canApprove && blog.status === 'pending' && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              <CheckCircle2 size={13} />
              Save & Approve
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
