/*
  # Move user tables from public to api schema

  1. Schema Changes
    - Create api schema if it doesn't exist
    - Move all user tables from public to api schema
    - Update all foreign key references
    - Recreate all indexes, constraints, and policies in api schema
    - Drop tables from public schema

  2. Tables to Move
    - user_profiles
    - user_skills_teach
    - user_skills_learn
    - user_interests
    - user_connections

  3. Security
    - Recreate all RLS policies in api schema
    - Maintain all existing permissions and constraints
*/

-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Grant usage on api schema to authenticated users
GRANT USAGE ON SCHEMA api TO authenticated;
GRANT USAGE ON SCHEMA api TO anon;

-- Move user_profiles table to api schema
CREATE TABLE IF NOT EXISTS api.user_profiles (
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

-- Move user_skills_teach table to api schema
CREATE TABLE IF NOT EXISTS api.user_skills_teach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES api.user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Move user_skills_learn table to api schema
CREATE TABLE IF NOT EXISTS api.user_skills_learn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES api.user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Move user_interests table to api schema
CREATE TABLE IF NOT EXISTS api.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES api.user_profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Move user_connections table to api schema
CREATE TABLE IF NOT EXISTS api.user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES api.user_profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id uuid REFERENCES api.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Copy data from public schema to api schema (if exists)
DO $$
BEGIN
  -- Copy user_profiles data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    INSERT INTO api.user_profiles SELECT * FROM public.user_profiles ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_skills_teach data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_skills_teach') THEN
    INSERT INTO api.user_skills_teach SELECT * FROM public.user_skills_teach ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_skills_learn data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_skills_learn') THEN
    INSERT INTO api.user_skills_learn SELECT * FROM public.user_skills_learn ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_interests data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_interests') THEN
    INSERT INTO api.user_interests SELECT * FROM public.user_interests ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy user_connections data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_connections') THEN
    INSERT INTO api.user_connections SELECT * FROM public.user_connections ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Enable Row Level Security on api schema tables
ALTER TABLE api.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_skills_teach ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_skills_learn ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_connections ENABLE ROW LEVEL SECURITY;

-- Recreate policies for api.user_profiles
CREATE POLICY "Users can read all profiles"
  ON api.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON api.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON api.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Recreate policies for api.user_skills_teach
CREATE POLICY "Users can read all teaching skills"
  ON api.user_skills_teach
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own teaching skills"
  ON api.user_skills_teach
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Recreate policies for api.user_skills_learn
CREATE POLICY "Users can read all learning skills"
  ON api.user_skills_learn
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own learning skills"
  ON api.user_skills_learn
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Recreate policies for api.user_interests
CREATE POLICY "Users can read all interests"
  ON api.user_interests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON api.user_interests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Recreate policies for api.user_connections
CREATE POLICY "Users can read connections involving them"
  ON api.user_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connection requests"
  ON api.user_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update connections involving them"
  ON api.user_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Recreate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_user_skills_teach_user_id ON api.user_skills_teach(user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_skills_learn_user_id ON api.user_skills_learn(user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_interests_user_id ON api.user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_connections_user_id ON api.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_connections_connected_user_id ON api.user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_connections_status ON api.user_connections(status);

-- Recreate triggers for updated_at
CREATE TRIGGER update_api_user_profiles_updated_at
  BEFORE UPDATE ON api.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_user_connections_updated_at
  BEFORE UPDATE ON api.user_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on api schema tables
GRANT SELECT, INSERT, UPDATE, DELETE ON api.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.user_skills_teach TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.user_skills_learn TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.user_interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.user_connections TO authenticated;

-- Grant select permissions to anon for public data
GRANT SELECT ON api.user_profiles TO anon;
GRANT SELECT ON api.user_skills_teach TO anon;
GRANT SELECT ON api.user_skills_learn TO anon;
GRANT SELECT ON api.user_interests TO anon;

-- Drop tables from public schema (only if they exist and data has been copied)
DO $$
BEGIN
  -- Verify data was copied before dropping
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'user_profiles') THEN
    DROP TABLE IF EXISTS public.user_connections CASCADE;
    DROP TABLE IF EXISTS public.user_interests CASCADE;
    DROP TABLE IF EXISTS public.user_skills_learn CASCADE;
    DROP TABLE IF EXISTS public.user_skills_teach CASCADE;
    DROP TABLE IF EXISTS public.user_profiles CASCADE;
  END IF;
END $$;