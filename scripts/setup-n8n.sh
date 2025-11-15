#!/bin/bash

# n8n Workflow Setup Script for CloudGuard
# This script helps you import and configure the CloudGuard workflow in n8n

echo "🚀 CloudGuard n8n Workflow Setup"
echo "================================"
echo ""

# Check if n8n is installed
if ! command -v n8n &> /dev/null; then
    echo "⚠️  n8n is not installed. Would you like to install it? (y/n)"
    read -r install_n8n
    if [ "$install_n8n" = "y" ]; then
        echo "Installing n8n globally..."
        npm install -g n8n
    else
        echo "Please install n8n first: npm install -g n8n"
        exit 1
    fi
fi

# Check if n8n is already running
if lsof -Pi :5678 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ n8n is already running on port 5678"
else
    echo "📝 Starting n8n..."
    echo "Once n8n opens in your browser, please follow these steps:"
    echo ""
    echo "1. Create an account or login"
    echo "2. Create a new workflow"
    echo "3. Come back to this terminal"
    echo ""
    echo "Press Enter to start n8n..."
    read -r
    
    # Start n8n in background
    n8n start &
    N8N_PID=$!
    
    echo "⏳ Waiting for n8n to start..."
    sleep 5
fi

echo ""
echo "📋 Import Instructions:"
echo "========================"
echo ""
echo "OPTION 1: Copy & Paste (Recommended)"
echo "------------------------------------"
echo "1. The workflow JSON has been copied to your clipboard (if pbcopy is available)"
echo "2. In n8n, click anywhere on the canvas"
echo "3. Press Ctrl+A (select all) then Ctrl+V (paste)"
echo ""

# Try to copy to clipboard if on Mac
if command -v pbcopy &> /dev/null; then
    cat lib/n8n/cloudguard-scanner-workflow.json | pbcopy
    echo "✅ Workflow JSON copied to clipboard!"
elif command -v xclip &> /dev/null; then
    cat lib/n8n/cloudguard-scanner-workflow.json | xclip -selection clipboard
    echo "✅ Workflow JSON copied to clipboard!"
else
    echo "📄 Open this file and copy the content:"
    echo "   lib/n8n/cloudguard-scanner-workflow.json"
fi

echo ""
echo "OPTION 2: Import from File"
echo "--------------------------"
echo "1. In n8n, click the menu (3 dots) → Import from File"
echo "2. Select: $(pwd)/lib/n8n/cloudguard-scanner-workflow.json"
echo ""

echo "🔐 Configure Credentials:"
echo "========================"
echo ""
echo "After importing, configure these credentials:"
echo ""
echo "1. SUPABASE (Save to Supabase node):"
echo "   - Host: $NEXT_PUBLIC_SUPABASE_URL"
echo "   - Service Role Key: Check your .env.local"
echo ""
echo "2. SLACK (Send Critical Alert node):"
echo "   - Webhook URL: $SLACK_WEBHOOK_URL"
echo ""
echo "3. EMAIL (Send Email Report node):"
echo "   - SMTP settings from your email provider"
echo ""

echo "🧪 Test the Workflow:"
echo "===================="
echo ""
echo "Run this command to test the webhook:"
echo ""
cat << 'EOF'
curl -X POST http://localhost:5678/webhook/cloud-scan-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "test-123",
    "cloud_account_id": "aws-prod",
    "provider": "aws",
    "scan_type": "security",
    "scanner_url": "http://localhost:8080",
    "user_email": "test@example.com"
  }'
EOF

echo ""
echo "📌 Important Notes:"
echo "=================="
echo "- The workflow must be ACTIVATED (toggle the Active switch)"
echo "- The webhook URL is: http://localhost:5678/webhook/cloud-scan-trigger"
echo "- Check execution logs in n8n for debugging"
echo ""

echo "🔗 n8n is running at: http://localhost:5678"
echo ""
echo "Press Ctrl+C to stop this script (n8n will continue running)"
echo ""

# Keep script running
wait