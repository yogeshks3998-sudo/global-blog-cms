# Global Blog CMS React

Reusable React UI package for client websites using Global Blog CMS.

## Install

```bash
npm install @global-blog-cms/react
```

## Usage

```tsx
import { GlobalBlogCMS } from '@global-blog-cms/react';
import '@global-blog-cms/react/styles.css';

export default function BlogPage() {
  return (
    <GlobalBlogCMS
      apiUrl="https://global-blog-cms-api.onrender.com/api"
      apiKey="CLIENT_API_KEY"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `apiUrl` | `string` | Yes | Global Blog CMS API base URL. The package safely adds `/api` if missing. |
| `apiKey` | `string` | Yes | Website API key generated in the CMS. |
| `theme` | `'light' \| 'dark'` | No | Built-in color theme. Default is `light`. |
| `pageSize` | `number` | No | Blogs per page. Default is `9`. |
| `showSubmitForm` | `boolean` | No | Show or hide the write blog form. Default is `true`. |
| `title` | `string` | No | Blog page title. |
| `description` | `string` | No | Blog page intro text. |
| `emptyMessage` | `string` | No | Message shown when there are no published blogs. |
| `className` | `string` | No | Extra wrapper class. |

## What It Includes

- Published blog list
- Blog detail view
- Write blog form
- Optional featured image upload
- Pagination
- Search
- Loading state
- Error state
- Empty state
- API key header handling

The package only calls public CMS endpoints. It never uses admin JWTs.

## Local Preview

```bash
npm run dev
```

Set these values for preview:

```env
VITE_CMS_API_BASE_URL=http://127.0.0.1:5000/api
VITE_CMS_API_KEY=CLIENT_API_KEY
```
