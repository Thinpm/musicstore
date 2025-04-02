# SoundStreamline - Ứng dụng Nghe nhạc Trực tuyến

SoundStreamline là một ứng dụng nghe nhạc trực tuyến cho phép người dùng tải lên, chia sẻ và thưởng thức âm nhạc. Với giao diện người dùng hiện đại và trải nghiệm mượt mà, SoundStreamline mang đến cách tốt nhất để khám phá và chia sẻ âm nhạc.

## Tính năng chính

- 🎵 **Phát nhạc trực tuyến**: Nghe nhạc với chất lượng cao
- 📤 **Tải lên**: Dễ dàng tải lên các bài hát của bạn
- 📋 **Playlist**: Tạo và quản lý các playlist cá nhân
- 💟 **Yêu thích**: Đánh dấu các bài hát yêu thích
- 🔄 **Chia sẻ**: Chia sẻ bài hát và playlist với bạn bè
- 👥 **Xác thực**: Hệ thống đăng nhập/đăng ký an toàn

## Công nghệ sử dụng

- **Frontend**:
  - React + TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui
  - React Router
  - Zustand

- **Backend**:
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)

## Cài đặt và Chạy

1. Clone repository:
```bash
git clone https://github.com/Thinpm/musicstore.git
cd musicstore
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env và cấu hình các biến môi trường:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Chạy ứng dụng ở môi trường development:
```bash
npm run dev
```

## Cấu trúc thư mục

```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── lib/           # Utilities và helpers
├── pages/         # Route components
├── services/      # API services
└── styles/        # Global styles
```

## API Documentation

### Authentication
- `POST /auth/register`: Đăng ký tài khoản mới
- `POST /auth/login`: Đăng nhập
- `POST /auth/logout`: Đăng xuất

### Songs
- `GET /songs`: Lấy danh sách bài hát
- `POST /songs`: Tải lên bài hát mới
- `GET /songs/:id`: Lấy thông tin bài hát
- `DELETE /songs/:id`: Xóa bài hát

### Playlists
- `GET /playlists`: Lấy danh sách playlist
- `POST /playlists`: Tạo playlist mới
- `PUT /playlists/:id`: Cập nhật playlist
- `DELETE /playlists/:id`: Xóa playlist

## Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request nếu bạn muốn cải thiện dự án.

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
