import type { Blog, BlogStatus } from '../mockData';

const isLocalHost = (hostname: string) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  hostname.startsWith('192.168.') ||
  hostname.startsWith('10.') ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined' && !isLocalHost(window.location.hostname)
    ? 'https://global-blog-cms-api.onrender.com/api'
    : `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//127.0.0.1:5000/api`;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const TOKEN_KEY = 'global_blog_cms_token';
const USER_KEY = 'global_blog_cms_user';

export type UserRole = 'SUPER_ADMIN' | 'CLIENT_ADMIN';
export type AccountStatus = 'ACTIVE' | 'DISABLED';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  websiteId: string | null;
  status: AccountStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: { field: string; message: string }[];
}

interface BackendBlog {
  _id: string;
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

export interface DashboardData {
  cards: {
    totalWebsites?: number;
    totalClients?: number;
    pendingBlogs: number;
    publishedBlogs: number;
    todaysBlogs?: number;
  };
  recentBlogs?: Blog[];
  recentSubmissions?: Blog[];
  recentClients?: unknown[];
}

export interface Website {
  _id: string;
  websiteName: string;
  websiteUrl: string;
  logo?: string | null;
  apiKey: string;
  status: AccountStatus;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  username: string;
  status: AccountStatus;
  websiteId?: Website | null;
}

export interface CreateClientInput {
  name: string;
  email: string;
  username: string;
  password: string;
  websiteName: string;
  websiteUrl: string;
  logo?: string;
  status?: AccountStatus;
  websiteStatus?: AccountStatus;
}

export interface UpdateClientInput {
  name: string;
  email: string;
  username: string;
  status: AccountStatus;
}

const getToken = () => localStorage.getItem(TOKEN_KEY);

const saveSession = (token: string, user: AuthUser, remember: boolean) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (!remember) sessionStorage.setItem('session_only_login', 'true');
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('session_only_login');
};

export const getSavedUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
};

const toStatus = (status: BackendBlog['status']): BlogStatus =>
  status === 'PUBLISHED' ? 'published' : 'pending';

const fromStatus = (status: BlogStatus): BackendBlog['status'] =>
  status === 'published' ? 'PUBLISHED' : 'PENDING';

const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${UPLOAD_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

export const mapBlog = (blog: BackendBlog): Blog => ({
  id: blog._id,
  title: blog.title,
  author: blog.authorName,
  authorEmail: blog.authorEmail,
  status: toStatus(blog.status),
  date: blog.createdAt,
  category: blog.category,
  tags: blog.tags || [],
  content: blog.content,
  image: getImageUrl(blog.featuredImage),
  excerpt: blog.content.replace(/\s+/g, ' ').slice(0, 160)
});

const request = async <T>(path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    const validation = payload?.errors?.map((error) => error.message).join(', ');
    throw new Error(validation || payload?.message || 'Request failed');
  }

  return payload;
};

const blogBase = (role: UserRole) => (role === 'SUPER_ADMIN' ? '/admin/blogs' : '/client/blogs');

export const api = {
  async login(identity: string, password: string, remember: boolean) {
    const isEmail = identity.includes('@');
    const payload = await request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        [isEmail ? 'email' : 'username']: identity,
        password
      })
    });

    if (!payload.data) throw new Error('Login response missing user data');
    saveSession(payload.data.token, payload.data.user, remember);
    return payload.data.user;
  },

  async getProfile() {
    const payload = await request<{ user: AuthUser }>('/auth/me');
    if (!payload.data) throw new Error('Profile response missing user data');
    localStorage.setItem(USER_KEY, JSON.stringify(payload.data.user));
    return payload.data.user;
  },

  async getDashboard(role: UserRole) {
    const path = role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/client/dashboard';
    const payload = await request<{
      cards: DashboardData['cards'];
      recentBlogs?: BackendBlog[];
      recentSubmissions?: BackendBlog[];
      recentClients?: unknown[];
    }>(path);

    return {
      cards: payload.data?.cards || { pendingBlogs: 0, publishedBlogs: 0 },
      recentBlogs: payload.data?.recentBlogs?.map(mapBlog) || [],
      recentSubmissions: payload.data?.recentSubmissions?.map(mapBlog) || [],
      recentClients: payload.data?.recentClients || []
    } satisfies DashboardData;
  },

  async getBlogs(role: UserRole, search = '') {
    const params = new URLSearchParams({ limit: '100' });
    if (search.trim()) params.set('search', search.trim());
    const payload = await request<{ blogs: BackendBlog[] }>(`${blogBase(role)}?${params}`);
    return payload.data?.blogs.map(mapBlog) || [];
  },

  async updateBlog(role: UserRole, blog: Blog) {
    const payload = await request<{ blog: BackendBlog }>(`${blogBase(role)}/${blog.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: blog.title,
        authorName: blog.author,
        authorEmail: blog.authorEmail,
        category: blog.category,
        content: blog.content,
        tags: blog.tags,
        featuredImage: blog.image,
        status: role === 'SUPER_ADMIN' ? fromStatus(blog.status) : undefined
      })
    });
    if (!payload.data) throw new Error('Blog response missing data');
    return mapBlog(payload.data.blog);
  },

  async approveBlog(id: string) {
    const payload = await request<{ blog: BackendBlog }>(`/client/blogs/${id}/approve`, {
      method: 'PATCH'
    });
    if (!payload.data) throw new Error('Blog response missing data');
    return mapBlog(payload.data.blog);
  },

  async deleteBlog(role: UserRole, id: string) {
    const path = role === 'SUPER_ADMIN' ? `/admin/blogs/${id}/permanent` : `/client/blogs/${id}`;
    await request(path, { method: 'DELETE' });
  },

  async updateProfile(role: UserRole, data: { name: string; email: string; username: string }) {
    const path = role === 'SUPER_ADMIN' ? '/admin/settings' : '/client/profile';
    const payload = await request<{ user: AuthUser }>(path, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (!payload.data) throw new Error('Profile response missing user data');
    localStorage.setItem(USER_KEY, JSON.stringify(payload.data.user));
    return payload.data.user;
  },

  async changePassword(role: UserRole, currentPassword: string, newPassword: string) {
    const path =
      role === 'SUPER_ADMIN' ? '/admin/settings/change-password' : '/client/profile/change-password';
    await request(path, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async getClients() {
    const payload = await request<{ clients: Client[] }>('/admin/clients');
    return payload.data?.clients || [];
  },

  async createClient(data: CreateClientInput) {
    const payload = await request<{ client: Client; website: Website }>('/admin/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!payload.data) throw new Error('Client response missing data');
    return payload.data;
  },

  async updateClient(id: string, data: UpdateClientInput) {
    const payload = await request<{ client: Client }>(`/admin/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (!payload.data) throw new Error('Client response missing data');
    return payload.data.client;
  },

  async resetClientPassword(id: string, password: string) {
    await request(`/admin/clients/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ password })
    });
  },

  async deleteClient(id: string) {
    await request(`/admin/clients/${id}`, {
      method: 'DELETE'
    });
  },

  async getWebsites() {
    const payload = await request<{ websites: Website[] }>('/admin/websites');
    return payload.data?.websites || [];
  },

  async regenerateWebsiteApiKey(id: string) {
    const payload = await request<{ website: Website }>(`/admin/websites/${id}/regenerate-api-key`, {
      method: 'PATCH'
    });
    if (!payload.data) throw new Error('Website response missing data');
    return payload.data.website;
  }
};
