/*
  # Move user tables from api schema to public schema

  1. Tables to move
    - Move `api.user_profiles` to `public.user_profiles`
    - Move `api.user_skills_teach` to `public.user_skills_teach`
    - Move `api.user_skills_learn` to `public.user_skills_learn`
    - Move `api.user_interests` to `public.user_interests`
    - Move `api.user_connections` to `public.user_connections`

  2. Security
    - Recreate RLS policies on public schema tables
    - Grant appropriate permissions
    - Maintain all existing functionality

  3. Data Migration
    - Copy all data from api schema to public schema
    - Preserve all relationships and constraints
*/

-- Create user_profiles table in public schema
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  school_or_job text,
  location text,
  bio text,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_skills_teach table in public schema
CREATE TABLE IF NOT EXISTS public.user_skills_teach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_skills_learn table in public schema
CREATE TABLE IF NOT EXISTS public.user_skills_learn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_interests table in public schema
CREATE TABLE IF NOT EXISTS public.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_connections table in public schema
CREATE TABLE IF NOT EXISTS public.user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Copy data from api schema to public schema (if exists)
DO $$
BEGIN
  -- Copy user_profiles data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'user_profiles') THEN
    INSERT INTO public.user_profiles 
    SELECT * FROM api.user_profiles 
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      date_of_birth = EXCLUDED.date_of_birth,
      gender = EXCLUDED.gender,
      school_or_job = EXCLUDED.school_or_job,
      location = EXCLUDED.location,
      bio = EXCLUDED.bio,
      profile_image = EXCLUDED.profile_image,
      updated_at = EXCLUDED.updated_at;
  END IF;

  -- Copy user_skills_teach data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'user_skills_teach') THEN
    INSERT INTO public.user_skills_teach 
    SELECT * FROM api.user_skills_teach 
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_skills_learn data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'user_skills_learn') THEN
    INSERT INTO public.user_skills_learn 
    SELECT * FROM api.user_skills_learn 
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_interests data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'user_interests') THEN
    INSERT INTO public.user_interests 
    SELECT * FROM api.user_interests 
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_connections data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'user_connections') THEN
    INSERT INTO public.user_connections 
    SELECT * FROM api.user_connections 
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Enable Row Level Security on public schema tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_teach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_learn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can read all teaching skills" ON public.user_skills_teach;
DROP POLICY IF EXISTS "Users can manage own teaching skills" ON public.user_skills_teach;

DROP POLICY IF EXISTS "Users can read all learning skills" ON public.user_skills_learn;
DROP POLICY IF EXISTS "Users can manage own learning skills" ON public.user_skills_learn;

DROP POLICY IF EXISTS "Users can read all interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can manage own interests" ON public.user_interests;

DROP POLICY IF EXISTS "Users can read connections involving them" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update connections involving them" ON public.user_connections;

-- Create policies for public.user_profiles
CREATE POLICY "Users can read all profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for public.user_skills_teach
CREATE POLICY "Users can read all teaching skills"
  ON public.user_skills_teach
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own teaching skills"
  ON public.user_skills_teach
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for public.user_skills_learn
CREATE POLICY "Users can read all learning skills"
  ON public.user_skills_learn
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own learning skills"
  ON public.user_skills_learn
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for public.user_interests
CREATE POLICY "Users can read all interests"
  ON public.user_interests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON public.user_interests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for public.user_connections
CREATE POLICY "Users can read connections involving them"
  ON public.user_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connection requests"
  ON public.user_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update connections involving them"
  ON public.user_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_user_skills_teach_user_id ON public.user_skills_teach(user_id);
CREATE INDEX IF NOT EXISTS idx_public_user_skills_learn_user_id ON public.user_skills_learn(user_id);
CREATE INDEX IF NOT EXISTS idx_public_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_public_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_public_user_connections_connected_user_id ON public.user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_public_user_connections_status ON public.user_connections(status);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_public_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_public_user_connections_updated_at ON public.user_connections;

-- Create triggers for updated_at
CREATE TRIGGER update_public_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_user_connections_updated_at
  BEFORE UPDATE ON public.user_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on public schema tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills_teach TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills_learn TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_connections TO authenticated;

-- Grant select permissions to anon for public data (if needed)
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.user_skills_teach TO anon;
GRANT SELECT ON public.user_skills_learn TO anon;
GRANT SELECT ON public.user_interests TO anon;

-- Clean up: Drop tables from api schema after successful migration
DO $$
BEGIN
  -- Verify data was copied before dropping
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    -- Drop api schema tables
    DROP TABLE IF EXISTS api.user_connections CASCADE;
    DROP TABLE IF EXISTS api.user_interests CASCADE;
    DROP TABLE IF EXISTS api.user_skills_learn CASCADE;
    DROP TABLE IF EXISTS api.user_skills_teach CASCADE;
    DROP TABLE IF EXISTS api.user_profiles CASCADE;
    
    -- Drop api schema if it's empty (optional)
    -- DROP SCHEMA IF EXISTS api CASCADE;
  END IF;
END $$;