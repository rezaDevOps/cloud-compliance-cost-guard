import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// This route handles post-signup user creation
// It ensures every authenticated user has a record in public.users table
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  console.log('[Auth Callback] Starting callback handler')

  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Auth Callback] No authenticated user, redirecting to login')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    console.log('[Auth Callback] User authenticated:', user.email)

    // Check if user already exists in public.users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', user.id)
      .single()

    // If user exists, redirect to dashboard
    if (existingUser && !checkError) {
      console.log('[Auth Callback] User already exists, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }

    console.log('[Auth Callback] User not found in public.users, creating...')

    // User doesn't exist in public.users - create organization and user
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const company = user.user_metadata?.company || user.email?.split('@')[1] || 'Default Organization'

    // Create organization
    const orgSlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user.id.substring(0, 8)

    console.log('[Auth Callback] Creating organization:', company)

    // Use service role client to bypass RLS for user/org creation
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: newOrg, error: orgError } = await serviceClient
      .from('organizations')
      .insert({
        name: company,
        slug: orgSlug
      })
      .select()
      .single()

    if (orgError) {
      console.error('[Auth Callback] Error creating organization:', orgError)
      return NextResponse.redirect(
        new URL('/login?error=org_creation_failed', requestUrl.origin)
      )
    }

    console.log('[Auth Callback] Organization created:', newOrg.id)

    // Create user record using service role to bypass RLS
    const { error: userError } = await serviceClient
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        organization_id: newOrg.id,
        role: 'owner'
      })

    if (userError) {
      console.error('[Auth Callback] Error creating user record:', userError)
      return NextResponse.redirect(
        new URL('/login?error=user_creation_failed', requestUrl.origin)
      )
    }

    console.log('[Auth Callback] User record created successfully')

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(
      new URL('/login?error=setup_failed', requestUrl.origin)
    )
  }
}
