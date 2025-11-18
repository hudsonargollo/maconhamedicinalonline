# Deployment Guide

This guide covers deploying the Maconha Medicinal platform to GitHub and Cloudflare Pages.

## Prerequisites

Before deploying, ensure you have:

- A GitHub account
- A Cloudflare account (free tier works)
- Git installed locally
- Node.js 18+ installed
- Completed the [Environment Setup](./SETUP.md)

## Part 1: GitHub Setup

### 1. Create a GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in repository details:
   - **Repository name**: `maconhamedicinal-online` (or your preferred name)
   - **Description**: "Telemedicine platform for medical cannabis consultations"
   - **Visibility**: Private (recommended) or Public
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### 2. Initialize Git and Push to GitHub

```bash
# Navigate to your project directory
cd maconhamedicinal_site

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Auth and database foundation"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/maconhamedicinal-online.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Verify GitHub Push

1. Go to your GitHub repository
2. Verify all files are present
3. Check that `.env.local` is NOT in the repository (it should be gitignored)

## Part 2: Cloudflare Pages Setup

### 1. Create Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up for a free account
3. Verify your email

### 2. Get Cloudflare Credentials

#### Get Account ID:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on "Workers & Pages" in the left sidebar
3. Your Account ID is displayed on the right side
4. Copy and save it

#### Get API Token:
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Click "Use template" next to "Edit Cloudflare Workers"
4. Configure the token:
   - **Token name**: `GitHub Actions Deploy`
   - **Permissions**: 
     - Account → Cloudflare Pages → Edit
   - **Account Resources**: Include → Your account
5. Click "Continue to summary"
6. Click "Create Token"
7. **Copy the token immediately** (you won't see it again)

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add the following secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `CLOUDFLARE_API_TOKEN` | Your API token | From step 2 above |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID | From step 2 above |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://maconhamedicinal-site.pages.dev` (or custom domain) |

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` should NOT be added to GitHub secrets for static exports. It should only be used locally or in server environments.

### 4. Create Cloudflare Pages Project

You have two options:

#### Option A: Automatic (via GitHub Actions)

The GitHub Actions workflow will automatically create the project on first push. Just push your code:

```bash
git add .
git commit -m "Configure Cloudflare Pages deployment"
git push
```

#### Option B: Manual (via Cloudflare Dashboard)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Workers & Pages"
3. Click "Create application" → "Pages" → "Connect to Git"
4. Select your GitHub repository
5. Configure build settings:
   - **Project name**: `maconhamedicinal-site`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
6. Add environment variables (same as GitHub secrets above)
7. Click "Save and Deploy"

## Part 3: Deploy Using Wrangler CLI (Alternative)

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

### 3. Deploy from Local Machine

```bash
# Navigate to project directory
cd maconhamedicinal_site

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=maconhamedicinal-site
```

### 4. Deploy to Production

```bash
# Deploy to production
wrangler pages deploy out --project-name=maconhamedicinal-site --branch=main
```

## Part 4: Verify Deployment

### 1. Check GitHub Actions

1. Go to your GitHub repository
2. Click "Actions" tab
3. You should see a workflow run for "Deploy to Cloudflare Pages"
4. Click on the workflow to see details
5. Verify all steps completed successfully

### 2. Check Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Workers & Pages"
3. Click on your project (`maconhamedicinal-site`)
4. You should see your deployment
5. Click "Visit site" to view your deployed application

### 3. Test Your Deployment

Your site will be available at:
- **Production**: `https://maconhamedicinal-site.pages.dev`
- **Preview** (for PRs): `https://[branch].maconhamedicinal-site.pages.dev`

Test the following:
1. Visit the homepage
2. Try the registration endpoint: `POST /api/auth/register`
3. Try the profile endpoint: `GET /api/me`
4. Check browser console for errors

## Part 5: Custom Domain (Optional)

### 1. Add Custom Domain in Cloudflare

1. Go to your Cloudflare Pages project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain: `maconhamedicinal.clubemkt.digital`
5. Follow the DNS configuration instructions

### 2. Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` in both:
- GitHub Secrets
- Cloudflare Pages environment variables

Set it to your custom domain: `https://maconhamedicinal.clubemkt.digital`

### 3. Update Supabase Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your custom domain to:
   - **Site URL**: `https://maconhamedicinal.clubemkt.digital`
   - **Redirect URLs**: Add your domain

## Deployment Workflow

### Automatic Deployments

The GitHub Actions workflow automatically deploys:

- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

### Manual Deployments

```bash
# Deploy from local machine
cd maconhamedicinal_site
npm run build
wrangler pages deploy out --project-name=maconhamedicinal-site
```

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production
```env
NEXT_PUBLIC_APP_URL=https://maconhamedicinal-site.pages.dev
NODE_ENV=production
```

## Troubleshooting

### Build Fails on Cloudflare

**Issue**: Build fails with "Module not found" or dependency errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Issue**: API calls fail with "Invalid API key"

**Solution**:
1. Verify secrets are set in GitHub repository settings
2. Verify environment variables are set in Cloudflare Pages
3. Redeploy after adding/updating variables
4. Check variable names match exactly (including `NEXT_PUBLIC_` prefix)

### GitHub Actions Fails

**Issue**: Workflow fails with "Authentication failed"

**Solution**:
1. Verify `CLOUDFLARE_API_TOKEN` is correct
2. Verify `CLOUDFLARE_ACCOUNT_ID` is correct
3. Check token has correct permissions (Cloudflare Pages → Edit)
4. Token may have expired - create a new one

### Deployment Succeeds but Site Shows Errors

**Issue**: Site deploys but shows runtime errors

**Solution**:
1. Check browser console for errors
2. Verify Supabase credentials are correct
3. Check Supabase project is active
4. Verify CORS settings in Supabase allow your domain
5. Check Cloudflare Pages logs for server errors

### API Routes Not Working

**Issue**: API routes return 404 or don't work

**Solution**:
- **Important**: Cloudflare Pages with static export (`output: 'export'`) does NOT support Next.js API routes
- API routes need a server runtime
- Options:
  1. Deploy API routes separately as Cloudflare Workers
  2. Use Supabase Edge Functions instead
  3. Deploy to Vercel (which supports Next.js API routes)

**Recommended**: For this project, consider deploying to Vercel instead of Cloudflare Pages, as it fully supports Next.js API routes.

## Alternative: Deploy to Vercel

If you need API route support, Vercel is recommended:

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
cd maconhamedicinal_site
vercel
```

### 3. Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### 4. Deploy to Production

```bash
vercel --prod
```

Vercel automatically supports:
- Next.js API routes
- Server-side rendering
- Automatic HTTPS
- Custom domains
- Preview deployments for PRs

## Monitoring and Maintenance

### Check Deployment Status

```bash
# List deployments
wrangler pages deployment list --project-name=maconhamedicinal-site

# View deployment logs
wrangler pages deployment tail --project-name=maconhamedicinal-site
```

### Rollback Deployment

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on your project
3. Click "Deployments"
4. Find a previous successful deployment
5. Click "..." → "Rollback to this deployment"

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test locally
npm run build
npm run test

# Deploy
git add .
git commit -m "Update dependencies"
git push
```

## Security Checklist

Before deploying to production:

- [ ] All secrets are stored in GitHub Secrets / Cloudflare environment variables
- [ ] `.env.local` is in `.gitignore` and NOT committed
- [ ] Supabase RLS policies are enabled and tested
- [ ] CORS is configured in Supabase for your domain
- [ ] Email confirmations are enabled in Supabase Auth
- [ ] Rate limiting is configured
- [ ] HTTPS is enforced (automatic with Cloudflare/Vercel)
- [ ] Custom domain is configured (optional)
- [ ] Monitoring and error tracking is set up

## Next Steps

After successful deployment:

1. Test all API endpoints in production
2. Monitor error logs and performance
3. Set up custom domain (if applicable)
4. Configure monitoring and alerts
5. Set up backup strategy for Supabase database
6. Document any production-specific configurations

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

