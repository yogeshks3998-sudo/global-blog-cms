# Local And Production Setup

## Local

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
npm run dev
```

Frontend local `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

Backend local `.env` should include local frontend origins:

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000
```

## Production

VPS backend environment:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_long_secret
CORS_ORIGIN=http://blog.srisumerusuraksha.in
```

VPS frontend environment:

```env
VITE_API_BASE_URL=/api
```

After changing environment variables, redeploy the affected service.
