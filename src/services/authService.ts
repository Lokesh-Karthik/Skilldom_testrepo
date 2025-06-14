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
      console.log('🔄 Starting sign up process...');
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: userData.name
          }
        }
      });

      if (authError) {
        console.error('❌ Auth sign up error:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Create user profile in our custom table
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

      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Note: We cannot use admin functions from client-side code
        // The auth user will be cleaned up automatically by Supabase if not confirmed
        return { user: null, error: 'Failed to create user profile: ' + profileError.message };
      }

      console.log('✅ User profile created successfully');

      // Convert to our User type
      const user = await this.convertSupabaseUserToUser(authData.user, profileResult);
      return { user, error: null };

    } catch (error: any) {
      console.error('❌ Unexpected sign up error:', error);
      return { user: null, error: 'An unexpected error occurred during sign up' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Starting sign in process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      console.log('✅ User signed in:', data.user.id);

      const user = await this.getUserProfile(data.user.id);
      if (!user) {
        return { user: null, error: 'User profile not found' };
      }

      return { user, error: null };

    } catch (error: any) {
      console.error('❌ Unexpected sign in error:', error);
      return { user: null, error: 'An unexpected error occurred during sign in' };
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      console.log('🔄 Starting Google sign in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('❌ Google sign in error:', error);
        return { user: null, error: error.message };
      }

      console.log('✅ Google OAuth initiated');
      // For OAuth, we'll handle the user creation in the callback
      return { user: null, error: null };

    } catch (error: any) {
      console.error('❌ Unexpected Google sign in error:', error);
      return { user: null, error: 'An unexpected error occurred during Google sign in' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log('🔄 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        return { error: error.message };
      }
      console.log('✅ User signed out successfully');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Unexpected sign out error:', error);
      return { error: 'An unexpected error occurred during sign out' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Get current user error:', error);
        return null;
      }

      if (!user) {
        return null;
      }

      return await this.getUserProfile(user.id);
    } catch (error: any) {
      console.error('❌ Unexpected get current user error:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('🔄 Fetching user profile for:', userId);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        
        // If profile doesn't exist, try to create it from auth user
        if (profileError.code === 'PGRST116') {
          console.log('🔄 Profile not found, checking auth user...');
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && user.id === userId) {
            // Create profile from auth user data
            const newProfile = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              date_of_birth: null,
              gender: null,
              school_or_job: null,
              location: null,
              bio: null
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert(newProfile)
              .select()
              .single();

            if (createError) {
              console.error('❌ Failed to create profile:', createError);
              return null;
            }

            console.log('✅ Profile created from auth user');
            return await this.buildUserFromProfile(createdProfile, userId);
          } else {
            return null;
          }
        } else {
          return null;
        }
      }

      if (!profile) {
        return null;
      }

      return await this.buildUserFromProfile(profile, userId);
    } catch (error: any) {
      console.error('❌ Unexpected get user profile error:', error);
      return null;
    }
  }

  private async buildUserFromProfile(profile: any, userId: string): Promise<User> {
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

    console.log('✅ User profile loaded successfully');
    return user;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      console.log('🔄 Updating user profile...');

      // Update basic profile
      const profileUpdates: any = {};
      if (updates.name !== undefined) profileUpdates.name = updates.name;
      if (updates.dateOfBirth !== undefined) profileUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.gender !== undefined) profileUpdates.gender = updates.gender;
      if (updates.schoolOrJob !== undefined) profileUpdates.school_or_job = updates.schoolOrJob;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.profileImage !== undefined) profileUpdates.profile_image = updates.profileImage;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileError) {
          console.error('❌ Profile update error:', profileError);
          return null;
        }
      }

      // Update skills to teach
      if (updates.skillsToTeach !== undefined) {
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

          const { error: skillsError } = await supabase
            .from('user_skills_teach')
            .insert(skillsData);

          if (skillsError) {
            console.error('❌ Skills to teach update error:', skillsError);
          }
        }
      }

      // Update skills to learn
      if (updates.skillsToLearn !== undefined) {
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

          const { error: skillsError } = await supabase
            .from('user_skills_learn')
            .insert(skillsData);

          if (skillsError) {
            console.error('❌ Skills to learn update error:', skillsError);
          }
        }
      }

      // Update interests
      if (updates.interests !== undefined) {
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

          const { error: interestsError } = await supabase
            .from('user_interests')
            .insert(interestsData);

          if (interestsError) {
            console.error('❌ Interests update error:', interestsError);
          }
        }
      }

      console.log('✅ Profile updated successfully');
      // Return updated user profile
      return await this.getUserProfile(userId);
    } catch (error: any) {
      console.error('❌ Unexpected update profile error:', error);
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
      console.log('🔄 Auth state changed:', event);
      
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