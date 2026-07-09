# Docker And VPS Deployment

This project has two Docker images:

- `frontend`: Vite React build served by Nginx.
- `backend`: Express API running on Node.js.

The frontend calls the backend through `/api`, so the same Docker setup works on localhost and on a VPS domain.

## 1. Required Backend Environment

Create `backend/.env` on the VPS. Do not commit this file.

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080,https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
UPLOAD_DIR=uploads/blogs
```

For first admin creation, temporarily add:

```env
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=change-this-password
```

## 2. Test Docker Locally

From the project root:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Open:

```text
http://localhost:8080
http://localhost:8080/api/health
```

Seed the first admin:

```bash
docker compose exec backend npm run seed:super-admin
```

Stop containers:

```bash
docker compose down
```

## 3. Deploy By Building On The VPS

On your VPS:

```bash
ssh root@your-vps-ip
apt update
apt install -y docker.io docker-compose-plugin git
systemctl enable --now docker
```

Clone or upload the project:

```bash
cd /var/www
git clone your-repo-url global-blog-cms
cd global-blog-cms
```

Create `backend/.env`, then run:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Seed admin:

```bash
docker compose exec backend npm run seed:super-admin
```

Your app will run on:

```text
http://your-vps-ip:8080
```

## 4. Deploy With Docker Hub Images

Login locally:

```bash
docker login
```

Build and push:

```bash
DOCKER_IMAGE_PREFIX=your-dockerhub-username/global-blog-cms IMAGE_TAG=latest docker compose -f docker-compose.yml -f docker-compose.registry.yml build
DOCKER_IMAGE_PREFIX=your-dockerhub-username/global-blog-cms IMAGE_TAG=latest docker compose -f docker-compose.yml -f docker-compose.registry.yml push
```

On the VPS, copy the project files or at least `docker-compose.yml`, `docker-compose.registry.yml`, and `backend/.env`, then run:

```bash
docker login
DOCKER_IMAGE_PREFIX=your-dockerhub-username/global-blog-cms IMAGE_TAG=latest docker compose -f docker-compose.yml -f docker-compose.registry.yml pull
DOCKER_IMAGE_PREFIX=your-dockerhub-username/global-blog-cms IMAGE_TAG=latest docker compose -f docker-compose.yml -f docker-compose.registry.yml up -d
```

## 5. Domain And SSL Option

Point your domain DNS `A` record to the VPS IP.

Install Nginx and Certbot on the VPS:

```bash
apt install -y nginx certbot python3-certbot-nginx
```

Create an Nginx site that proxies to Docker:

```nginx
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then:

```bash
nginx -t
systemctl reload nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

After SSL, update `backend/.env`:

```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Restart:

```bash
docker compose up -d
```

## 6. Common Commands

Rebuild after code changes:

```bash
docker compose up -d --build
```

View backend logs:

```bash
docker compose logs -f backend
```

Restart:

```bash
docker compose restart
```

Stop:

```bash
docker compose down
```

Check API health:

```bash
curl http://127.0.0.1:8080/api/health
```
