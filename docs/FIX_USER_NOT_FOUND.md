# Fix "User not found" Error

## Problem
When users sign up, they are created in `auth.users` but not in the public `users` table. This causes the "User not found" error when trying to add cloud accounts.

## Solution
Apply the database trigger migration that automatically creates an organization and user record when someone signs up.

## Steps to Fix

### Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project: `tfrrzxzewakmwzsguwem`

2. **Open SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Migration**:
   - Open the file: `supabase/migrations/002_add_user_signup_trigger.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter`

4. **Verify Success**:
   - You should see: "Success. No rows returned"
   - The trigger is now active for new signups

### Option 2: Fix Existing Users Manually

If you already have users who signed up but don't have records in the `users` table, run this SQL:

```sql
-- Find auth users without corresponding user records
SELECT
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'company' as company
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- For each user found above, manually create org and user record:
DO $$
DECLARE
    auth_user RECORD;
    new_org_id UUID;
    org_name TEXT;
    org_slug TEXT;
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
        -- Create organization
        org_name := COALESCE(auth_user.company, split_part(auth_user.email, '@', 2));
        org_slug := LOWER(REPLACE(org_name, ' ', '-')) || '-' || substring(auth_user.id::text, 1, 8);

        INSERT INTO public.organizations (name, slug)
        VALUES (org_name, org_slug)
        RETURNING id INTO new_org_id;

        -- Create user record
        INSERT INTO public.users (id, email, full_name, organization_id, role)
        VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(auth_user.full_name, auth_user.email),
            new_org_id,
            'owner'
        );

        RAISE NOTICE 'Created org and user for: %', auth_user.email;
    END LOOP;
END $$;
```

## Testing

After applying the migration:

1. **Test New Signup**:
   - Go to your app signup page
   - Create a new test account
   - After signup, you should be able to access the dashboard without errors

2. **Verify Database**:
   ```sql
   -- Check that user was created with organization
   SELECT
       u.id,
       u.email,
       u.full_name,
       u.role,
       o.name as organization_name
   FROM users u
   JOIN organizations o ON u.organization_id = o.id
   ORDER BY u.created_at DESC
   LIMIT 5;
   ```

3. **Add Cloud Account**:
   - Go to dashboard
   - Click "Add Account"
   - Fill in AWS credentials
   - Click "Add Account"
   - Should succeed without "User not found" error

## How the Trigger Works

The trigger (`handle_new_user()`) does the following:

1. **Triggered**: When a new user is inserted into `auth.users` (on signup)
2. **Creates Organization**:
   - Uses company name from signup form metadata
   - Falls back to email domain if no company provided
   - Generates unique slug
3. **Creates User Record**:
   - Links to the new organization
   - Sets role to 'owner' (first user in org)
   - Copies full name and email

## Troubleshooting

### Error: "relation auth.users does not exist"
- Make sure you're running the SQL in the correct project
- The `auth` schema should exist in all Supabase projects

### Error: "permission denied"
- Make sure you're using the Supabase dashboard SQL Editor
- Don't try to run this from the client-side application

### Trigger not firing
- Verify the trigger was created:
  ```sql
  SELECT * FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
  ```

### Users still getting "User not found"
- They might have signed up before the trigger was added
- Use Option 2 above to fix existing users
- Or ask them to create a new account

## Prevention

This trigger ensures that:
- ✅ Every new signup automatically creates an organization
- ✅ User record is created with proper organization link
- ✅ No manual intervention needed for new users
- ✅ Existing RLS policies work correctly
