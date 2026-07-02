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
  | { name: 'detail'; slug: string }
  | { name: 'write' };

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
          <>
            <div>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {showSubmitForm && (
              <button className="gbcms-button gbcms-button-primary" type="button" onClick={() => setView({ name: 'write' })}>
                Write Blog
              </button>
            )}
          </>
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
                  {blog.featuredImage && (
                    <img className="gbcms-card-image" src={api.imageUrl(blog.featuredImage)} alt={blog.title} loading="lazy" />
                  )}
                  <div className="gbcms-card-body">
                    <div className="gbcms-meta">
                      <span>{blog.category}</span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <h2>{blog.title}</h2>
                    <p>{excerpt(blog.content)}</p>
                    <button className="gbcms-link-button" type="button" onClick={() => setView({ name: 'detail', slug: blog.slug })}>
                      Read more
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
        </>
      )}

      {view.name === 'detail' && (
        <article className="gbcms-detail">
          <button className="gbcms-link-button" type="button" onClick={() => setView({ name: 'list', page: 1 })}>
            Back to blogs
          </button>

          {loading ? (
            <div className="gbcms-state">Loading blog...</div>
          ) : selectedBlog ? (
            <>
              {selectedBlog.featuredImage && (
                <img className="gbcms-detail-image" src={api.imageUrl(selectedBlog.featuredImage)} alt={selectedBlog.title} />
              )}
              <div className="gbcms-meta">
                <span>{selectedBlog.category}</span>
                <span>{formatDate(selectedBlog.createdAt)}</span>
                <span>By {selectedBlog.authorName}</span>
              </div>
              <h1>{selectedBlog.title}</h1>
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

      {view.name === 'write' && showSubmitForm && (
        <form className="gbcms-form" onSubmit={submitBlog}>
          <div className="gbcms-form-heading">
            <button className="gbcms-link-button" type="button" onClick={() => setView({ name: 'list', page: 1 })}>
              Back to blogs
            </button>
            <h2>Write a Blog</h2>
            <p>Submitted blogs are sent to the website admin for approval before publishing.</p>
          </div>

          <label>
            Title
            <input name="title" required maxLength={160} />
          </label>
          <div className="gbcms-form-row">
            <label>
              Author name
              <input name="authorName" required maxLength={100} />
            </label>
            <label>
              Author email
              <input name="authorEmail" required type="email" maxLength={160} />
            </label>
          </div>
          <label>
            Category
            <input name="category" required maxLength={80} />
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
            <textarea name="content" required rows={10} minLength={50} />
          </label>
          <button className="gbcms-button gbcms-button-primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      )}
    </section>
  );
}
