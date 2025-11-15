#!/bin/bash

# Slack Webhook Test Script for CloudGuard
# Usage: ./test-slack.sh [webhook_url]

echo "🔔 CloudGuard Slack Integration Test"
echo "===================================="

# Check if webhook URL is provided as argument or in environment
if [ -n "$1" ]; then
    WEBHOOK_URL="$1"
elif [ -n "$SLACK_WEBHOOK_URL" ]; then
    WEBHOOK_URL="$SLACK_WEBHOOK_URL"
else
    echo "❌ Error: No webhook URL provided"
    echo "Usage: ./test-slack.sh YOUR_WEBHOOK_URL"
    echo "Or set SLACK_WEBHOOK_URL environment variable"
    exit 1
fi

echo "📍 Testing webhook URL: ${WEBHOOK_URL:0:50}..."
echo ""

# Test 1: Simple message
echo "Test 1: Sending simple test message..."
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"✅ CloudGuard Slack integration is working!"}' \
    "$WEBHOOK_URL" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Simple message sent successfully"
else
    echo "❌ Failed to send simple message"
    exit 1
fi

echo ""

# Test 2: Security alert with attachments
echo "Test 2: Sending security alert..."
curl -X POST -H 'Content-type: application/json' \
    --data '{
        "text": "🚨 *Security Alert from CloudGuard*",
        "attachments": [
            {
                "color": "danger",
                "fields": [
                    {
                        "title": "Severity",
                        "value": "CRITICAL",
                        "short": true
                    },
                    {
                        "title": "Account",
                        "value": "AWS Production",
                        "short": true
                    },
                    {
                        "title": "Issue",
                        "value": "S3 Bucket found with public access",
                        "short": false
                    },
                    {
                        "title": "Resource",
                        "value": "`s3://my-public-bucket`",
                        "short": false
                    }
                ],
                "footer": "CloudGuard Security Scanner",
                "ts": '$(date +%s)'
            }
        ]
    }' \
    "$WEBHOOK_URL" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Security alert sent successfully"
else
    echo "❌ Failed to send security alert"
fi

echo ""

# Test 3: Cost optimization notification
echo "Test 3: Sending cost optimization notification..."
curl -X POST -H 'Content-type: application/json' \
    --data '{
        "text": "💰 *Cost Optimization Opportunity*",
        "attachments": [
            {
                "color": "warning",
                "fields": [
                    {
                        "title": "Potential Savings",
                        "value": "€1,234/month",
                        "short": true
                    },
                    {
                        "title": "Resources",
                        "value": "12 idle instances",
                        "short": true
                    }
                ],
                "footer": "CloudGuard Cost Analyzer"
            }
        ]
    }' \
    "$WEBHOOK_URL" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Cost notification sent successfully"
else
    echo "❌ Failed to send cost notification"
fi

echo ""
echo "===================================="
echo "✅ All tests completed!"
echo ""
echo "Check your Slack channel for the test messages."
echo "If you see all three messages, your integration is working correctly!"