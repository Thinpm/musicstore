ALTER TABLE shared_files ALTER COLUMN song_id DROP NOT NULL;
ALTER TABLE shared_files ALTER COLUMN playlist_id DROP NOT NULL;

-- Thêm ràng buộc kiểm tra để đảm bảo ít nhất một trong hai cột không null
ALTER TABLE shared_files ADD CONSTRAINT check_shared_item CHECK (
    (song_id IS NOT NULL AND playlist_id IS NULL) OR 
    (song_id IS NULL AND playlist_id IS NOT NULL)
);

