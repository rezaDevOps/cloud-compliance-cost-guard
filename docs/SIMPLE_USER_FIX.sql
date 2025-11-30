-- ==================================================
-- SIMPLE USER FIX - Run this in Supabase SQL Editor
-- ==================================================

-- Step 1: Check if user exists in auth.users
SELECT 'Step 1: Checking auth.users' as status;
SELECT id, email FROM auth.users WHERE email = 'faraz891@gmail.com';
-- Copy the ID from the result above

-- Step 2: Check if user exists in public.users
SELECT 'Step 2: Checking public.users' as status;
SELECT id, email, organization_id FROM public.users WHERE email = 'faraz891@gmail.com';
-- If this returns no rows, your user is missing from public.users

-- Step 3: FIX - Create organization and user (MODIFY EMAIL IF NEEDED)
DO $$
DECLARE
    v_auth_user_id UUID;
    v_email TEXT := 'faraz891@gmail.com';  -- *** CHANGE THIS TO YOUR EMAIL ***
    v_org_id UUID;
    v_org_exists BOOLEAN;
BEGIN
    -- Get auth user ID
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = v_email;

    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found in auth.users', v_email;
    END IF;

    RAISE NOTICE 'Found auth user ID: %', v_auth_user_id;

    -- Check if user already exists in public.users
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = v_auth_user_id) INTO v_org_exists;

    IF v_org_exists THEN
        RAISE NOTICE 'User already exists in public.users - no action needed';
        RETURN;
    END IF;

    -- Create organization
    INSERT INTO public.organizations (name, slug)
    VALUES ('systemops', 'systemops-' || substring(v_auth_user_id::text, 1, 8))
    RETURNING id INTO v_org_id;

    RAISE NOTICE 'Created organization with ID: %', v_org_id;

    -- Create user record
    INSERT INTO public.users (id, email, full_name, organization_id, role)
    VALUES (
        v_auth_user_id,
        v_email,
        'Reza Zamani',  -- Change if needed
        v_org_id,
        'owner'
    );

    RAISE NOTICE '✓ SUCCESS - Created user and organization for: %', v_email;
    RAISE NOTICE 'You can now refresh your dashboard and add cloud accounts!';
END $$;

-- Step 4: Verify the fix
SELECT 'Step 4: Verification' as status;
SELECT
    u.email,
    u.full_name,
    u.role,
    o.name as organization,
    u.organization_id
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
WHERE u.email = 'faraz891@gmail.com';

-- Expected output: One row with your email, name, organization
-- If you see a row, the fix worked!
