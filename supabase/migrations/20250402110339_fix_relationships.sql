-- Xóa các foreign key hiện tại
ALTER TABLE shared_files DROP CONSTRAINT IF EXISTS shared_files_playlist_id_fkey;

-- Tạo lại foreign key với tên rõ ràng
ALTER TABLE shared_files 
    ADD CONSTRAINT shared_files_playlist_id_fkey 
    FOREIGN KEY (playlist_id) 
    REFERENCES playlists(id) 
    ON DELETE CASCADE; 