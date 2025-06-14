/*
  # Authentication and User Profile Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `school_or_job` (text)
      - `location` (text)
      - `bio` (text)
      - `profile_image` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_skills_teach`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `skill_name` (text)
      - `rating` (integer, 1-5)
      - `description` (text)
      - `created_at` (timestamp)

    - `user_skills_learn`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `skill_name` (text)
      - `created_at` (timestamp)

    - `user_interests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `interest_name` (text)
      - `created_at` (timestamp)

    - `user_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `connected_user_id` (uuid, references user_profiles)
      - `status` (text, 'pending', 'accepted', 'rejected')
      - `message` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public profile information
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Create user_skills_teach table
CREATE TABLE IF NOT EXISTS user_skills_teach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_skills_learn table
CREATE TABLE IF NOT EXISTS user_skills_learn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_connections table
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills_teach ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills_learn ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for user_skills_teach
CREATE POLICY "Users can read all teaching skills"
  ON user_skills_teach
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own teaching skills"
  ON user_skills_teach
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_skills_learn
CREATE POLICY "Users can read all learning skills"
  ON user_skills_learn
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own learning skills"
  ON user_skills_learn
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_interests
CREATE POLICY "Users can read all interests"
  ON user_interests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON user_interests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_connections
CREATE POLICY "Users can read connections involving them"
  ON user_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connection requests"
  ON user_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update connections involving them"
  ON user_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_skills_teach_user_id ON user_skills_teach(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_learn_user_id ON user_skills_learn(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();