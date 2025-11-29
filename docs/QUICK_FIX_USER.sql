-- ========================================
-- QUICK FIX: Create Organization and User
-- ========================================
-- Run this in Supabase SQL Editor to fix "User not found" error
--
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/tfrrzxzewakmwzsguwem/sql/new
-- 2. Copy this ENTIRE file
-- 3. Paste into SQL Editor
-- 4. Click "Run" or press Ctrl+Enter
-- ========================================

-- Step 1: Check current state
SELECT 'Checking auth.users...' as step;
SELECT id, email, created_at,
       raw_user_meta_data->>'full_name' as full_name,
       raw_user_meta_data->>'company' as company
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Checking public.users...' as step;
SELECT id, email, organization_id, role
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Checking organizations...' as step;
SELECT id, name, slug
FROM public.organizations
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Find users in auth.users but NOT in public.users
SELECT 'Users missing from public.users:' as step;
SELECT
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'company' as company,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Step 3: Fix ALL missing users automatically
DO $$
DECLARE
    auth_user RECORD;
    new_org_id UUID;
    org_name TEXT;
    org_slug TEXT;
    user_count INT := 0;
BEGIN
    FOR auth_user IN
        SELECT
            au.id,
            au.email,
            au.raw_user_meta_data->>'full_name' as full_name,
            au.raw_user_meta_data->>'company' as company
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        -- Determine organization name
        org_name := COALESCE(
            auth_user.company,
            split_part(auth_user.email, '@', 2),
            'Default Organization'
        );

        -- Generate unique slug
        org_slug := LOWER(REPLACE(REPLACE(org_name, ' ', '-'), '.', '-'))
                    || '-' || substring(auth_user.id::text, 1, 8);

        -- Create organization
        INSERT INTO public.organizations (name, slug)
        VALUES (org_name, org_slug)
        RETURNING id INTO new_org_id;

        -- Create user record
        INSERT INTO public.users (id, email, full_name, organization_id, role)
        VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(auth_user.full_name, split_part(auth_user.email, '@', 1)),
            new_org_id,
            'owner'
        );

        user_count := user_count + 1;
        RAISE NOTICE '✓ Fixed user: % (org: %)', auth_user.email, org_name;
    END LOOP;

    IF user_count = 0 THEN
        RAISE NOTICE 'No missing users found. All users are properly configured!';
    ELSE
        RAISE NOTICE 'Successfully fixed % user(s)', user_count;
    END IF;
END $$;

-- Step 4: Install trigger for future signups (if not already installed)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    org_name TEXT;
    org_slug TEXT;
BEGIN
    -- Extract company name from user metadata, fallback to email domain
    org_name := COALESCE(
        NEW.raw_user_meta_data->>'company',
        split_part(NEW.email, '@', 2),
        'Default Organization'
    );

    -- Generate organization slug
    org_slug := LOWER(REPLACE(REPLACE(org_name, ' ', '-'), '.', '-'))
                || '-' || substring(NEW.id::text, 1, 8);

    -- Create organization
    INSERT INTO public.organizations (name, slug)
    VALUES (org_name, org_slug)
    RETURNING id INTO new_org_id;

    -- Create user record
    INSERT INTO public.users (
        id,
        email,
        full_name,
        organization_id,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        new_org_id,
        'owner'
    );

    RAISE NOTICE 'Auto-created org and user for: %', NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Verify fix
SELECT '========================================' as result;
SELECT '✓ FIX COMPLETE' as result;
SELECT '========================================' as result;

SELECT 'Verification - All users should now have organizations:' as step;
SELECT
    u.email,
    u.full_name,
    u.role,
    o.name as organization,
    o.slug as org_slug
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
ORDER BY u.created_at DESC;

SELECT '========================================' as result;
SELECT 'You can now add cloud accounts in the dashboard!' as result;
SELECT '========================================' as result;
