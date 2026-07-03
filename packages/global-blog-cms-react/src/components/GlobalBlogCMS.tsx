import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Blog, BlogSubmitInput, createBlogApi } from '../services/blogApi';
import '../styles.css';

export interface GlobalBlogCMSProps {
  apiUrl: string;
  apiKey: string;
  className?: string;
  theme?: 'light' | 'dark';
  pageSize?: number;
  showSubmitForm?: boolean;
  title?: string;
  description?: string;
  emptyMessage?: string;
  renderHeader?: ReactNode;
}

type View =
  | { name: 'list'; page: number }
  | { name: 'detail'; slug: string };

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));

const excerpt = (content: string) => content.replace(/\s+/g, ' ').trim().slice(0, 180);

const splitTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

function BlogImage({
  src,
  alt,
  fallback,
  className,
  placeholderClassName
}: {
  src: string;
  alt: string;
  fallback: string;
  className: string;
  placeholderClassName: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className={placeholderClassName}>{fallback}</span>;
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export function GlobalBlogCMS({
  apiUrl,
  apiKey,
  className = '',
  theme = 'light',
  pageSize = 9,
  showSubmitForm = true,
  title = 'Blogs',
  description = 'Read the latest published articles or submit your own story for review.',
  emptyMessage = 'No published blogs are available yet.',
  renderHeader
}: GlobalBlogCMSProps) {
  const api = useMemo(() => createBlogApi(apiUrl, apiKey), [apiUrl, apiKey]);
  const [view, setView] = useState<View>({ name: 'list', page: 1 });
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadBlogs = async (page: number, currentSearch: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await api.getBlogs({
        page,
        limit: pageSize,
        search: currentSearch
      });
      setBlogs(result.blogs);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load blogs.');
      setBlogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadBlog = async (slug: string) => {
    setLoading(true);
    setError('');
    setSelectedBlog(null);

    try {
      setSelectedBlog(await api.getBlog(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load blog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view.name === 'list') {
      loadBlogs(view.page, activeSearch);
    }

    if (view.name === 'detail') {
      loadBlog(view.slug);
    }
  }, [view, activeSearch, pageSize, api]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setActiveSearch(search);
    setView({ name: 'list', page: 1 });
  };

  const submitBlog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSubmitSuccess('');

    const form = event.currentTarget;
    const data = new FormData(form);
    const featuredImage = data.get('featuredImage');

    const payload: BlogSubmitInput = {
      title: String(data.get('title') || ''),
      authorName: String(data.get('authorName') || ''),
      authorEmail: String(data.get('authorEmail') || ''),
      category: String(data.get('category') || ''),
      content: String(data.get('content') || ''),
      tags: splitTags(String(data.get('tags') || '')),
      featuredImage: featuredImage instanceof File && featuredImage.size > 0 ? featuredImage : null
    };

    try {
      await api.submitBlog(payload);
      form.reset();
      setSubmitSuccess('Your blog has been submitted for approval.');
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit blog.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`gbcms-widget gbcms-theme-${theme} ${className}`.trim()}>
      <header className="gbcms-header">
        {renderHeader || (
          <div>
            <span className="gbcms-eyebrow">Client Blog</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        )}
      </header>

      {error && <div className="gbcms-alert gbcms-alert-error">{error}</div>}
      {submitSuccess && <div className="gbcms-alert gbcms-alert-success">{submitSuccess}</div>}

      {view.name === 'list' && (
        <>
          <form className="gbcms-toolbar" onSubmit={submitSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search blogs"
              aria-label="Search blogs"
            />
            <button className="gbcms-button" type="submit">
              Search
            </button>
            {activeSearch && (
              <button
                className="gbcms-button gbcms-button-muted"
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveSearch('');
                  setView({ name: 'list', page: 1 });
                }}
              >
                Clear
              </button>
            )}
          </form>

          {loading ? (
            <div className="gbcms-state">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="gbcms-state">{emptyMessage}</div>
          ) : (
            <div className="gbcms-grid">
              {blogs.map((blog) => (
                <article className="gbcms-card" key={blog._id}>
                  <button className="gbcms-card-media" type="button" onClick={() => setView({ name: 'detail', slug: blog.slug })}>
                    <BlogImage
                      src={api.imageUrl(blog.featuredImage)}
                      alt={blog.title}
                      fallback={blog.category.slice(0, 2).toUpperCase()}
                      className="gbcms-card-image"
                      placeholderClassName="gbcms-card-placeholder"
                    />
                  </button>
                  <div className="gbcms-card-body">
                    <div className="gbcms-meta">
                      <span>{blog.category}</span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <h2>{blog.title}</h2>
                    <p>{excerpt(blog.content)}</p>
                    <button className="gbcms-read-link" type="button" onClick={() => setView({ name: 'detail', slug: blog.slug })}>
                      Read article
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="gbcms-pagination" aria-label="Blog pagination">
              <button
                className="gbcms-button"
                type="button"
                disabled={view.page <= 1 || loading}
                onClick={() => setView({ name: 'list', page: Math.max(1, view.page - 1) })}
              >
                Previous
              </button>
              <span>
                Page {view.page} of {totalPages}
              </span>
              <button
                className="gbcms-button"
                type="button"
                disabled={view.page >= totalPages || loading}
                onClick={() => setView({ name: 'list', page: Math.min(totalPages, view.page + 1) })}
              >
                Next
              </button>
            </nav>
          )}

          {showSubmitForm && (
            <section className="gbcms-submit-panel">
              <div className="gbcms-submit-intro">
                <span className="gbcms-eyebrow">Write for us</span>
                <h2>Submit your blog for review</h2>
                <p>Share an article with this website. It will appear publicly after the site admin approves it.</p>
              </div>
              <button
                className="gbcms-button gbcms-button-primary"
                type="button"
                onClick={() => {
                  setFormOpen((value) => !value);
                  setSubmitSuccess('');
                }}
                aria-expanded={formOpen}
              >
                {formOpen ? 'Close Form' : 'Write Blog'}
              </button>

              {formOpen && (
                <form className="gbcms-form" onSubmit={submitBlog}>
                  <div className="gbcms-form-heading">
                    <h3>Blog Details</h3>
                    <p>Add a featured image so your article card and detail page look complete.</p>
                  </div>

                  <label>
                    Title
                    <input name="title" required maxLength={160} placeholder="Enter blog title" />
                  </label>
                  <div className="gbcms-form-row">
                    <label>
                      Author name
                      <input name="authorName" required maxLength={100} placeholder="Your name" />
                    </label>
                    <label>
                      Author email
                      <input name="authorEmail" required type="email" maxLength={160} placeholder="you@example.com" />
                    </label>
                  </div>
                  <label>
                    Category
                    <input name="category" required maxLength={80} placeholder="Category" />
                  </label>
                  <label>
                    Tags
                    <input name="tags" placeholder="SEO, Web Design, Marketing" />
                  </label>
                  <label>
                    Featured image
                    <input name="featuredImage" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" />
                  </label>
                  <label>
                    Content
                    <textarea name="content" required rows={10} minLength={50} placeholder="Write your blog content here..." />
                  </label>
                  <button className="gbcms-button gbcms-button-primary" type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                </form>
              )}
            </section>
          )}
        </>
      )}

      {view.name === 'detail' && (
        <article className="gbcms-detail">
          <button className="gbcms-read-link" type="button" onClick={() => setView({ name: 'list', page: 1 })}>
            Back to blogs
          </button>

          {loading ? (
            <div className="gbcms-state">Loading blog...</div>
          ) : selectedBlog ? (
            <>
              <div className="gbcms-detail-hero">
                <BlogImage
                  src={api.imageUrl(selectedBlog.featuredImage)}
                  alt={selectedBlog.title}
                  fallback={selectedBlog.category.slice(0, 2).toUpperCase()}
                  className="gbcms-detail-image"
                  placeholderClassName="gbcms-detail-placeholder"
                />
                <div className="gbcms-detail-heading">
                  <div className="gbcms-meta">
                    <span>{selectedBlog.category}</span>
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                    <span>By {selectedBlog.authorName}</span>
                  </div>
                  <h1>{selectedBlog.title}</h1>
                </div>
              </div>
              <div className="gbcms-tags">
                {selectedBlog.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="gbcms-content">{selectedBlog.content}</div>
            </>
          ) : (
            <div className="gbcms-state">Blog not found.</div>
          )}
        </article>
      )}
    </section>
  );
}
