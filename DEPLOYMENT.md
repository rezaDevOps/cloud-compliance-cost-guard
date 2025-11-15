# CloudGuard Deployment Guide

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/cloud-compliance-cost-guard-claude.git
cd cloud-compliance-cost-guard-claude
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migration:
   - Go to SQL Editor in Supabase Dashboard
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

3. Enable Authentication:
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates

4. Get your credentials:
   - Settings → API
   - Copy `URL` and `anon public` key to `.env.local`

### 4. Setup n8n Workflows

Option A: Local n8n
```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access at http://localhost:5678
# Import workflow from lib/n8n/security-scanner-workflow.json
```

Option B: Docker n8n
```bash
docker-compose up n8n
```

### 5. Start Development Server

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000
```

## 🐳 Docker Deployment

### Full Stack with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# - App: http://localhost:3000
# - n8n: http://localhost:5678
```

### Production Docker Build
```bash
# Build production image
docker build -t cloudguard:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env.local \
  cloudguard:latest
```

## ☁️ Cloud Deployment

### Vercel (Recommended for Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Add environment variables in Vercel Dashboard

### AWS Deployment

1. **Frontend on AWS Amplify:**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

2. **Scanner Service on Lambda:**
```bash
cd scanner
GOOS=linux GOARCH=amd64 go build -o main
zip scanner.zip main
aws lambda create-function \
  --function-name cloudguard-scanner \
  --runtime go1.x \
  --handler main \
  --zip-file fileb://scanner.zip
```

3. **n8n on EC2:**
```bash
# Use the provided docker-compose.yml
ssh ec2-user@your-instance
docker-compose up -d n8n
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env.local` to git
- Use different credentials for dev/staging/prod
- Rotate API keys regularly
- Use AWS Secrets Manager or similar for production

### Database Security
- Enable RLS (Row Level Security) in Supabase
- Use service role key only on backend
- Implement proper user permissions
- Regular backups

### API Security
- Implement rate limiting
- Use CORS properly
- Validate all inputs
- Log security events

## 📊 Monitoring

### Application Monitoring
```javascript
// Add to next.config.ts
module.exports = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
}
```

### CloudWatch Integration
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### Health Checks
```javascript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check NEXT_PUBLIC_SUPABASE_URL format
   - Verify anon key is correct
   - Check network/firewall settings

2. **n8n Webhook Not Triggering**
   - Verify N8N_WEBHOOK_URL in .env
   - Check n8n is running
   - Test webhook manually with curl

3. **AWS Scanner Permissions**
   - Ensure IAM role has necessary permissions
   - Check AWS credentials in environment
   - Verify region settings

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [AWS SDK for Go](https://docs.aws.amazon.com/sdk-for-go/)

## 🤝 Support

For issues or questions:
- GitHub Issues: [github.com/cloudguard/issues](https://github.com/cloudguard/issues)
- Email: support@cloudguard.io
- Documentation: [docs.cloudguard.io](https://docs.cloudguard.io)

---

© 2024 CloudGuard - Cloud Compliance & Cost Guard