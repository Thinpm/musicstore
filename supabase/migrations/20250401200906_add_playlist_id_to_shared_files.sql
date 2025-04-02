-- Thêm cột playlist_id vào bảng shared_files
ALTER TABLE shared_files
ADD COLUMN playlist_id UUID REFERENCES playlists(id);

-- Cập nhật RLS policies để cho phép truy cập playlist_id
ALTER POLICY "Enable read access for authenticated users" ON public.shared_files
    USING (auth.uid() = shared_by OR shared_with_email = auth.email());

ALTER POLICY "Enable insert for authenticated users only" ON public.shared_files
    USING (auth.uid() = shared_by)
    WITH CHECK (auth.uid() = shared_by);

ALTER POLICY "Enable update for users based on email" ON public.shared_files
    USING (auth.uid() = shared_by OR shared_with_email = auth.email())
    WITH CHECK (auth.uid() = shared_by OR shared_with_email = auth.email());

-- Thêm foreign key constraint
ALTER TABLE shared_files
ADD CONSTRAINT fk_shared_files_playlist
FOREIGN KEY (playlist_id)
REFERENCES playlists(id)
ON DELETE CASCADE;
