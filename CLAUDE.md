# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CloudGuard is a SaaS platform for SMBs providing automated cloud cost monitoring, security scanning, and compliance reporting across AWS, Azure, and GCP. The architecture combines:

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Next.js API Routes for web endpoints
- **Scanner Service**: Go-based microservice for cloud security scanning
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Workflow Automation**: n8n for orchestrating scan workflows
- **AI Integration**: OpenAI API for cost optimization recommendations

## Development Commands

### Core Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Scanner Service (Go)
```bash
# Run scanner locally
cd scanner
go run main.go

# Build scanner
go build -o scanner main.go

# Build for Lambda
GOOS=linux GOARCH=amd64 go build -o main
```

### Docker
```bash
# Build and run all services
docker-compose up --build

# Run only n8n
docker-compose up n8n

# Build scanner image
docker build -t cloudguard-scanner ./scanner
```

### Supabase
```bash
# Apply migrations (via Supabase dashboard)
# SQL Editor → Copy from supabase/migrations/001_initial_schema.sql → Execute
```

## Architecture Overview

### Multi-Service Architecture

The application follows a distributed architecture:

1. **Next.js App**: User-facing web application and API routes
2. **Go Scanner**: Independent microservice that performs actual cloud scanning
3. **n8n**: Orchestration layer connecting Next.js → Scanner → Supabase
4. **Supabase**: Database and authentication layer

### Data Flow for Cloud Scans

```
User Action (Dashboard)
  → POST /api/scan
  → Create scan record in Supabase (status: 'pending')
  → Trigger n8n webhook
  → n8n calls Go Scanner service
  → Scanner performs AWS/Azure/GCP checks
  → Returns findings to n8n
  → n8n updates Supabase (status: 'completed')
  → n8n sends alerts (Slack/Email) if critical findings exist
```

### Database Schema

All tables in [lib/supabase/types.ts](lib/supabase/types.ts) and [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql):

- **organizations**: Multi-tenant organization structure
- **users**: Extends Supabase auth.users with organization relationship and roles
- **cloud_accounts**: Stores cloud provider credentials (encrypted in JSONB)
- **scan_results**: Security/cost/compliance scan findings
- **compliance_reports**: Generated DSGVO/ISO27001/SOC2 reports
- **alerts**: Security/cost alerts with resolution tracking
- **alert_configurations**: Slack/Email/Teams notification settings

**Important**: All tables use Row Level Security (RLS). Users can only access data from their organization.

### Authentication Pattern

- Supabase handles auth with email/password
- Client-side: Use `createClient()` from [lib/supabase/client.ts](lib/supabase/client.ts)
- Server-side: Use `await createClient()` from [lib/supabase/server.ts](lib/supabase/server.ts)
- API routes check `auth.getUser()` before operations
- RLS policies enforce organization-level data isolation

### Component Organization

- [components/ui/](components/ui/): shadcn/ui base components (Button, Card, Input, etc.)
- [components/landing/](components/landing/): Landing page sections (Hero, Features, Pricing, etc.)
- [components/dashboard/](components/dashboard/): Dashboard-specific components (Sidebar, Metrics, Charts)
- [components/layout/](components/layout/): Shared layout components (Navigation, Footer)

### Scanner Service (Go)

The scanner in [scanner/main.go](scanner/main.go) is a standalone HTTP service:

- Exposes `/scan` POST endpoint
- Performs security checks on AWS (EC2, S3, IAM)
- Returns structured findings with severity levels (critical, high, medium, low)
- Currently implements AWS scanning; Azure/GCP are TODOs
- Designed to run as AWS Lambda or in Docker

**AWS Security Checks**:
- EC2: Public IP exposure, unencrypted EBS volumes
- S3: Public bucket access, missing encryption
- IAM: MFA not enabled on root/users

### n8n Workflow Integration

n8n workflow JSON files in [lib/n8n/](lib/n8n/):

- Import workflow via n8n UI (see [docs/N8N_SETUP.md](docs/N8N_SETUP.md))
- Webhook URL: `http://localhost:5678/webhook/cloud-scan-trigger`
- Environment variables: `N8N_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- Must be set to "Active" to receive webhook triggers

## Environment Variables

Copy [.env.example](.env.example) to `.env.local` and configure:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)
- `N8N_WEBHOOK_URL`: n8n webhook endpoint for scan triggers

### Optional
- `OPENAI_API_KEY`: For AI-powered cost recommendations
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`: For scanner service
- `SLACK_WEBHOOK_URL`, `SLACK_CHANNEL`: For alert notifications
- `AZURE_*`, `GCP_*`: For multi-cloud support (not yet implemented)

## Key Implementation Patterns

### Creating New API Routes

Follow the pattern in [app/api/scan/route.ts](app/api/scan/route.ts):
1. Create server-side Supabase client: `const supabase = await createClient()`
2. Check authentication: `const { data: { user }, error } = await supabase.auth.getUser()`
3. Validate input and check user's organization access
4. Perform operations (database writes, external API calls)
5. Return JSON responses with proper status codes

### Adding New Scan Types

To add new scan types (beyond security/cost/compliance):
1. Update `scan_type` enum in [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)
2. Update TypeScript types in [lib/supabase/types.ts](lib/supabase/types.ts)
3. Implement scanner logic in [scanner/main.go](scanner/main.go)
4. Add UI handling in dashboard components

### Working with Supabase Types

The [lib/supabase/types.ts](lib/supabase/types.ts) file defines TypeScript types matching the database schema. When making database changes:
1. Update SQL migration in `supabase/migrations/`
2. Execute migration in Supabase dashboard
3. Update TypeScript types to match
4. Update API routes and components using those types

## Testing

### Local Development Setup

1. Start Supabase (via cloud or local)
2. Run migrations in Supabase SQL editor
3. Start n8n: `npx n8n` (or `docker-compose up n8n`)
4. Import n8n workflow from [lib/n8n/cloudguard-final.json](lib/n8n/cloudguard-final.json)
5. Configure n8n credentials (Supabase, Slack)
6. Start scanner service: `cd scanner && go run main.go`
7. Start Next.js: `npm run dev`
8. Access app at http://localhost:3000

### Testing Scans

Test the scan workflow end-to-end:
```bash
curl -X POST http://localhost:5678/webhook/cloud-scan-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "test-123",
    "cloud_account_id": "test-account",
    "provider": "aws",
    "scan_type": "security"
  }'
```

## Deployment

### Vercel (Frontend)
```bash
vercel --prod
```
Add environment variables in Vercel dashboard.

### Scanner Service
- AWS Lambda: Build with `GOOS=linux GOARCH=amd64 go build`, zip, and deploy
- Docker: Use [scanner/Dockerfile](scanner/Dockerfile)
- Update `N8N_WEBHOOK_URL` to point to deployed scanner

### n8n
- Deploy on EC2, DigitalOcean, or n8n Cloud
- Update workflow scanner URL to production endpoint
- Configure production credentials

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Common Gotchas

- **RLS Policies**: If queries return empty results, check that user's `organization_id` is properly set in the `users` table
- **Supabase Client**: Always use `await createClient()` in Server Components/API Routes (not the browser client)
- **n8n Active State**: Workflows must be toggled "Active" to receive webhook triggers
- **Scanner Credentials**: The Go scanner expects AWS credentials via environment variables or IAM roles
- **CORS**: If calling APIs from different domains, configure CORS in API routes
- **Cookie Issues**: Next.js 15 requires `await cookies()` - see [lib/supabase/server.ts](lib/supabase/server.ts)

## Pricing Tiers

Implemented in landing page components:
- **Basic**: €99/month - 1 account, monthly reports
- **Pro**: €299/month - 3 accounts, AI optimization, alerts
- **Enterprise**: €499/month - Unlimited accounts, multi-cloud, API access

Subscription logic not yet implemented - add Stripe integration for payments.
