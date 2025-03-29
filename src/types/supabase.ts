
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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string | null
          duration: number | null
          url: string
          cover_url: string | null
          user_id: string
          created_at: string
          updated_at: string | null
          is_public: boolean | null
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          duration?: number | null
          url: string
          cover_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string | null
          is_public?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          artist?: string | null
          duration?: number | null
          url?: string
          cover_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string | null
          is_public?: boolean | null
        }
      }
      playlists: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_url: string | null
          user_id: string
          is_public: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_url?: string | null
          user_id: string
          is_public?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cover_url?: string | null
          user_id?: string
          is_public?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
      }
      playlist_songs: {
        Row: {
          playlist_id: string
          song_id: string
          added_at: string
          position: number | null
        }
        Insert: {
          playlist_id: string
          song_id: string
          added_at?: string
          position?: number | null
        }
        Update: {
          playlist_id?: string
          song_id?: string
          added_at?: string
          position?: number | null
        }
      }
      shared_files: {
        Row: {
          id: string
          song_id: string
          shared_by: string
          shared_with_email: string
          permissions: string | null
          token: string | null
          created_at: string
          expires_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          song_id: string
          shared_by: string
          shared_with_email: string
          permissions?: string | null
          token?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          song_id?: string
          shared_by?: string
          shared_with_email?: string
          permissions?: string | null
          token?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean | null
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
