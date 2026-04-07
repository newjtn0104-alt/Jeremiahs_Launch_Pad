# Deployment Guide

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add inventory webhook and database"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/jeremiahs-launchpad.git

# Push
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables:
   - `DATABASE_URL` = `file:./dev.db`
4. Deploy

## Step 3: Configure Tally Webhook

Once deployed, your webhook URL will be:
```
https://your-project.vercel.app/api/inventory-webhook
```

In Tally:
1. Go to your form → Settings → Webhooks
2. Add webhook URL: `https://your-project.vercel.app/api/inventory-webhook`
3. Save

## Local Development

For local testing, use ngrok to expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Expose localhost
ngrok http 3000

# Use the https URL + /api/inventory-webhook in Tally
```

## Database Note

SQLite works for local dev, but for production on Vercel, you should use:
- **Vercel Postgres** (recommended)
- **Neon**
- **Supabase**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
