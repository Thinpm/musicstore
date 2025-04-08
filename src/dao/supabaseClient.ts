import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          duration: number
          url: string
          cover_url: string
          user_id: string
          created_at: string
          updated_at: string | null
          is_public: boolean
        }
      }
      playlists: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          is_public: boolean
          created_at: string
          updated_at: string | null
        }
      }
      playlist_songs: {
        Row: {
          playlist_id: string
          song_id: string
          added_at: string
          position: number
        }
      }
      shared_files: {
        Row: {
          id: string
          song_id: string | null
          playlist_id: string | null
          token: string
          permissions: string
          expires_at: string | null
          created_at: string
          created_by: string
        }
      }
    }
  }
} 