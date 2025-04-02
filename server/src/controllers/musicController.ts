import { Request, Response } from 'express';
import Music, { IMusic } from '../models/Music';

// Get all music
export const getAllMusic = async (req: Request, res: Response) => {
  try {
    const music = await Music.find();
    res.json(music);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching music', error });
  }
};

// Get music by ID
export const getMusicById = async (req: Request, res: Response) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }
    res.json(music);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching music', error });
  }
};

// Create new music
export const createMusic = async (req: Request, res: Response) => {
  try {
    const newMusic = new Music(req.body);
    const savedMusic = await newMusic.save();
    res.status(201).json(savedMusic);
  } catch (error) {
    res.status(400).json({ message: 'Error creating music', error });
  }
};

// Update music
export const updateMusic = async (req: Request, res: Response) => {
  try {
    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMusic) {
      return res.status(404).json({ message: 'Music not found' });
    }
    res.json(updatedMusic);
  } catch (error) {
    res.status(400).json({ message: 'Error updating music', error });
  }
};

// Delete music
export const deleteMusic = async (req: Request, res: Response) => {
  try {
    const deletedMusic = await Music.findByIdAndDelete(req.params.id);
    if (!deletedMusic) {
      return res.status(404).json({ message: 'Music not found' });
    }
    res.json({ message: 'Music deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting music', error });
  }
}; 