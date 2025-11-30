import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/accounts - List all cloud accounts for the user's organization
// Force rebuild: 2025-11-30
export async function GET() {
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

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all cloud accounts for the organization
    const { data: accounts, error: accountsError } = await supabase
      .from('cloud_accounts')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false })

    if (accountsError) {
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ accounts: accounts || [] })

  } catch (error) {
    console.error('Accounts GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/accounts - Create a new cloud account
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

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { provider, account_name, account_id, credentials } = body

    // Validate input
    if (!provider || !account_name || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, account_name, credentials' },
        { status: 400 }
      )
    }

    // Validate provider
    if (!['aws', 'azure', 'gcp'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: aws, azure, gcp' },
        { status: 400 }
      )
    }

    // Validate AWS credentials structure
    if (provider === 'aws') {
      if (!credentials.access_key || !credentials.secret_key) {
        return NextResponse.json(
          { error: 'AWS credentials must include access_key and secret_key' },
          { status: 400 }
        )
      }
    }

    // Create cloud account
    const { data: newAccount, error: createError } = await supabase
      .from('cloud_accounts')
      .insert({
        organization_id: userData.organization_id,
        provider,
        account_name,
        account_id: account_id || 'unknown',
        credentials,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Database insert error:', createError)
      return NextResponse.json(
        { error: 'Failed to create cloud account', details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Cloud account added successfully',
      account: newAccount
    }, { status: 201 })

  } catch (error) {
    console.error('Accounts POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/accounts?id=xxx - Delete a cloud account
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing account ID' },
        { status: 400 }
      )
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify account belongs to user's organization before deleting
    const { data: account, error: accountError } = await supabase
      .from('cloud_accounts')
      .select('organization_id')
      .eq('id', accountId)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    if (account.organization_id !== userData.organization_id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this account' },
        { status: 403 }
      )
    }

    // Delete the account
    const { error: deleteError } = await supabase
      .from('cloud_accounts')
      .delete()
      .eq('id', accountId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Cloud account deleted successfully'
    })

  } catch (error) {
    console.error('Accounts DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
