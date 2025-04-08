import { supabase } from './supabaseClient';
import type { Database } from './supabaseClient';

type Song = Database['public']['Tables']['songs']['Row'];

export const trackDAO = {
  async getAllTracks(): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTrackById(id: string): Promise<Song | null> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTrack(track: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .insert([track])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTrack(id: string, track: Partial<Song>): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .update(track)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTrack(id: string): Promise<void> {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 