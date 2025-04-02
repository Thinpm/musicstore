-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy cho bảng songs
-- 1. Cho phép người dùng xem bài hát của chính họ
CREATE POLICY "Users can view own songs" ON songs
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Cho phép người dùng xem bài hát được chia sẻ với họ
CREATE POLICY "Users can view shared songs" ON songs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shared_files
    WHERE shared_files.song_id = id
    AND shared_files.is_active = true
    AND (
      shared_files.shared_with_email = auth.jwt()->>'email'
      OR shared_files.shared_with_email IS NULL
    )
    AND (
      shared_files.expires_at IS NULL
      OR shared_files.expires_at > NOW()
    )
  )
);

-- 3. Chỉ cho phép chủ sở hữu chỉnh sửa và xóa
CREATE POLICY "Users can update their own songs" ON songs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs" ON songs
FOR DELETE
USING (auth.uid() = user_id);

-- Policy cho bảng playlists
-- 1. Chỉ cho phép người dùng xem playlist của họ
CREATE POLICY "Users can view own playlists" ON playlists
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Chỉ cho phép chủ sở hữu chỉnh sửa và xóa playlist
CREATE POLICY "Users can update their own playlists" ON playlists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
FOR DELETE
USING (auth.uid() = user_id);

-- Policy cho bảng playlist_songs
-- 1. Chỉ cho phép người dùng xem nội dung playlist của họ
CREATE POLICY "Users can view songs in their playlists" ON playlist_songs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);

-- 2. Chỉ cho phép chủ sở hữu playlist thêm/xóa bài hát
CREATE POLICY "Users can modify songs in their playlists" ON playlist_songs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);

-- Policy cho bảng favorites
-- 1. Chỉ cho phép người dùng xem favorites của họ
CREATE POLICY "Users can view own favorites" ON favorites
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Chỉ cho phép người dùng thêm/xóa favorites của họ
CREATE POLICY "Users can modify own favorites" ON favorites
FOR ALL
USING (auth.uid() = user_id); 