-- Thêm cột playlist_id vào bảng shared_files
ALTER TABLE public.shared_files
ADD COLUMN playlist_id UUID REFERENCES public.playlists(id);

-- Cập nhật RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.shared_files;
CREATE POLICY "Enable read access for authenticated users" ON public.shared_files
    FOR SELECT
    USING (auth.uid() = shared_by OR shared_with_email = auth.email());

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.shared_files;
CREATE POLICY "Enable insert for authenticated users only" ON public.shared_files
    FOR INSERT
    WITH CHECK (auth.uid() = shared_by);

DROP POLICY IF EXISTS "Enable update for users based on email" ON public.shared_files;
CREATE POLICY "Enable update for users based on email" ON public.shared_files
    FOR UPDATE
    USING (auth.uid() = shared_by OR shared_with_email = auth.email())
    WITH CHECK (auth.uid() = shared_by OR shared_with_email = auth.email());

-- Thêm index cho playlist_id để tối ưu hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_shared_files_playlist_id ON public.shared_files(playlist_id);

-- Thêm foreign key constraint với ON DELETE CASCADE
ALTER TABLE public.shared_files
DROP CONSTRAINT IF EXISTS fk_shared_files_playlist;

ALTER TABLE public.shared_files
ADD CONSTRAINT fk_shared_files_playlist
FOREIGN KEY (playlist_id)
REFERENCES public.playlists(id)
ON DELETE CASCADE; 