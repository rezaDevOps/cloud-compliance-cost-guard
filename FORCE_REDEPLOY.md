# Force Redeploy to Fix 404 API Error

## Problem
Getting `404 Not Found` when calling `/api/accounts` endpoint. This means Vercel deployed an old version of the code before the API routes were added.

## Solution: Force Redeploy

### Option 1: Trigger Redeploy via Git (Recommended)

```bash
# Make a small change to force redeploy
git commit --allow-empty -m "Force redeploy - fix API routes 404"
git push origin main
```

Vercel will automatically detect the push and redeploy with the latest code including all API routes.

### Option 2: Redeploy via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click on **"Deployments"** tab
4. Find the latest deployment
5. Click the **three dots (⋮)** menu
6. Select **"Redeploy"**
7. Make sure "Use existing Build Cache" is **UNCHECKED**
8. Click **"Redeploy"**

### Option 3: Manual Build Test

Test the build locally first:

```bash
npm run build
npm run start
```

Then visit: http://localhost:3000/api/accounts

You should get a 401 (Unauthorized) response, not 404. This means the route works.

## Verification

After redeployment, check:

1. **API Route exists**:
   ```bash
   curl -I https://your-app.vercel.app/api/accounts
   ```
   Should return: `401 Unauthorized` (not 404)

2. **From browser console**:
   ```javascript
   fetch('/api/accounts').then(r => console.log(r.status))
   ```
   Should log: `401` (not 404)

## Why This Happened

The `/api/accounts` route was added in a recent commit, but Vercel deployed an earlier version of the code. A redeploy will pick up all the latest API routes.

## Files That Should Be Deployed

- `app/api/accounts/route.ts` - Cloud accounts management
- `app/api/scan/route.ts` - Scan triggering
- `app/api/notifications/slack/route.ts` - Slack notifications

All these files exist in the repository and should be deployed to Vercel.
