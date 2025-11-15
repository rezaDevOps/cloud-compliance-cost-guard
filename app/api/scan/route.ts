import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cloudAccountId, scanType } = body

    // Validate input
    if (!cloudAccountId || !scanType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get cloud account details
    const { data: cloudAccount, error: accountError } = await supabase
      .from('cloud_accounts')
      .select('*')
      .eq('id', cloudAccountId)
      .single()

    if (accountError || !cloudAccount) {
      return NextResponse.json(
        { error: 'Cloud account not found' },
        { status: 404 }
      )
    }

    // Create scan record
    const { data: scanResult, error: scanError } = await supabase
      .from('scan_results')
      .insert({
        cloud_account_id: cloudAccountId,
        scan_type: scanType,
        status: 'pending',
        findings: {},
        recommendations: {},
        severity_counts: { critical: 0, high: 0, medium: 0, low: 0 }
      })
      .select()
      .single()

    if (scanError) {
      return NextResponse.json(
        { error: 'Failed to create scan' },
        { status: 500 }
      )
    }

    // Trigger n8n workflow
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/cloud-scan-trigger'
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scan_id: scanResult.id,
        cloud_account_id: cloudAccountId,
        provider: cloudAccount.provider,
        credentials: cloudAccount.credentials,
        scan_type: scanType
      })
    })

    if (!n8nResponse.ok) {
      // Update scan status to failed
      await supabase
        .from('scan_results')
        .update({ status: 'failed' })
        .eq('id', scanResult.id)
      
      return NextResponse.json(
        { error: 'Failed to trigger scan workflow' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Scan initiated successfully',
      scan_id: scanResult.id
    })

  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}