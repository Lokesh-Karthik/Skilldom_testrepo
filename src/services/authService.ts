import { supabase } from '../lib/supabase';
import { User } from '../types';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  schoolOrJob?: string;
  location?: string;
  bio?: string;
}

class AuthService {
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      // Create user profile
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        date_of_birth: userData.dateOfBirth || null,
        gender: userData.gender || null,
        school_or_job: userData.schoolOrJob || null,
        location: userData.location || null,
        bio: userData.bio || null
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: 'Failed to create user profile' };
      }

      // Convert to our User type
      const user = await this.convertSupabaseUserToUser(authData.user, profileData);
      return { user, error: null };

    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: 'An unexpected error occurred during sign up' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      const user = await this.getUserProfile(data.user.id);
      return { user, error: null };

    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: 'An unexpected error occurred during sign in' };
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // For OAuth, we'll handle the user creation in the callback
      return { user: null, error: null };

    } catch (error) {
      console.error('Google sign in error:', error);
      return { user: null, error: 'An unexpected error occurred during Google sign in' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'An unexpected error occurred during sign out' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getUserProfile(user.id);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      // Get skills to teach
      const { data: skillsToTeach } = await supabase
        .from('user_skills_teach')
        .select('*')
        .eq('user_id', userId);

      // Get skills to learn
      const { data: skillsToLearn } = await supabase
        .from('user_skills_learn')
        .select('*')
        .eq('user_id', userId);

      // Get interests
      const { data: interests } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId);

      // Get connections
      const { data: connections } = await supabase
        .from('user_connections')
        .select('*')
        .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Convert to our User type
      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        dateOfBirth: profile.date_of_birth || '',
        gender: profile.gender || 'other',
        schoolOrJob: profile.school_or_job || '',
        location: profile.location || '',
        bio: profile.bio || '',
        profileImage: profile.profile_image,
        skillsToTeach: skillsToTeach?.map(skill => ({
          name: skill.skill_name,
          rating: skill.rating,
          description: skill.description
        })) || [],
        skillsToLearn: skillsToLearn?.map(skill => skill.skill_name) || [],
        interests: interests?.map(interest => interest.interest_name) || [],
        connections: connections?.map(conn => 
          conn.user_id === userId ? conn.connected_user_id : conn.user_id
        ) || [],
        pendingRequests: [], // We'll implement this separately
        sentRequests: [], // We'll implement this separately
        createdAt: profile.created_at
      };

      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      // Update basic profile
      const profileUpdates: any = {};
      if (updates.name) profileUpdates.name = updates.name;
      if (updates.dateOfBirth) profileUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.gender) profileUpdates.gender = updates.gender;
      if (updates.schoolOrJob) profileUpdates.school_or_job = updates.schoolOrJob;
      if (updates.location) profileUpdates.location = updates.location;
      if (updates.bio) profileUpdates.bio = updates.bio;
      if (updates.profileImage) profileUpdates.profile_image = updates.profileImage;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileError) {
          console.error('Profile update error:', profileError);
          return null;
        }
      }

      // Update skills to teach
      if (updates.skillsToTeach) {
        // Delete existing skills
        await supabase
          .from('user_skills_teach')
          .delete()
          .eq('user_id', userId);

        // Insert new skills
        if (updates.skillsToTeach.length > 0) {
          const skillsData = updates.skillsToTeach.map(skill => ({
            user_id: userId,
            skill_name: skill.name,
            rating: skill.rating,
            description: skill.description
          }));

          await supabase
            .from('user_skills_teach')
            .insert(skillsData);
        }
      }

      // Update skills to learn
      if (updates.skillsToLearn) {
        // Delete existing skills
        await supabase
          .from('user_skills_learn')
          .delete()
          .eq('user_id', userId);

        // Insert new skills
        if (updates.skillsToLearn.length > 0) {
          const skillsData = updates.skillsToLearn.map(skill => ({
            user_id: userId,
            skill_name: skill
          }));

          await supabase
            .from('user_skills_learn')
            .insert(skillsData);
        }
      }

      // Update interests
      if (updates.interests) {
        // Delete existing interests
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', userId);

        // Insert new interests
        if (updates.interests.length > 0) {
          const interestsData = updates.interests.map(interest => ({
            user_id: userId,
            interest_name: interest
          }));

          await supabase
            .from('user_interests')
            .insert(interestsData);
        }
      }

      // Return updated user profile
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  private async convertSupabaseUserToUser(supabaseUser: SupabaseUser, profileData: any): Promise<User> {
    return {
      id: supabaseUser.id,
      email: profileData.email,
      name: profileData.name,
      dateOfBirth: profileData.date_of_birth || '',
      gender: profileData.gender || 'other',
      schoolOrJob: profileData.school_or_job || '',
      location: profileData.location || '',
      bio: profileData.bio || '',
      profileImage: profileData.profile_image,
      skillsToTeach: [],
      skillsToLearn: [],
      interests: [],
      connections: [],
      pendingRequests: [],
      sentRequests: [],
      createdAt: profileData.created_at || new Date().toISOString()
    };
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getUserProfile(session.user.id);
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();