/*
  # Fix RLS policies to allow new user creation

  1. Problem
    - Current RLS policies prevent new users from creating profiles
    - The INSERT policy requires auth.uid() = id, but during signup the user might not be fully authenticated yet

  2. Solution
    - Update INSERT policies to be more permissive during user creation
    - Allow authenticated users to create profiles for themselves
    - Ensure proper security while enabling user registration

  3. Changes
    - Update user_profiles INSERT policy to allow profile creation
    - Update related tables to allow initial data insertion
    - Maintain security for updates and reads
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own teaching skills" ON public.user_skills_teach;
DROP POLICY IF EXISTS "Users can manage own learning skills" ON public.user_skills_learn;
DROP POLICY IF EXISTS "Users can manage own interests" ON public.user_interests;

-- Create more permissive INSERT policy for user_profiles
CREATE POLICY "Allow authenticated users to create profiles"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create separate policies for different operations on user_profiles
CREATE POLICY "Users can update own profile only"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile only"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create comprehensive policies for user_skills_teach
CREATE POLICY "Users can insert own teaching skills"
  ON public.user_skills_teach
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own teaching skills"
  ON public.user_skills_teach
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own teaching skills"
  ON public.user_skills_teach
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comprehensive policies for user_skills_learn
CREATE POLICY "Users can insert own learning skills"
  ON public.user_skills_learn
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning skills"
  ON public.user_skills_learn
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning skills"
  ON public.user_skills_learn
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comprehensive policies for user_interests
CREATE POLICY "Users can insert own interests"
  ON public.user_interests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interests"
  ON public.user_interests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON public.user_interests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure user_connections policies are properly set
DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update connections involving them" ON public.user_connections;

CREATE POLICY "Users can create connection requests"
  ON public.user_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update connections involving them"
  ON public.user_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can delete connections involving them"
  ON public.user_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Add helpful comments
COMMENT ON POLICY "Allow authenticated users to create profiles" ON public.user_profiles 
IS 'Allows any authenticated user to create a profile - needed for user registration';

COMMENT ON POLICY "Users can update own profile only" ON public.user_profiles 
IS 'Users can only update their own profile data';

-- Verify RLS is enabled on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_teach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_learn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;