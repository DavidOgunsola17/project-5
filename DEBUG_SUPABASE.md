# Debugging Supabase "Failed to Fetch" Error

## Quick Diagnostic Steps

1. **Open browser console** (F12) and look for:
   - `🔍 Supabase Configuration Check:` - This shows if credentials are loaded
   - Any error messages with details

2. **Check the console output:**
   - If you see `Valid: ✗` - credentials are not configured
   - If you see `Valid: ✓` - credentials are loaded but there's another issue

## Common Causes & Fixes

### Issue 1: Environment Variables Not Set in StackBlitz

**Symptom:** Console shows `Valid: ✗` and `NOT SET`

**Fix:**
1. In StackBlitz, click the **Settings** icon (gear) in the left sidebar
2. Go to **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. **Restart the preview** (refresh the page)

### Issue 2: RLS Policies Blocking Insert

**Symptom:** Console shows detailed error with code `42501` or `new row violates row-level security policy`

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/rls-policies.sql` to add missing policies
3. Verify policies exist: Dashboard → Authentication → Policies

### Issue 3: Tables Don't Exist

**Symptom:** Error mentions "relation does not exist" or "table not found"

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql` to create all tables

### Issue 4: CORS/Network Error

**Symptom:** "Failed to fetch" with no detailed error code

**Fix:**
1. Check browser console Network tab
2. Look for the failed request to Supabase
3. Verify the Supabase URL is correct (should end in `.supabase.co`)
4. Check if your network/firewall is blocking the request

## Testing the Fix

After applying fixes:

1. **Check console** - Should see `Valid: ✓`
2. **Try creating a room** - Should succeed
3. **Check Network tab** - Request to Supabase should return 200/201 status

## What the Code Now Does

- ✅ Validates credentials before making requests
- ✅ Shows clear error if credentials missing
- ✅ Logs detailed error information for debugging
- ✅ Prevents using placeholder client for real operations

