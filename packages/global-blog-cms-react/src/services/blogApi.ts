export interface Blog {
  _id: string;
  websiteId?: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  authorName: string;
  authorEmail: string;
  category: string;
  content: string;
  tags: string[];
  status: 'PENDING' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}

export interface BlogSubmitInput {
  title: string;
  authorName: string;
  authorEmail: string;
  category: string;
  content: string;
  tags?: string[];
  featuredImage?: File | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: { field: string; message: string }[];
}

export interface BlogListResult {
  blogs: Blog[];
  meta?: PaginationMeta;
}

export class BlogApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.name = 'BlogApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const normalizeApiUrl = (url: string) => {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const buildQuery = (params: BlogListParams) => {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.category?.trim()) query.set('category', params.category.trim());
  if (params.tag?.trim()) query.set('tag', params.tag.trim());

  const value = query.toString();
  return value ? `?${value}` : '';
};

export const createBlogApi = (apiUrl: string, apiKey: string) => {
  const baseUrl = normalizeApiUrl(apiUrl);

  const request = async <T>(path: string, init: RequestInit = {}) => {
    if (!apiKey) {
      throw new BlogApiError('Missing Global Blog CMS API key.', 401);
    }

    const headers = new Headers(init.headers);
    headers.set('x-api-key', apiKey);

    if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers
      });
    } catch (error) {
      throw new BlogApiError(error instanceof Error ? error.message : 'CMS API request failed.', 0);
    }

    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || !payload?.success) {
      const validationMessage = payload?.errors?.map((item) => item.message).join(', ');
      throw new BlogApiError(
        validationMessage || payload?.message || 'CMS API request failed.',
        response.status,
        payload?.errors
      );
    }

    return payload;
  };

  const imageUrl = (path?: string | null) => {
    if (!path) return '';
    if (/^data:image\//i.test(path)) return path;
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl.replace(/\/api$/, '')}/${normalizedPath}`;
  };

  return {
    imageUrl,

    async getBlogs(params: BlogListParams = {}): Promise<BlogListResult> {
      const payload = await request<{ blogs: Blog[] }>(`/blogs${buildQuery(params)}`);
      return {
        blogs: payload.data?.blogs || [],
        meta: payload.meta
      };
    },

    async getLatestBlogs(limit = 5): Promise<Blog[]> {
      const payload = await request<{ blogs: Blog[] }>(`/blogs/latest?limit=${limit}`);
      return payload.data?.blogs || [];
    },

    async getBlog(slug: string): Promise<Blog> {
      const payload = await request<{ blog: Blog }>(`/blogs/${encodeURIComponent(slug)}`);
      if (!payload.data?.blog) {
        throw new BlogApiError('Blog not found.', 404);
      }

      return payload.data.blog;
    },

    async submitBlog(input: BlogSubmitInput): Promise<Blog> {
      const hasImage = Boolean(input.featuredImage);

      if (hasImage) {
        const formData = new FormData();
        formData.set('title', input.title);
        formData.set('authorName', input.authorName);
        formData.set('authorEmail', input.authorEmail);
        formData.set('category', input.category);
        formData.set('content', input.content);
        if (input.tags?.length) formData.set('tags', input.tags.join(','));
        if (input.featuredImage) formData.set('featuredImage', input.featuredImage);

        const payload = await request<{ blog: Blog }>('/blogs/submit', {
          method: 'POST',
          body: formData
        });

        if (!payload.data?.blog) throw new BlogApiError('Blog submission response is missing data.', 500);
        return payload.data.blog;
      }

      const payload = await request<{ blog: Blog }>('/blogs/submit', {
        method: 'POST',
        body: JSON.stringify({
          title: input.title,
          authorName: input.authorName,
          authorEmail: input.authorEmail,
          category: input.category,
          content: input.content,
          tags: input.tags || []
        })
      });

      if (!payload.data?.blog) throw new BlogApiError('Blog submission response is missing data.', 500);
      return payload.data.blog;
    }
  };
};
