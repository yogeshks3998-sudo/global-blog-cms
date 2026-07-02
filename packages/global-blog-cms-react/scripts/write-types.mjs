import { mkdir, writeFile } from 'node:fs/promises';

const declarations = `import type { ReactNode } from 'react';

export type GlobalBlogCMSTag = string;

export interface GlobalBlogCMSBlog {
  _id: string;
  websiteId?: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  authorName: string;
  authorEmail: string;
  category: string;
  content: string;
  tags: GlobalBlogCMSTag[];
  status: 'PENDING' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

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

export declare function GlobalBlogCMS(props: GlobalBlogCMSProps): JSX.Element;
`;

await mkdir('dist', { recursive: true });
await writeFile('dist/index.d.ts', declarations);
