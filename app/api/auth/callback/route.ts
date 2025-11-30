import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route handles post-signup user creation
// It ensures every authenticated user has a record in public.users table
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user already exists in public.users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', user.id)
      .single()

    // If user exists, redirect to dashboard
    if (existingUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // User doesn't exist in public.users - create organization and user
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const company = user.user_metadata?.company || user.email?.split('@')[1] || 'Default Organization'

    // Create organization
    const orgSlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user.id.substring(0, 8)

    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: company,
        slug: orgSlug
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      throw new Error('Failed to create organization')
    }

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        organization_id: newOrg.id,
        role: 'owner'
      })

    if (userError) {
      console.error('Error creating user record:', userError)
      throw new Error('Failed to create user record')
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=setup_failed', request.url))
  }
}
