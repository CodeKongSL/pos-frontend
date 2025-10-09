# Deployment Guide

## Vercel Deployment

### Environment Variables

Make sure to set the following environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://my-go-backend.onrender.com` | Production |

### Troubleshooting

If you encounter the error `TypeError: t.map is not a function`:

1. Check that the environment variable `VITE_API_URL` is properly set in Vercel
2. Verify that your backend API is responding with the correct format
3. Check the browser console for detailed error logs
4. The app now includes better error handling to prevent crashes

### Local Development

For local development, use:
```bash
npm run dev
```

The app will use the `.env` file for local development and `.env.production` for production builds.

### API Response Format

The backend should return data in this format:
```json
{
  "data": [...], // Array of products
  "per_page": 15,
  "next_cursor": "string|null",
  "has_more": boolean
}
```

The app now handles various response formats gracefully.