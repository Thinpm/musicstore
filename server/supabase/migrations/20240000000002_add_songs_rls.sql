-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user xem bài hát của chính họ
CREATE POLICY "Users can view own songs" ON public.songs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy cho phép user xem bài hát được chia sẻ với họ
CREATE POLICY "Users can view shared songs" ON public.songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shared_files
      WHERE shared_files.song_id = id
      AND shared_files.is_active = true
      AND (
        -- Kiểm tra email được chia sẻ
        (shared_files.shared_with_email = auth.jwt()->>'email')
        OR
        -- Hoặc không có email cụ thể (chia sẻ công khai)
        (shared_files.shared_with_email IS NULL)
      )
      AND (
        -- Kiểm tra thời hạn
        shared_files.expires_at IS NULL
        OR
        shared_files.expires_at > NOW()
      )
    )
  );

-- Policy cho phép user update bài hát của họ
CREATE POLICY "Users can update own songs" ON public.songs
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy cho phép user xóa bài hát của họ
CREATE POLICY "Users can delete own songs" ON public.songs
  FOR DELETE USING (auth.uid() = user_id); 