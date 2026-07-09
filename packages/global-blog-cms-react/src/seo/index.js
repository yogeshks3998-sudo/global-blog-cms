const trimSlash = (value) => String(value || '').replace(/\/+$/, '');

export const normalizeApiUrl = (apiUrl) => {
  const trimmed = trimSlash(apiUrl);
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const stripHtml = (value = '') =>
  String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const createExcerpt = (value = '', maxLength = 160) => {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
};

export const createBlogUrl = ({ siteUrl, slug, blogPath = '/blog' }) =>
  `${trimSlash(siteUrl)}${blogPath.startsWith('/') ? blogPath : `/${blogPath}`}/${encodeURIComponent(slug)}`;

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const request = async ({ apiUrl, apiKey, path }) => {
  if (!apiUrl) throw new Error('CMS apiUrl is required.');
  if (!apiKey) throw new Error('CMS apiKey is required.');

  const response = await fetch(`${normalizeApiUrl(apiUrl)}${path}`, {
    headers: {
      'x-api-key': apiKey
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `CMS API request failed with status ${response.status}.`);
  }

  return payload;
};

export const getPublishedBlogs = async ({ apiUrl, apiKey, page = 1, limit = 100, maxPages = 20, ...filters }) => {
  const blogs = [];
  let currentPage = page;
  let totalPages = 1;

  do {
    const payload = await request({
      apiUrl,
      apiKey,
      path: `/blogs${buildQuery({ ...filters, page: currentPage, limit })}`
    });

    blogs.push(...(payload.data?.blogs || []));
    totalPages = payload.meta?.totalPages || 1;
    currentPage += 1;
  } while (currentPage <= totalPages && currentPage < page + maxPages);

  return blogs;
};

export const getPublishedBlogBySlug = async ({ apiUrl, apiKey, slug }) => {
  if (!slug) throw new Error('Blog slug is required.');

  const payload = await request({
    apiUrl,
    apiKey,
    path: `/blogs/${encodeURIComponent(slug)}`
  });

  return payload.data?.blog || null;
};

export const generateBlogMeta = ({
  blog,
  siteName = '',
  siteUrl,
  blogPath = '/blog',
  titleSuffix = siteName ? ` | ${siteName}` : '',
  descriptionLength = 160
}) => {
  if (!blog) throw new Error('Blog is required.');

  const title = `${blog.title}${titleSuffix}`;
  const description = createExcerpt(blog.excerpt || blog.description || blog.content, descriptionLength);
  const canonical = siteUrl ? createBlogUrl({ siteUrl, slug: blog.slug, blogPath }) : undefined;

  return {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName,
      images: blog.featuredImage ? [blog.featuredImage] : []
    },
    twitter: {
      card: blog.featuredImage ? 'summary_large_image' : 'summary',
      title,
      description,
      image: blog.featuredImage || undefined
    }
  };
};

export const generateBlogJsonLd = ({ blog, siteName = '', siteUrl, blogPath = '/blog' }) => {
  if (!blog) throw new Error('Blog is required.');

  const url = siteUrl ? createBlogUrl({ siteUrl, slug: blog.slug, blogPath }) : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: createExcerpt(blog.excerpt || blog.description || blog.content),
    image: blog.featuredImage ? [blog.featuredImage] : undefined,
    author: {
      '@type': 'Person',
      name: blog.authorName || siteName || 'Author'
    },
    publisher: siteName
      ? {
          '@type': 'Organization',
          name: siteName
        }
      : undefined,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    mainEntityOfPage: url,
    url,
    articleSection: blog.category,
    keywords: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags
  };
};

export const generateBlogSitemapUrls = ({ blogs, siteUrl, blogPath = '/blog' }) =>
  (blogs || []).map((blog) => ({
    url: createBlogUrl({ siteUrl, slug: blog.slug, blogPath }),
    lastModified: blog.updatedAt || blog.createdAt,
    changeFrequency: 'weekly',
    priority: 0.7
  }));

export const generateStaticBlogData = async ({ apiUrl, apiKey, siteUrl, blogPath = '/blog', ...options }) => {
  const blogs = await getPublishedBlogs({ apiUrl, apiKey, ...options });

  return {
    generatedAt: new Date().toISOString(),
    blogs,
    sitemap: siteUrl ? generateBlogSitemapUrls({ blogs, siteUrl, blogPath }) : []
  };
};
