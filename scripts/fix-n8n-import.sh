#!/bin/bash

# Fix n8n Workflow Import Script
echo "🔧 n8n Workflow Import Fixer"
echo "============================"
echo ""

# Create a clean workflow JSON that definitely works
cat > /tmp/cloudguard-n8n.json << 'EOF'
{
  "name": "CloudGuard Scanner",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "scan-webhook",
        "options": {}
      },
      "id": "webhook1",
      "name": "Scan Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [300, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:8080/scan",
        "method": "POST",
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "={{ JSON.stringify($json) }}",
        "options": {}
      },
      "id": "http1",
      "name": "Call Scanner",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [500, 300]
    },
    {
      "parameters": {
        "functionCode": "const items = $input.all();\nreturn items.map(item => {\n  const findings = item.json.findings || [];\n  let critical = 0, high = 0, medium = 0, low = 0;\n  \n  findings.forEach(f => {\n    switch(f.severity) {\n      case 'critical': critical++; break;\n      case 'high': high++; break;\n      case 'medium': medium++; break;\n      case 'low': low++; break;\n    }\n  });\n  \n  return {\n    json: {\n      ...item.json,\n      severityCounts: { critical, high, medium, low },\n      hasCritical: critical > 0\n    }\n  };\n});"
      },
      "id": "function1",
      "name": "Process Results",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [700, 300]
    }
  ],
  "connections": {
    "Scan Webhook": {
      "main": [[{"node": "Call Scanner", "type": "main", "index": 0}]]
    },
    "Call Scanner": {
      "main": [[{"node": "Process Results", "type": "main", "index": 0}]]
    }
  }
}
EOF

echo "✅ Created fixed workflow at: /tmp/cloudguard-n8n.json"
echo ""
echo "📋 Import Instructions:"
echo "----------------------"
echo ""
echo "METHOD 1: Direct Paste (Recommended)"
echo "1. Copy this command and run it:"
echo "   cat /tmp/cloudguard-n8n.json | pbcopy"
echo ""
echo "2. In n8n:"
echo "   - Create new workflow"
echo "   - Press Ctrl+V to paste"
echo ""
echo "METHOD 2: Manual Copy"
echo "1. Open the file:"
echo "   cat /tmp/cloudguard-n8n.json"
echo ""
echo "2. Select all text and copy"
echo "3. Paste in n8n"
echo ""
echo "METHOD 3: Use n8n CLI"
echo "   n8n import:workflow --input=/tmp/cloudguard-n8n.json"
echo ""

# Try to copy to clipboard
if command -v pbcopy &> /dev/null; then
    cat /tmp/cloudguard-n8n.json | pbcopy
    echo "✅ Workflow copied to clipboard!"
elif command -v xclip &> /dev/null; then
    cat /tmp/cloudguard-n8n.json | xclip -selection clipboard
    echo "✅ Workflow copied to clipboard!"
fi

echo ""
echo "🧪 Testing your n8n:"
echo "-------------------"
echo ""

# Check n8n version
if command -v n8n &> /dev/null; then
    echo "n8n version: $(n8n --version)"
else
    echo "⚠️  n8n not found in PATH"
fi

echo ""
echo "If import still fails, try:"
echo "1. Update n8n: npm update -g n8n"
echo "2. Clear browser cache"
echo "3. Try incognito/private mode"
echo "4. Import the test workflow first: lib/n8n/test-workflow.json"