import { useState, useRef } from 'react';

class NotificationSoundService {
  private currentAudio: HTMLAudioElement | null = null;

  private async getRandomSound(): Promise<string> {
    try {
      // Lấy danh sách file từ thư mục music_admin
      const response = await fetch('/music_admin/list.json');
      if (!response.ok) throw new Error('Không thể lấy danh sách âm thanh');
      
      const files: string[] = await response.json();
      if (!files || files.length === 0) throw new Error('Không có file âm thanh nào');

      // Chọn ngẫu nhiên một file
      const randomIndex = Math.floor(Math.random() * files.length);
      return `/music_admin/${files[randomIndex]}`;
    } catch (error) {
      console.error('Error getting random sound:', error);
      throw error;
    }
  }

  public async playRandomSound(): Promise<void> {
    try {
      // Dừng âm thanh đang phát (nếu có)
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      // Lấy đường dẫn file âm thanh ngẫu nhiên
      const soundUrl = await this.getRandomSound();

      // Tạo và phát âm thanh mới
      const audio = new Audio(soundUrl);
      this.currentAudio = audio;

      // Đợi audio load xong
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });

      // Phát âm thanh
      await audio.play();

      // Xóa reference khi phát xong
      audio.addEventListener('ended', () => {
        this.currentAudio = null;
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
      throw error;
    }
  }

  public stopSound(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export const notificationSoundService = new NotificationSoundService(); 