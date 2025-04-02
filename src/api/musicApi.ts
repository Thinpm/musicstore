import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Music {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  releaseDate: string;
  coverImage: string;
  audioUrl: string;
}

export const musicApi = {
  getAllMusic: async (): Promise<Music[]> => {
    const response = await axios.get(`${API_URL}/music`);
    return response.data;
  },

  getMusicById: async (id: string): Promise<Music> => {
    const response = await axios.get(`${API_URL}/music/${id}`);
    return response.data;
  },

  createMusic: async (music: Omit<Music, '_id'>): Promise<Music> => {
    const response = await axios.post(`${API_URL}/music`, music);
    return response.data;
  },

  updateMusic: async (id: string, music: Partial<Music>): Promise<Music> => {
    const response = await axios.put(`${API_URL}/music/${id}`, music);
    return response.data;
  },

  deleteMusic: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/music/${id}`);
  }
}; 