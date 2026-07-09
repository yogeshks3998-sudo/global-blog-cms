# CI/CD Setup

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

On every push to `main`, it:

1. Installs frontend dependencies.
2. Builds the Vite frontend.
3. Installs backend dependencies.
4. SSHs into the VPS.
5. Pulls the latest `main`.
6. Rebuilds and restarts Docker Compose.
7. Checks `/api/health`.

## GitHub Secrets

In GitHub, open:

`Repo > Settings > Secrets and variables > Actions > New repository secret`

Add:

```text
VPS_HOST=213.199.41.211
VPS_USER=root
VPS_PORT=22
VPS_SSH_KEY=your_private_ssh_key
```

`VPS_SSH_KEY` must be the private key that can SSH into the VPS. The matching public key must be in:

```text
/root/.ssh/authorized_keys
```

## VPS Requirements

The VPS must already have the project cloned here:

```text
/var/www/global-blog-cms
```

The VPS must also have:

```text
/var/www/global-blog-cms/backend/.env
```

Do not commit `backend/.env` to GitHub.

## First-Time SSH Key Setup

On your local computer, create a deploy key:

```bash
ssh-keygen -t ed25519 -C "github-actions-global-blog-cms" -f global-blog-cms-deploy-key
```

Copy `global-blog-cms-deploy-key.pub` content into the VPS:

```bash
nano /root/.ssh/authorized_keys
```

Copy `global-blog-cms-deploy-key` private key content into GitHub secret:

```text
VPS_SSH_KEY
```

## Deploy Manually

In GitHub:

`Actions > Deploy to VPS > Run workflow`

## Important

Docker frontend is bound to localhost only:

```yaml
ports:
  - "127.0.0.1:${FRONTEND_PORT:-8080}:80"
```

That keeps the app reachable only through the hosting panel/Nginx reverse proxy.
