# Vercel Deployment Guide for CloudGuard

## 🚀 Quick Deployment Steps

### 1. Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js settings
4. **Before deploying**, add the environment variables below

### 2. Environment Variables

Add these in **Project Settings → Environment Variables**:

#### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# n8n Configuration (Hetzner hosted)
N8N_WEBHOOK_URL=https://n8n.awsdevzone.info/webhook/cloudguard-webhook
N8N_API_KEY=your-n8n-api-key

# AWS Credentials (for cloud scanning)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-west-2

# OpenAI API (for AI recommendations)
OPENAI_API_KEY=your-openai-api-key

# Slack Alerts
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

**📝 Note**: Copy the actual values from your `.env.local` file when setting up Vercel.

#### Optional Variables (for Azure/GCP)

```bash
# Azure (optional)
AZURE_TENANT_ID=your_azure_tenant_id_here
AZURE_CLIENT_ID=your_azure_client_id_here
AZURE_CLIENT_SECRET=your_azure_client_secret_here

# GCP (optional)
GCP_PROJECT_ID=your-gcp-project
GCP_SERVICE_ACCOUNT_KEY=your-gcp-service-account-key-json
```

### 3. Environment Selection

For each environment variable, select which environments it applies to:
- ✅ **Production** (required)
- ✅ **Preview** (recommended for testing)
- ⬜ **Development** (optional, use local `.env.local` instead)

### 4. Deploy

Click **"Deploy"** and wait for the build to complete.

## 📋 Post-Deployment Checklist

After successful deployment:

1. **Update App URL** (if needed):
   - Go back to Environment Variables
   - Add or update: `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
   - Redeploy

2. **Test the Integration**:
   - Visit your deployed app
   - Sign up / Log in
   - Try triggering a cloud scan
   - Check if n8n receives the webhook

3. **Verify n8n Connection**:
   - Open your n8n: https://n8n.awsdevzone.info
   - Check execution history after triggering a scan
   - Verify scan results appear in Supabase

4. **Update Supabase Redirects** (if using auth):
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to allowed redirect URLs

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all TypeScript errors are fixed
- Run `npm run build` locally first

### API Routes Not Working
- Verify environment variables are set correctly
- Check API route logs in Vercel Function logs
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

### n8n Not Receiving Webhooks
- Verify `N8N_WEBHOOK_URL` is correct
- Check n8n workflow is "Active"
- Test webhook manually with curl:
  ```bash
  curl -X POST https://your-app.vercel.app/api/scan \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"provider":"aws","scan_type":"security"}'
  ```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- **main branch** → Production deployment
- **other branches** → Preview deployments

## 📝 Custom Domain (Optional)

To use a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## 🔐 Security Best Practices

- ✅ All sensitive keys are environment variables (not in code)
- ✅ `.env.local` is in `.gitignore`
- ✅ Use Vercel's environment variable encryption
- ⚠️ Rotate API keys regularly
- ⚠️ Monitor usage in Vercel dashboard

## 📊 Monitoring

Monitor your deployment:
- **Vercel Dashboard**: Build status, function logs, analytics
- **Supabase Dashboard**: Database queries, auth events
- **n8n Dashboard**: Workflow executions, errors

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
