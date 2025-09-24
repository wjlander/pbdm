import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_data: {
        Row: {
          id: string
          user_id: string
          data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}