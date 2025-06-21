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
          emailRedirectTo: `${window.location.origin}`,
          data: {
            name: userData.name
          }
        }
      });

      if (authError) {
        console.error('❌ Auth sign up error:', authError);
        
        // Handle specific sign up errors
        if (authError.message.includes('already registered')) {
          return { user: null, error: 'An account with this email already exists. Please try signing in instead.' };
        }
        if (authError.message.includes('Password should be at least')) {
          return { user: null, error: 'Password must be at least 6 characters long.' };
        }
        if (authError.message.includes('Invalid email')) {
          return { user: null, error: 'Please enter a valid email address.' };
        }
        
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      console.log('✅ Auth user created:', authData.user.id);

      // For email confirmation flow, return a basic user object with profileComplete: false
      console.log('📧 Email confirmation required - profile will be created after confirmation');

      const user: User = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        dateOfBirth: '',
        gender: 'other',
        schoolOrJob: '',
        location: '',
        bio: '',
        profileImage: null,
        skillsToTeach: [],
        skillsToLearn: [],
        interests: [],
        connections: [],
        pendingRequests: [],
        sentRequests: [],
        createdAt: new Date().toISOString(),
        profileComplete: false
      };

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
        
        // Handle specific authentication errors with user-friendly messages
        if (error.message.includes('Invalid login credentials')) {
          // Check if user exists by trying to find their profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('email', email)
            .single();
          
          if (!profile) {
            return { user: null, error: 'ACCOUNT_NOT_FOUND' };
          } else {
            return { user: null, error: 'INCORRECT_PASSWORD' };
          }
        }
        
        if (error.message.includes('Email not confirmed')) {
          return { user: null, error: 'EMAIL_NOT_CONFIRMED' };
        }
        
        if (error.message.includes('Too many requests')) {
          return { user: null, error: 'TOO_MANY_ATTEMPTS' };
        }
        
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      console.log('✅ User signed in:', data.user.id);

      const user = await this.buildUserFromAuthUser(data.user);
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
          redirectTo: `${window.location.origin}`,
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
      return { user: null, error: null };

    } catch (error: any) {
      console.error('❌ Unexpected Google sign in error:', error);
      return { user: null, error: 'An unexpected error occurred during Google sign in' };
    }
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      console.log('🔄 Sending password reset email...');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        return { error: error.message };
      }

      console.log('✅ Password reset email sent');
      return { error: null };

    } catch (error: any) {
      console.error('❌ Unexpected password reset error:', error);
      return { error: 'An unexpected error occurred while sending password reset email' };
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

      return await this.buildUserFromAuthUser(user);
    } catch (error: any) {
      console.error('❌ Unexpected get current user error:', error);
      return null;
    }
  }

  // Public method to build user from auth user (used by useAuth hook)
  async buildUserFromAuthUser(authUser: SupabaseUser): Promise<User | null> {
    return await this.buildUserFromAuth(authUser);
  }

  private async buildUserFromAuth(authUser: SupabaseUser): Promise<User | null> {
    try {
      console.log('🔄 Building user from auth data for:', authUser.id);

      // Try to get the full profile
      const profile = await this.getUserProfile(authUser.id);
      
      if (profile) {
        // Full profile exists, check if it's complete
        const isComplete = !!(
          profile.name && 
          profile.location && 
          profile.schoolOrJob &&
          profile.name.trim() !== '' &&
          profile.location.trim() !== '' &&
          profile.schoolOrJob.trim() !== ''
        );
        
        console.log('✅ Full profile found, complete:', isComplete);
        return {
          ...profile,
          profileComplete: isComplete
        };
      }

      // No profile found in database - this means the user has a valid auth session
      // but no corresponding profile record. Return a basic user object for profile setup
      console.log('⚠️ Auth user exists but no profile found in database. User needs to complete profile setup...');
      
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        dateOfBirth: '',
        gender: 'other',
        schoolOrJob: '',
        location: '',
        bio: '',
        profileImage: authUser.user_metadata?.avatar_url || null,
        skillsToTeach: [],
        skillsToLearn: [],
        interests: [],
        connections: [],
        pendingRequests: [],
        sentRequests: [],
        createdAt: authUser.created_at || new Date().toISOString(),
        profileComplete: false
      };

    } catch (error: any) {
      console.error('❌ Error building user from auth:', error);
      
      // On any error, return a basic user for profile setup
      console.log('⚠️ Error occurred, returning basic user for profile setup...');
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        dateOfBirth: '',
        gender: 'other',
        schoolOrJob: '',
        location: '',
        bio: '',
        profileImage: authUser.user_metadata?.avatar_url || null,
        skillsToTeach: [],
        skillsToLearn: [],
        interests: [],
        connections: [],
        pendingRequests: [],
        sentRequests: [],
        createdAt: authUser.created_at || new Date().toISOString(),
        profileComplete: false
      };
    }
  }

  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('🔄 Fetching user profile for:', userId);

      // Get user profile - only fetch, don't create
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.log('ℹ️ Profile not found or error:', profileError.message);
        return null;
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
      createdAt: profile.created_at,
      profileComplete: true
    };

    console.log('✅ User profile loaded successfully');
    return user;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      console.log('🔄 Updating user profile...', updates);

      // First, ensure the user profile exists
      let { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it first
        console.log('🔄 Creating new profile...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || user.id !== userId) {
          console.error('❌ User not authenticated');
          return null;
        }

        const newProfile = {
          id: userId,
          email: user.email || '',
          name: updates.name || user.user_metadata?.name || user.user_metadata?.full_name || 'User',
          date_of_birth: updates.dateOfBirth || null,
          gender: updates.gender || null,
          school_or_job: updates.schoolOrJob || null,
          location: updates.location || null,
          bio: updates.bio || null,
          profile_image: updates.profileImage || user.user_metadata?.avatar_url || null
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

        existingProfile = createdProfile;
        console.log('✅ Profile created successfully');
      } else if (fetchError) {
        console.error('❌ Error fetching profile:', fetchError);
        return null;
      }

      // Update basic profile if there are changes
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
        console.log('✅ Profile basic info updated');
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
          } else {
            console.log('✅ Skills to teach updated');
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
          } else {
            console.log('✅ Skills to learn updated');
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
          } else {
            console.log('✅ Interests updated');
          }
        }
      }

      console.log('✅ Profile updated successfully, fetching updated profile...');
      
      // Return updated user profile with profileComplete: true
      const updatedUser = await this.getUserProfile(userId);
      if (updatedUser) {
        // Mark profile as complete since we just updated it
        updatedUser.profileComplete = true;
        console.log('✅ Profile marked as complete');
      }
      
      return updatedUser;
    } catch (error: any) {
      console.error('❌ Unexpected update profile error:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      callback(event, session);
    });
  }
}

export const authService = new AuthService();