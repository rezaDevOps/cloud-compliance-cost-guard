# Slack Webhook Configuration

## In deiner .env.local hinzufügen:

```env
# Slack Webhook URL (Methode 1)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX

# Oder für Slack App (Methode 2)
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_CHANNEL_ID=C1234567890
```

## Beispiel: Slack Notification Service

```typescript
// lib/notifications/slack.ts
export class SlackNotifier {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL!;
  }

  async sendAlert(message: {
    title: string;
    text: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    details?: any;
  }) {
    const color = {
      critical: '#dc2626', // red
      high: '#ea580c',     // orange
      medium: '#eab308',   // yellow
      low: '#3b82f6'       // blue
    }[message.severity];

    const payload = {
      text: message.title,
      attachments: [
        {
          color: color,
          fields: [
            {
              title: 'Severity',
              value: message.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Time',
              value: new Date().toLocaleString('de-DE'),
              short: true
            },
            {
              title: 'Details',
              value: message.text,
              short: false
            }
          ],
          footer: 'CloudGuard Security Scanner',
          footer_icon: 'https://your-domain.com/icon.png',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
  }
}
```

## Test deine Webhook URL:

```bash
# Quick Test mit curl
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"🚀 CloudGuard Test Message"}' \
YOUR_WEBHOOK_URL_HERE
```

## n8n Slack Integration:

In n8n kannst du die Webhook URL direkt im Slack Node konfigurieren:

1. Öffne deinen n8n Workflow
2. Doppelklick auf den "Send Slack Alert" Node
3. Bei "Credentials" → "Create New"
4. Wähle "Webhook URL" als Authentication Type
5. Füge deine Webhook URL ein
6. Speichern und testen

## Erweiterte Slack-Features:

```typescript
// Für interaktive Nachrichten mit Buttons
const interactiveMessage = {
  text: "Kritisches Security Problem gefunden!",
  attachments: [{
    text: "S3 Bucket ist öffentlich zugänglich",
    callback_id: "fix_s3_bucket",
    color: "danger",
    actions: [
      {
        name: "fix",
        text: "Automatisch beheben",
        type: "button",
        value: "auto_fix",
        style: "danger"
      },
      {
        name: "ignore",
        text: "Ignorieren",
        type: "button",
        value: "ignore"
      }
    ]
  }]
};
```