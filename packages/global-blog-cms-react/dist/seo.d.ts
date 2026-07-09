export interface GlobalBlogCMSSeoBlog {
  _id: string;
  websiteId?: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  authorName: string;
  authorEmail?: string;
  category: string;
  content: string;
  excerpt?: string;
  description?: string;
  tags: string[];
  status: 'PENDING' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export interface GlobalBlogCMSSeoConfig {
  apiUrl: string;
  apiKey: string;
}

export interface GetPublishedBlogsOptions extends GlobalBlogCMSSeoConfig {
  page?: number;
  limit?: number;
  maxPages?: number;
  search?: string;
  category?: string;
  tag?: string;
}

export interface GetPublishedBlogBySlugOptions extends GlobalBlogCMSSeoConfig {
  slug: string;
}

export interface BlogSeoOptions {
  blog: GlobalBlogCMSSeoBlog;
  siteName?: string;
  siteUrl?: string;
  blogPath?: string;
  titleSuffix?: string;
  descriptionLength?: number;
}

export interface BlogUrlOptions {
  siteUrl: string;
  slug: string;
  blogPath?: string;
}

export interface BlogSitemapOptions {
  blogs: GlobalBlogCMSSeoBlog[];
  siteUrl: string;
  blogPath?: string;
}

export interface StaticBlogDataOptions extends GetPublishedBlogsOptions {
  siteUrl?: string;
  blogPath?: string;
}

export declare const normalizeApiUrl: (apiUrl: string) => string;
export declare const stripHtml: (value?: string) => string;
export declare const createExcerpt: (value?: string, maxLength?: number) => string;
export declare const createBlogUrl: (options: BlogUrlOptions) => string;
export declare const getPublishedBlogs: (options: GetPublishedBlogsOptions) => Promise<GlobalBlogCMSSeoBlog[]>;
export declare const getPublishedBlogBySlug: (options: GetPublishedBlogBySlugOptions) => Promise<GlobalBlogCMSSeoBlog | null>;
export declare const generateBlogMeta: (options: BlogSeoOptions) => {
  title: string;
  description: string;
  canonical?: string;
  openGraph: {
    title: string;
    description: string;
    url?: string;
    type: 'article';
    siteName: string;
    images: string[];
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image?: string;
  };
};
export declare const generateBlogJsonLd: (options: BlogSeoOptions) => Record<string, unknown>;
export declare const generateBlogSitemapUrls: (options: BlogSitemapOptions) => Array<{
  url: string;
  lastModified: string;
  changeFrequency: 'weekly';
  priority: 0.7;
}>;
export declare const generateStaticBlogData: (options: StaticBlogDataOptions) => Promise<{
  generatedAt: string;
  blogs: GlobalBlogCMSSeoBlog[];
  sitemap: Array<{
    url: string;
    lastModified: string;
    changeFrequency: 'weekly';
    priority: 0.7;
  }>;
}>;
