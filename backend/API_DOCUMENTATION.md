# Multi-Tenant Global Blog CMS API

Base URL: `http://localhost:5000/api`

## Response Format

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

## Roles

- `SUPER_ADMIN`: application owner. Manages clients, websites, all blogs, and own settings.
- `CLIENT_ADMIN`: assigned to exactly one website. Can only manage blogs for that website.

## Status Values

- User and website status: `ACTIVE`, `DISABLED`
- Blog status: `PENDING`, `PUBLISHED`

## Auth

### POST `/auth/login`

Login with email or username.

Body:

```json
{
  "email": "owner@example.com",
  "username": "owner",
  "password": "password123"
}
```

JWT payload includes user ID, role, and website ID.

Status codes: `200`, `401`, `422`

### GET `/auth/me`

Protected. Requires `Authorization: Bearer <token>`.

Status codes: `200`, `401`

### PATCH `/auth/me`

Protected. Updates own `name`, `email`, or `username`.

Status codes: `200`, `401`, `409`, `422`

### PATCH `/auth/change-password`

Protected.

Body:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

Status codes: `200`, `400`, `401`, `422`

## Super Admin APIs

All Super Admin APIs require `Authorization: Bearer <SUPER_ADMIN token>`.

### GET `/admin/dashboard`

Returns total websites, total clients, pending blogs, published blogs, recent clients, and recent blogs.

Status codes: `200`, `401`, `403`

### POST `/admin/clients`

Creates one client admin and one assigned website.

Body:

```json
{
  "name": "Client Admin",
  "email": "client@example.com",
  "username": "clientadmin",
  "password": "password123",
  "websiteName": "Client Website",
  "websiteUrl": "https://client.com",
  "logo": "https://client.com/logo.png",
  "status": "ACTIVE",
  "websiteStatus": "ACTIVE"
}
```

Status codes: `201`, `401`, `403`, `409`, `422`

### GET `/admin/clients`

Returns all client admins with assigned website.

Status codes: `200`, `401`, `403`

### GET `/admin/clients/:id`

Status codes: `200`, `401`, `403`, `404`

### PATCH `/admin/clients/:id`

Updates `name`, `email`, `username`, or `status`.

Status codes: `200`, `401`, `403`, `404`, `409`, `422`

### PATCH `/admin/clients/:id/reset-password`

Body:

```json
{
  "password": "new-password"
}
```

Status codes: `200`, `401`, `403`, `404`, `422`

### DELETE `/admin/clients/:id`

Disables the client and its website.

Status codes: `200`, `401`, `403`, `404`

### POST `/admin/websites`

Creates a website for an existing unassigned client admin.

Body:

```json
{
  "websiteName": "Client Website",
  "websiteUrl": "https://client.com",
  "clientAdminId": "mongo-object-id",
  "logo": "https://client.com/logo.png",
  "status": "ACTIVE"
}
```

Status codes: `201`, `401`, `403`, `404`, `409`, `422`

### GET `/admin/websites`

Returns all websites.

Status codes: `200`, `401`, `403`

### GET `/admin/websites/:id`

Status codes: `200`, `401`, `403`, `404`

### PATCH `/admin/websites/:id`

Updates `websiteName`, `websiteUrl`, `logo`, or `status`.

Status codes: `200`, `401`, `403`, `404`, `422`

### PATCH `/admin/websites/:id/regenerate-api-key`

Generates a new API key for a website.

Status codes: `200`, `401`, `403`, `404`

### DELETE `/admin/websites/:id`

Deletes the website and its blogs, removes uploaded blog images, and disables the assigned client.

Status codes: `200`, `401`, `403`, `404`

### GET `/admin/blogs`

Super Admin can view and search all blogs. Super Admin cannot approve blogs.

Query: `page`, `limit`, `search`, `category`, `tag`, `status`, `websiteId`

Status codes: `200`, `401`, `403`, `422`

### POST `/admin/blogs`

Creates a blog for a selected website.

Body: `websiteId`, `title`, `authorName`, `authorEmail`, `category`, `content`, `tags`, optional `status`.

Status codes: `201`, `401`, `403`, `404`, `422`

### GET `/admin/blogs/:id`

Status codes: `200`, `401`, `403`, `404`

### PATCH `/admin/blogs/:id`

Updates a blog.

Status codes: `200`, `401`, `403`, `404`, `422`

### DELETE `/admin/blogs/:id/permanent`

Permanently deletes the blog and featured image.

Status codes: `200`, `401`, `403`, `404`

### GET `/admin/settings`

Super Admin profile.

### PATCH `/admin/settings`

Update Super Admin profile.

### PATCH `/admin/settings/change-password`

Change Super Admin password.

## Client Admin APIs

All Client APIs require `Authorization: Bearer <CLIENT_ADMIN token>`.

Every query is automatically filtered by `loggedInUser.websiteId`.

### GET `/client/dashboard`

Returns pending blogs, published blogs, today's blogs, and recent submissions for the assigned website only.

Status codes: `200`, `401`, `403`

### GET `/client/blogs`

Returns only blogs where `websiteId = loggedInUser.websiteId`.

Query: `page`, `limit`, `search`, `category`, `tag`, `status`

Status codes: `200`, `401`, `403`, `422`

### POST `/client/blogs`

Creates a blog for the assigned website. Status is forced to `PENDING`.

Body: `title`, `authorName`, `authorEmail`, `category`, `content`, `tags`.

Status codes: `201`, `401`, `403`, `422`

### GET `/client/blogs/:id`

Only returns the blog if it belongs to the logged-in client's website.

Status codes: `200`, `401`, `403`, `404`

### PATCH `/client/blogs/:id`

Edits the blog only if it belongs to the logged-in client's website. Client cannot change `websiteId` or publish through this endpoint.

Status codes: `200`, `401`, `403`, `404`, `422`

### PATCH `/client/blogs/:id/approve`

Changes `PENDING` to `PUBLISHED` for the client's own website only.

Status codes: `200`, `400`, `401`, `403`, `404`

### DELETE `/client/blogs/:id`

Permanently deletes the client's own blog and featured image.

Status codes: `200`, `401`, `403`, `404`

### GET `/client/profile`

Client profile.

### PATCH `/client/profile`

Update client profile.

### PATCH `/client/profile/change-password`

Change client password.

## Public Website APIs

Public requests identify a website using one of:

- Header: `x-api-key: <website-api-key>`
- Header: `x-website-id: <website-id>`
- Query: `?apiKey=<website-api-key>`
- Query/body: `websiteId`

The server always filters public reads by identified website and `status = PUBLISHED`.

### GET `/blogs/latest`

Query: `limit`

Status codes: `200`, `401`

### GET `/blogs`

Query: `page`, `limit`, `search`, `category`, `tag`

Status codes: `200`, `401`, `422`

### GET `/blogs/:slug`

Status codes: `200`, `401`, `404`

### POST `/blogs/submit`

Creates a visitor submission for the identified website. Status is always `PENDING`.

Body:

```json
{
  "title": "Visitor blog",
  "authorName": "Visitor",
  "authorEmail": "visitor@example.com",
  "category": "News",
  "content": "Submitted content",
  "tags": "news,guest"
}
```

Status codes: `201`, `401`, `422`

## Upload Rules

- Field name: `featuredImage`
- Allowed image types: `jpg`, `jpeg`, `png`, `webp`
- Maximum size: `5MB`
- Stored in: `uploads/blogs`
- Images are optimized to `.webp` with Sharp

## Manual Super Admin Creation

There is no public registration endpoint.

Generate a password hash:

```bash
npm run hash-password -- your-password
```

Insert a Super Admin manually:

```json
{
  "name": "Owner",
  "email": "owner@example.com",
  "username": "owner",
  "password": "<hashed-password>",
  "role": "SUPER_ADMIN",
  "websiteId": null,
  "status": "ACTIVE"
}
```
