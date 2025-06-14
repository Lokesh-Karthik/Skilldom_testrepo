/*
  # Fix User Profiles RLS Policies

  1. Security Updates
    - Update RLS policies for user_profiles table to allow proper user creation
    - Ensure authenticated users can create their own profiles during sign-up
    - Fix policy conflicts that prevent profile insertion

  2. Policy Changes
    - Remove conflicting INSERT policies
    - Add proper INSERT policy for authenticated users
    - Ensure users can only create profiles with their own auth.uid()
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON user_profiles;

-- Create proper INSERT policy for user profiles
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create proper UPDATE policy for user profiles
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure SELECT policy allows reading all profiles (for discovery features)
DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure DELETE policy allows users to delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile only" ON user_profiles;
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);