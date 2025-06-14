export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          school_or_job: string | null
          location: string | null
          bio: string | null
          profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          school_or_job?: string | null
          location?: string | null
          bio?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          school_or_job?: string | null
          location?: string | null
          bio?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_skills_teach: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          rating: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          rating?: number
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          rating?: number
          description?: string
          created_at?: string
        }
      }
      user_skills_learn: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          created_at?: string
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest_name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest_name?: string
          created_at?: string
        }
      }
      user_connections: {
        Row: {
          id: string
          user_id: string
          connected_user_id: string
          status: 'pending' | 'accepted' | 'rejected'
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          connected_user_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          connected_user_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}