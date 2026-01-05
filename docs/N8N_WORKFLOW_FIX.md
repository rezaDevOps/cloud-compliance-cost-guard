# n8n Workflow Fix: HTTP Request Node for Supabase Updates

## Problem Identified

The n8n workflow had a **missing HTTP request node** to update Supabase after the scanner API returned findings. The workflow was:

1. ✅ CloudGuard Webhook → Call Scanner API (working)
2. ❌ **Missing: Update Supabase** (scan results never saved to database!)
3. ❌ Process Scan Results → Check Critical → Send Slack Alert (failed due to missing data)

## Solution Applied

Added a new **"Update Supabase Scan Results"** HTTP request node that:
- Makes a PATCH request to Supabase REST API
- Updates the `scan_results` table by `scan_id`
- Sets status to `'completed'`
- Stores findings, severity_counts, and recommendations

### Updated Workflow Flow

```
1. CloudGuard Webhook (receives scan request)
   ↓
2. Call Scanner API (performs security scan)
   ↓
3. Update Supabase Scan Results (NEW! saves findings to database)
   ↓
4. Process Scan Results (calculates metrics)
   ↓
5. Check Critical (evaluates if critical findings exist)
   ↓
6. Send Slack Alert (sends notification if critical)
```

## Configuration Required

### Environment Variables in n8n

You must configure these environment variables in n8n:

```bash
# Supabase Configuration (REQUIRED for the fix to work)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Slack Configuration (Optional, for alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### How to Set Environment Variables in n8n

#### Option 1: Docker Compose
Edit your `docker-compose.yml`:
```yaml
services:
  n8n:
    environment:
      - SUPABASE_URL=https://your-project.supabase.co
      - SUPABASE_SERVICE_KEY=your-service-role-key
      - SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

#### Option 2: Local n8n
Set in your shell before starting n8n:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your-service-role-key
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
npx n8n
```

#### Option 3: n8n Cloud
1. Go to Settings → Environment Variables
2. Add each variable with its value
3. Restart workflow

### Getting Your Supabase Credentials

1. **SUPABASE_URL**:
   - Go to your Supabase project dashboard
   - Click "Settings" → "API"
   - Copy "Project URL"

2. **SUPABASE_SERVICE_KEY**:
   - Same page as above
   - Copy "service_role" key (NOT the anon key!)
   - ⚠️ **Keep this secret!** It bypasses Row Level Security

## Import the Fixed Workflow

1. Open n8n interface (http://localhost:5678)
2. Click "+" → "Import from File"
3. Select `/lib/n8n/cloudguard-final.json`
4. The workflow will be imported with the fix
5. **Important**: Click "Active" toggle to enable the workflow

## Testing the Workflow

### Step 1: Verify Environment Variables
```bash
# In n8n UI, go to Settings → Variables
# Confirm SUPABASE_URL and SUPABASE_SERVICE_KEY are set
```

### Step 2: Test with curl
```bash
curl -X POST http://localhost:5678/webhook/cloudguard-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "test-scan-123",
    "cloud_account_id": "test-account-456",
    "provider": "aws",
    "scan_type": "security",
    "credentials": {
      "access_key_id": "test",
      "secret_access_key": "test"
    }
  }'
```

### Step 3: Verify in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Open `scan_results` table
3. Find the record with `id = 'test-scan-123'`
4. Verify these fields are updated:
   - `status` = `'completed'`
   - `findings` = array of security findings
   - `severity_counts` = object with counts by severity

### Step 4: Check n8n Execution Log

1. In n8n, click "Executions" in the left sidebar
2. Find your test execution
3. Verify all nodes show green checkmarks:
   - ✅ CloudGuard Webhook
   - ✅ Call Scanner API
   - ✅ **Update Supabase Scan Results** (the new node!)
   - ✅ Process Scan Results
   - ✅ Check Critical
   - ✅ Send Slack Alert (if critical findings exist)

## Troubleshooting

### Error: "SUPABASE_URL is undefined"
**Problem**: Environment variables not set in n8n

**Solution**:
1. Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in n8n environment
2. Restart n8n
3. Deactivate and reactivate the workflow

### Error: "Failed to update scan_results"
**Problem**: Supabase service key is incorrect or doesn't have permissions

**Solution**:
1. Verify you're using the **service_role** key (not anon key)
2. Check the key in Supabase Dashboard → Settings → API
3. Ensure the `scan_results` table exists

### Error: "scan_id not found"
**Problem**: The webhook payload doesn't include `scan_id`

**Solution**:
1. Ensure your `/api/scan` route creates a scan record first
2. The webhook payload must include the `scan_id` field
3. Check line 69 in `/app/api/scan/route.ts`

### HTTP Request Node Shows Red X
**Problem**: Supabase API returned an error

**Solution**:
1. Click the red node to see error details
2. Check if `scan_id` exists in database
3. Verify the PATCH request URL format
4. Ensure Supabase REST API is enabled

## What Changed in the Code

### File: `/lib/n8n/cloudguard-final.json`

**Added Node** (lines 43-93):
```json
{
  "name": "Update Supabase Scan Results",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "PATCH",
    "url": "{{ $env.SUPABASE_URL }}/rest/v1/scan_results",
    "queryParameters": {
      "parameters": [
        { "name": "id", "value": "eq.{{ scan_id }}" }
      ]
    },
    "jsonBody": {
      "status": "completed",
      "findings": [...],
      "severity_counts": {...}
    }
  }
}
```

**Updated Connections**:
- `Call Scanner API` → `Update Supabase Scan Results` (new!)
- `Update Supabase Scan Results` → `Process Scan Results` (new!)

## Next Steps

1. ✅ Import the fixed workflow from `cloudguard-final.json`
2. ✅ Set environment variables in n8n
3. ✅ Activate the workflow
4. ✅ Test with a real cloud account scan
5. Monitor Supabase to confirm findings are being saved

## Additional Notes

- The scanner service must be running on port 8080
- The workflow uses Supabase REST API (not Supabase node) for better control
- The `service_role` key bypasses RLS, which is needed for n8n updates
- Critical findings will trigger Slack alerts (if `SLACK_WEBHOOK_URL` is set)
