interface SlackMessage {
  title: string;
  text: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details?: Record<string, any>;
  accountName?: string;
  resourceType?: string;
  resourceId?: string;
}

export class SlackNotifier {
  private webhookUrl: string;
  private channel?: string;

  constructor(webhookUrl?: string, channel?: string) {
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || '';
    this.channel = channel || process.env.SLACK_CHANNEL || '#cloud-alerts';
    
    if (!this.webhookUrl) {
      console.warn('Slack webhook URL not configured');
    }
  }

  async sendAlert(message: SlackMessage): Promise<void> {
    if (!this.webhookUrl) {
      console.log('Slack notification skipped - no webhook URL');
      return;
    }

    const color = this.getSeverityColor(message.severity);
    const emoji = this.getSeverityEmoji(message.severity);
    
    const payload = {
      channel: this.channel,
      username: 'CloudGuard Bot',
      icon_emoji: ':shield:',
      text: `${emoji} *${message.title}*`,
      attachments: [
        {
          color: color,
          fields: this.buildFields(message),
          footer: 'CloudGuard Security Scanner',
          footer_icon: 'https://your-domain.com/icon.png',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  async sendScanSummary(
    accountName: string,
    scanType: string,
    findings: { critical: number; high: number; medium: number; low: number },
    reportUrl: string
  ): Promise<void> {
    const total = findings.critical + findings.high + findings.medium + findings.low;
    const emoji = findings.critical > 0 ? '🚨' : findings.high > 0 ? '⚠️' : '✅';
    
    const payload = {
      channel: this.channel,
      username: 'CloudGuard Bot',
      icon_emoji: ':shield:',
      text: `${emoji} Scan completed for *${accountName}*`,
      attachments: [
        {
          color: findings.critical > 0 ? 'danger' : findings.high > 0 ? 'warning' : 'good',
          fields: [
            {
              title: 'Scan Type',
              value: scanType,
              short: true
            },
            {
              title: 'Total Findings',
              value: total.toString(),
              short: true
            },
            {
              title: '🔴 Critical',
              value: findings.critical.toString(),
              short: true
            },
            {
              title: '🟠 High',
              value: findings.high.toString(),
              short: true
            },
            {
              title: '🟡 Medium',
              value: findings.medium.toString(),
              short: true
            },
            {
              title: '🔵 Low',
              value: findings.low.toString(),
              short: true
            }
          ],
          actions: [
            {
              type: 'button',
              text: '📊 View Report',
              url: reportUrl,
              style: 'primary'
            }
          ],
          footer: 'CloudGuard Security Scanner',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    return this.sendRawMessage(payload);
  }

  private async sendRawMessage(payload: any): Promise<void> {
    if (!this.webhookUrl) {
      console.log('Slack notification skipped - no webhook URL');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  private buildFields(message: SlackMessage): any[] {
    const fields = [
      {
        title: 'Severity',
        value: message.severity.toUpperCase(),
        short: true
      },
      {
        title: 'Time',
        value: new Date().toLocaleString('de-DE'),
        short: true
      }
    ];

    if (message.accountName) {
      fields.push({
        title: 'Account',
        value: message.accountName,
        short: true
      });
    }

    if (message.resourceType) {
      fields.push({
        title: 'Resource Type',
        value: message.resourceType,
        short: true
      });
    }

    if (message.resourceId) {
      fields.push({
        title: 'Resource ID',
        value: `\`${message.resourceId}\``,
        short: false
      });
    }

    fields.push({
      title: 'Details',
      value: message.text,
      short: false
    });

    return fields;
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      critical: '#dc2626',  // red
      high: '#ea580c',      // orange
      medium: '#eab308',    // yellow
      low: '#3b82f6'        // blue
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  }

  private getSeverityEmoji(severity: string): string {
    const emojis = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };
    return emojis[severity as keyof typeof emojis] || '📌';
  }
}

// Export singleton instance
export const slackNotifier = new SlackNotifier();