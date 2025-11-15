import { NextRequest, NextResponse } from 'next/server'
import { slackNotifier } from '@/lib/notifications/slack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, message } = body

    // Beispiel für verschiedene Alert-Typen
    switch (type) {
      case 'security_alert':
        await slackNotifier.sendAlert({
          title: 'Security Alert Detected',
          text: message || 'A security issue has been detected in your cloud infrastructure',
          severity: 'critical',
          accountName: 'AWS Production',
          resourceType: 'S3 Bucket',
          resourceId: 's3-bucket-public-123'
        })
        break

      case 'scan_complete':
        await slackNotifier.sendScanSummary(
          'AWS Production',
          'Security Scan',
          { critical: 2, high: 5, medium: 12, low: 23 },
          'https://app.cloudguard.io/reports/123'
        )
        break

      case 'cost_alert':
        await slackNotifier.sendAlert({
          title: 'Cost Threshold Exceeded',
          text: 'Your AWS costs have exceeded the monthly budget by 20%',
          severity: 'high',
          accountName: 'AWS Production',
          details: {
            current_spend: '€5,244',
            budget: '€4,000',
            overage: '€1,244'
          }
        })
        break

      default:
        // Test-Nachricht
        await slackNotifier.sendAlert({
          title: 'Test Alert from CloudGuard',
          text: message || 'This is a test notification from CloudGuard',
          severity: 'low'
        })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Slack notification sent successfully' 
    })

  } catch (error) {
    console.error('Slack notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send Slack notification' },
      { status: 500 }
    )
  }
}

// Test-Endpoint für GET Requests
export async function GET() {
  return NextResponse.json({
    message: 'Slack notification endpoint',
    usage: 'POST /api/notifications/slack with { type, message }',
    types: ['security_alert', 'scan_complete', 'cost_alert', 'test']
  })
}