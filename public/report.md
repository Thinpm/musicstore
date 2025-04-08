# Báo cáo chi tiết về GUI của Sound Streamline

## 1. Tổng quan
Sound Streamline là một ứng dụng phát nhạc trực tuyến với giao diện người dùng được xây dựng bằng React và TypeScript. Ứng dụng sử dụng các công nghệ hiện đại như TailwindCSS cho styling và React Router cho điều hướng.

## 2. Cấu trúc thư mục GUI

### 2.1. Cấu trúc thư mục chính
```
src/
├── components/               # Các components của ứng dụng
│   ├── audio/               # Components xử lý âm thanh
│   │   ├── audio-player-provider.tsx  # Context cho audio player
│   │   ├── audio-player.tsx           # Component chính phát nhạc
│   │   ├── audio-controls.tsx         # Điều khiển phát nhạc
│   │   ├── audio-progress.tsx         # Thanh tiến trình
│   │   ├── audio-volume.tsx           # Điều khiển âm lượng
│   │   └── audio-queue.tsx            # Quản lý hàng đợi phát
│   ├── auth/                # Components xác thực
│   │   ├── auth-provider.tsx          # Context xác thực
│   │   ├── login-form.tsx            # Form đăng nhập
│   │   └── register-form.tsx         # Form đăng ký
│   ├── layout/              # Components bố cục
│   │   ├── layout.tsx               # Layout chính
│   │   ├── sidebar.tsx              # Thanh bên
│   │   ├── navbar.tsx               # Thanh điều hướng
│   │   ├── alphabet-bar.tsx         # Thanh tìm kiếm chữ cái
│   │   └── footer.tsx               # Chân trang
│   ├── playlist/            # Components playlist
│   │   ├── playlist-list.tsx        # Danh sách playlist
│   │   ├── playlist-item.tsx        # Item playlist
│   │   ├── playlist-form.tsx        # Form tạo/sửa playlist
│   │   └── playlist-actions.tsx     # Các hành động playlist
│   ├── queue/               # Components hàng đợi
│   │   ├── queue-list.tsx           # Danh sách phát
│   │   └── queue-item.tsx           # Item trong hàng đợi
│   ├── share/               # Components chia sẻ
│   │   ├── share-button.tsx         # Nút chia sẻ
│   │   └── share-modal.tsx          # Modal chia sẻ
│   └── ui/                  # Components UI cơ bản
│       ├── button.tsx              # Nút
│       ├── input.tsx               # Input
│       ├── modal.tsx               # Modal
│       ├── toast.tsx               # Toast notifications
│       └── tooltip.tsx             # Tooltip
├── pages/                   # Các trang của ứng dụng
│   ├── Dashboard.tsx        # Trang chủ (4.9KB)
│   ├── Upload.tsx          # Trang upload (14KB)
│   ├── Profile.tsx         # Trang cá nhân (12KB)
│   ├── Playlists.tsx       # Trang playlist (8.0KB)
│   ├── PlaylistDetail.tsx  # Chi tiết playlist (7.6KB)
│   ├── SharedPlaylist.tsx  # Playlist được chia sẻ (3.8KB)
│   ├── SongDetail.tsx      # Chi tiết bài hát (6.3KB)
│   ├── SharedSong.tsx      # Bài hát được chia sẻ (10KB)
│   ├── Favorites.tsx       # Danh sách yêu thích (1.6KB)
│   ├── Login.tsx           # Đăng nhập (4.2KB)
│   └── Register.tsx        # Đăng ký (8.2KB)
└── styles/                  # Styles của ứng dụng
    ├── globals.css         # CSS toàn cục
    └── tailwind.css        # Cấu hình Tailwind
```

### 2.2. Components Chi Tiết (`src/components/`)

#### 2.2.1. Audio Components (`src/components/audio/`)
- **Audio Player Provider** (`audio-player-provider.tsx`)
  - Context cho trình phát nhạc
  - Quản lý trạng thái phát nhạc
  - Xử lý các events audio

- **Audio Player** (`audio-player.tsx`)
  - Component chính xử lý phát nhạc
  - Tích hợp với Web Audio API
  - Hiển thị thông tin bài hát đang phát

- **Audio Controls** (`audio-controls.tsx`)
  - Các nút điều khiển (play/pause/next/previous)
  - Điều khiển chế độ phát (repeat/shuffle)
  - Hiển thị trạng thái phát

#### 2.2.2. Authentication Components (`src/components/auth/`)
- **Auth Provider** (`auth-provider.tsx`)
  - Quản lý trạng thái đăng nhập
  - Xử lý token và session
  - Phân quyền người dùng

- **Login/Register Forms**
  - Validation form
  - Xử lý lỗi đăng nhập/đăng ký
  - Tích hợp với API xác thực

#### 2.2.3. Layout Components (`src/components/layout/`)
- **Main Layout** (`layout.tsx`)
  - Bố cục chung cho ứng dụng
  - Responsive design
  - Quản lý theme

- **Navigation** (`sidebar.tsx`, `navbar.tsx`)
  - Menu điều hướng
  - Thanh tìm kiếm
  - User menu

### 2.3. Pages Chi Tiết (`src/pages/`)

#### 2.3.1. Trang Chính
- **Dashboard** (`Dashboard.tsx`)
  - Hiển thị tổng quan
  - Danh sách bài hát gần đây
  - Playlist đề xuất

- **Upload** (`Upload.tsx`)
  - Form upload file
  - Preview bài hát
  - Chỉnh sửa metadata

#### 2.3.2. Quản lý Playlist
- **Playlists** (`Playlists.tsx`)
  - Danh sách playlist
  - Tạo playlist mới
  - Sắp xếp và tìm kiếm

- **PlaylistDetail** (`PlaylistDetail.tsx`)
  - Thông tin chi tiết playlist
  - Danh sách bài hát
  - Chức năng chỉnh sửa

### 2.4. Styles và Theme (`src/styles/`)
- **Global Styles** (`globals.css`)
  - Reset CSS
  - Biến màu sắc
  - Typography

- **Tailwind Config** (`tailwind.config.ts`)
  - Cấu hình theme
  - Custom utilities
  - Responsive breakpoints

### 2.5. Assets và Resources
```
public/
├── images/               # Hình ảnh tĩnh
│   ├── logo.svg         # Logo ứng dụng
│   ├── icons/           # Icons
│   └── placeholder.svg  # Ảnh placeholder
├── fonts/               # Web fonts
└── locales/             # File ngôn ngữ
```

## 3. Tính năng chính của GUI

### 3.1. Hệ thống điều hướng
- Sử dụng React Router cho điều hướng
- Sidebar cho menu chính
- Thanh tìm kiếm theo chữ cái (AlphabetBar)

### 3.2. Quản lý Theme
- Hỗ trợ Dark/Light mode
- Theme Provider tích hợp
- Lưu trữ preference người dùng

### 3.3. Phát nhạc
- Trình phát nhạc tích hợp
- Điều khiển phát/dừng/next/previous
- Hiển thị thông tin bài hát đang phát

### 3.4. Tương tác người dùng
- Toast notifications cho thông báo
- Tooltips cho hướng dẫn
- Modal dialogs cho tương tác
- Form validation và error handling

### 3.5. Responsive Design
- Giao diện thích ứng với nhiều kích thước màn hình
- Sidebar có thể thu gọn
- Layout linh hoạt

## 4. Công nghệ sử dụng

- React + TypeScript
- TailwindCSS cho styling
- React Router cho routing
- React Query cho state management
- Shadcn UI cho components
- React-Toastify cho notifications

## 5. Tối ưu hóa

- Code splitting theo routes
- Lazy loading cho components
- Caching với React Query
- Optimized re-renders
- Efficient state management

## 6. Bảo mật

- Protected routes
- Authentication state management
- Secure token handling
- Input validation
- Error boundaries 

## 7. API và Services

### 7.1. Cấu trúc thư mục API
```
src/
├── api/                      # Định nghĩa API endpoints
│   ├── authApi.ts           # API xác thực (797B)
│   └── musicApi.ts          # API quản lý nhạc (1.1KB)
├── services/                 # Logic nghiệp vụ
│   ├── api.ts               # Cấu hình API chung (4.8KB)
│   ├── auth.ts              # Xử lý xác thực (1.3KB)
│   ├── trackService.ts      # Quản lý bài hát (10KB)
│   ├── playlistService.ts   # Quản lý playlist (13KB)
│   ├── shareService.ts      # Quản lý chia sẻ (9.7KB)
│   ├── favoriteService.ts   # Quản lý yêu thích (3.0KB)
│   └── userService.ts       # Quản lý người dùng (10KB)
└── types/                   # Type definitions
    ├── api.types.ts         # Types cho API
    └── response.types.ts    # Types cho response
```

### 7.2. Chi tiết API Endpoints

#### 7.2.1. Authentication API (`src/api/authApi.ts`)
```typescript
// Interface definitions
interface User {
  id: string;
  fullName: string;
  email: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Endpoints
const authApi = {
  register: '/api/auth/register',  // POST
  login: '/api/auth/login',        // POST
  logout: '/api/auth/logout',      // POST
  refresh: '/api/auth/refresh',    // POST
  profile: '/api/auth/profile'     // GET
};
```

#### 7.2.2. Music API (`src/api/musicApi.ts`)
```typescript
// Interface definitions
interface Music {
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

// API Endpoints
const musicApi = {
  getAllMusic: '/api/music',           // GET
  getMusicById: '/api/music/:id',      // GET
  createMusic: '/api/music',           // POST
  updateMusic: '/api/music/:id',       // PUT
  deleteMusic: '/api/music/:id',       // DELETE
  searchMusic: '/api/music/search'     // GET
};
```

### 7.3. Services Implementation

#### 7.3.1. API Service (`src/services/api.ts`)
```typescript
// Cấu hình Axios
const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptors
api.interceptors.request.use(authInterceptor);
api.interceptors.response.use(responseInterceptor);
```

#### 7.3.2. Track Service (`src/services/trackService.ts`)
- **File Location**: `src/services/trackService.ts`
- **Dependencies**:
  ```typescript
  import { supabase } from "@/lib/supabase";
  import { Track } from "@/types/music.types";
  ```
- **Main Functions**:
  - `getAllTracks(query: TrackQuery)`
  - `getTrackById(id: string)`
  - `uploadTrack(file: File, metadata: TrackMetadata)`
  - `deleteTrack(id: string)`

#### 7.3.3. Playlist Service (`src/services/playlistService.ts`)
- **File Location**: `src/services/playlistService.ts`
- **Dependencies**:
  ```typescript
  import { supabase } from "@/lib/supabase";
  import { Playlist } from "@/types/playlist.types";
  ```
- **Main Functions**:
  - `getPlaylists()`
  - `createPlaylist(name: string, description?: string)`
  - `addSongToPlaylist(playlistId: string, songId: string)`
  - `removeSongFromPlaylist(playlistId: string, songId: string)`

### 7.4. API Security Implementation

#### 7.4.1. Authentication (`src/services/auth.ts`)
```typescript
// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  refreshIn: '7d'
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  // ... token validation logic
};
```

#### 7.4.2. API Protection (`src/middleware/`)
```
src/middleware/
├── auth.middleware.ts       # Xác thực request
├── validation.middleware.ts # Validate input
├── rate-limit.middleware.ts # Giới hạn request
└── error.middleware.ts      # Xử lý lỗi
```

### 7.5. API Testing và Documentation

#### 7.5.1. API Tests (`src/__tests__/api/`)
```
src/__tests__/api/
├── auth.test.ts            # Test xác thực
├── music.test.ts           # Test music API
└── playlist.test.ts        # Test playlist API
```

#### 7.5.2. API Documentation (`src/api-docs/`)
```
src/api-docs/
├── swagger.json           # Swagger configuration
├── auth.yaml             # Auth API documentation
└── music.yaml            # Music API documentation
```

### 7.6. Error Handling

#### 7.6.1. Error Types (`src/types/errors.ts`)
```typescript
export enum ApiErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

#### 7.6.2. Error Handlers (`src/utils/error-handlers.ts`)
- Xử lý lỗi validation
- Xử lý lỗi authentication
- Xử lý lỗi server
- Logging errors

### 7.7. API Monitoring

#### 7.7.1. Performance Monitoring
- Request timing
- Error rates
- API usage metrics
- Response times

#### 7.7.2. Security Monitoring
- Failed authentication attempts
- Rate limit violations
- Suspicious patterns
- File upload monitoring

## 8. Music Management

### 8.1. Cấu trúc thư mục
```
src/
├── services/
│   ├── trackService.ts        # Quản lý bài hát
│   ├── playlistService.ts     # Quản lý playlist
│   ├── favoriteService.ts     # Quản lý yêu thích
│   ├── shareService.ts        # Quản lý chia sẻ
│   └── notificationSoundService.ts  # Quản lý âm thanh thông báo
├── components/
│   ├── audio/                 # Components xử lý âm thanh
│   │   ├── audio-player.tsx   # Trình phát nhạc
│   │   └── audio-controls.tsx # Điều khiển phát nhạc
│   ├── playlist/             # Components playlist
│   │   ├── playlist-list.tsx  # Danh sách playlist
│   │   └── playlist-item.tsx  # Item playlist
│   └── queue/                # Components hàng đợi
│       ├── queue-list.tsx     # Danh sách phát
│       └── queue-item.tsx     # Item trong hàng đợi
└── lib/
    ├── utils.ts              # Các hàm tiện ích
    └── supabase.ts           # Cấu hình Supabase
```

### 8.2. Quản lý Bài Hát (`src/services/trackService.ts`)

#### 8.2.1. Cấu trúc Dữ liệu
- **SongData Interface**:
  ```typescript
  interface SongData {
    id: string;
    title: string;
    artist: string | null;
    duration: number | null;
    url: string;
    cover_url: string | null;
    user_id: string;
    created_at?: string;
    updated_at?: string;
  }
  ```

#### 8.2.2. Chức năng Chính
1. **Quản lý Bài Hát**:
   - Lấy danh sách bài hát (`getAllTracks`)
   - Tìm kiếm bài hát theo chữ cái (`getTracksByLetter`)
   - Xem chi tiết bài hát (`getTrackById`)
   - Upload bài hát mới (`uploadTrack`)

2. **Xử lý File**:
   - Upload file âm thanh
   - Xử lý ảnh bìa
   - Tạo signed URL cho streaming
   - Quản lý metadata

3. **Tìm Kiếm và Lọc**:
   - Tìm kiếm theo chữ cái đầu
   - Sắp xếp theo các tiêu chí
   - Phân trang kết quả

### 8.3. Quản lý Playlist (`src/services/playlistService.ts`)

#### 8.3.1. Cấu trúc Dữ liệu
- **Playlist Interface**:
  ```typescript
  interface Playlist {
    id: string;
    name: string;
    title?: string;
    description?: string;
    songs: Track[];
    tracks?: Track[];
    user_id: string;
    created_at?: string;
    updated_at?: string;
  }
  ```

#### 8.3.2. Chức năng Chính
1. **Quản lý Playlist**:
   - Tạo playlist mới (`createPlaylist`)
   - Lấy danh sách playlist (`getPlaylists`)
   - Thêm/xóa bài hát khỏi playlist
   - Cập nhật thông tin playlist

2. **Quản lý Bài Hát trong Playlist**:
   - Thêm bài hát vào playlist (`addSongToPlaylist`)
   - Xóa bài hát khỏi playlist (`removeSongFromPlaylist`)
   - Kiểm tra quyền sở hữu
   - Xử lý trùng lặp

3. **Bảo mật và Quyền**:
   - Kiểm tra quyền sở hữu playlist
   - Kiểm tra quyền sở hữu bài hát
   - Xác thực người dùng

### 8.4. Xử lý Âm Thanh

#### 8.4.1. Audio Components (`src/components/audio/`)
- `audio-player.tsx`: Component chính xử lý phát nhạc
- `audio-controls.tsx`: Các nút điều khiển phát nhạc
- `audio-progress.tsx`: Thanh tiến trình phát nhạc
- `audio-volume.tsx`: Điều khiển âm lượng
- `audio-queue.tsx`: Quản lý hàng đợi phát nhạc

#### 8.4.2. Audio Processing (`src/lib/`)
- `audio-processor.ts`: Xử lý và tối ưu file âm thanh
- `metadata-extractor.ts`: Trích xuất metadata từ file nhạc
- `audio-cache.ts`: Quản lý cache cho audio streaming

### 8.5. Tích Hợp Storage

#### 8.5.1. File Storage Configuration (`src/lib/supabase.ts`)
```typescript
// Cấu hình storage buckets
const STORAGE_BUCKETS = {
  SONGS: 'songs',
  COVERS: 'covers',
  AVATARS: 'avatars'
};
```

#### 8.5.2. Database Schema (`supabase/`)
- `migrations/`: Các file migration cho database
- `schema.sql`: Schema chính của database
- `seed.sql`: Dữ liệu mẫu cho testing

### 8.6. Các File Liên Quan Khác

#### 8.6.1. Types và Interfaces (`src/types/`)
- `music.types.ts`: Định nghĩa kiểu dữ liệu cho bài hát
- `playlist.types.ts`: Định nghĩa kiểu dữ liệu cho playlist
- `supabase.ts`: Types được tạo tự động từ database

#### 8.6.2. Utilities (`src/lib/utils.ts`)
- Hàm xử lý định dạng thời gian
- Hàm chuyển đổi metadata
- Hàm validate file âm thanh
- Hàm tối ưu hóa file

#### 8.6.3. Constants (`src/lib/constants.ts`)
- Các hằng số cho định dạng file
- Giới hạn kích thước file
- Cấu hình cache
- Cấu hình streaming

### 8.7. Tối Ưu Hóa

#### 8.7.1. Performance
- Lazy loading cho danh sách dài
- Caching cho dữ liệu thường xuyên truy cập
- Tối ưu hóa query database

#### 8.7.2. User Experience
- Phản hồi realtime
- Xử lý lỗi thông minh
- Progress tracking cho upload

### 8.8. Bảo Mật

#### 8.8.1. Access Control
- Phân quyền người dùng
- Kiểm soát truy cập file
- Bảo vệ API endpoints

#### 8.8.2. Data Protection
- Mã hóa dữ liệu nhạy cảm
- Xác thực file upload
- Kiểm tra tính toàn vẹn dữ liệu 

## 9. DAO (Data Access Object)

### 9.1. Cấu trúc thư mục DAO
```
src/
└── dao/
    ├── supabaseClient.ts   # Cấu hình kết nối Supabase
    ├── trackDAO.ts         # Xử lý dữ liệu bài hát
    ├── playlistDAO.ts      # Xử lý dữ liệu playlist
    └── shareDAO.ts         # Xử lý dữ liệu chia sẻ
```

### 9.2. Schema Database
Database được quản lý bởi Supabase với các bảng chính sau:

#### 1. Bảng users
```typescript
users: {
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
  updated_at: string | null
}
```

#### 2. Bảng songs
```typescript
songs: {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  cover_url: string
  user_id: string
  created_at: string
  updated_at: string | null
  is_public: boolean
}
```

#### 3. Bảng playlists
```typescript
playlists: {
  id: string
  name: string
  description: string
  cover_url: string
  user_id: string
  is_public: boolean
  created_at: string
  updated_at: string | null
}
```

#### 4. Bảng playlist_songs
```typescript
playlist_songs: {
  playlist_id: string
  song_id: string
  added_at: string
  position: number
}
```

#### 5. Bảng favorites
```typescript
favorites: {
  id: string
  user_id: string
  song_id: string
  created_at: string
}
```

#### 6. Bảng shared_files
```typescript
shared_files: {
  id: string
  song_id: string | null
  playlist_id: string | null
  token: string
  permissions: string
  shared_with_email: string
  created_at: string
  expires_at: string | null
  is_active: boolean
  created_by: string
}
```

### 9.3. Chi tiết các DAO

#### 9.3.1. Track DAO (`trackDAO.ts`)
Quản lý các thao tác với bài hát:
- `getAllTracks()`: Lấy danh sách tất cả bài hát
- `getTrackById(id)`: Lấy thông tin một bài hát theo ID
- `createTrack(track)`: Tạo bài hát mới
- `updateTrack(id, track)`: Cập nhật thông tin bài hát
- `deleteTrack(id)`: Xóa bài hát

#### 9.3.2. Playlist DAO (`playlistDAO.ts`)
Quản lý các thao tác với playlist:
- `getPlaylists()`: Lấy danh sách playlist
- `getPlaylistById(id)`: Lấy thông tin playlist theo ID
- `createPlaylist(playlist)`: Tạo playlist mới
- `updatePlaylist(id, playlist)`: Cập nhật thông tin playlist
- `deletePlaylist(id)`: Xóa playlist
- `addSongToPlaylist(playlistId, songId, position)`: Thêm bài hát vào playlist
- `removeSongFromPlaylist(playlistId, songId)`: Xóa bài hát khỏi playlist
- `getPlaylistSongs(playlistId)`: Lấy danh sách bài hát trong playlist

#### 9.3.3. Share DAO (`shareDAO.ts`)
Quản lý các thao tác chia sẻ:
- `createShare(share)`: Tạo link chia sẻ mới
- `getShareByToken(token)`: Lấy thông tin chia sẻ theo token
- `getSharedPlaylist(token)`: Lấy thông tin playlist được chia sẻ
- `getSharedSong(token)`: Lấy thông tin bài hát được chia sẻ

### 9.4. Tương tác với Database
Sử dụng Supabase Client để kết nối với database:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 9.5. Error Handling
Tất cả các hàm DAO đều có xử lý lỗi cơ bản bằng cách kiểm tra `error` từ Supabase và ném ra ngoại lệ nếu có lỗi xảy ra.

### 9.6. Bảo mật
- Sử dụng biến môi trường để lưu trữ thông tin nhạy cảm (URL và API key)
- Kiểm tra quyền truy cập thông qua token và permissions trong bảng shared_files
- Phân biệt nội dung public/private thông qua trường is_public

## 10. Database

### 10.1. Các File Liên Quan
```
src/
├── dao/                      # Thư mục chứa các file xử lý database
│   ├── supabaseClient.ts     # Cấu hình và kết nối Supabase (1.5KB)
│   ├── trackDAO.ts           # Xử lý dữ liệu bài hát (1.4KB)
│   ├── playlistDAO.ts        # Xử lý dữ liệu playlist (2.5KB)
│   └── shareDAO.ts           # Xử lý dữ liệu chia sẻ (3.6KB)
├── types/                    # Định nghĩa kiểu dữ liệu
│   └── supabase.ts          # Types tự động từ database
└── lib/
    └── supabase.ts          # Cấu hình và utilities cho Supabase
```

### 10.2. Schema Database
Database được quản lý bởi Supabase với các bảng chính sau:

#### 1. Bảng users
```typescript
users: {
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
  updated_at: string | null
}
```

#### 2. Bảng songs
```typescript
songs: {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  cover_url: string
  user_id: string
  created_at: string
  updated_at: string | null
  is_public: boolean
}
```

#### 3. Bảng playlists
```typescript
playlists: {
  id: string
  name: string
  description: string
  cover_url: string
  user_id: string
  is_public: boolean
  created_at: string
  updated_at: string | null
}
```

#### 4. Bảng playlist_songs
```typescript
playlist_songs: {
  playlist_id: string
  song_id: string
  added_at: string
  position: number
}
```

#### 5. Bảng favorites
```typescript
favorites: {
  id: string
  user_id: string
  song_id: string
  created_at: string
}
```

#### 6. Bảng shared_files
```typescript
shared_files: {
  id: string
  song_id: string | null
  playlist_id: string | null
  token: string
  permissions: string
  shared_with_email: string
  created_at: string
  expires_at: string | null
  is_active: boolean
  created_by: string
}
```

### 10.3. Quan hệ giữa các bảng
1. `users` - `songs`: Một user có thể có nhiều bài hát (1-n)
2. `users` - `playlists`: Một user có thể có nhiều playlist (1-n)
3. `playlists` - `songs`: Quan hệ nhiều-nhiều (n-n) thông qua bảng `playlist_songs`
4. `users` - `songs`: Quan hệ yêu thích nhiều-nhiều (n-n) thông qua bảng `favorites`
5. `shared_files` có thể liên kết với `songs` hoặc `playlists` (tùy chọn)

## 11. Tối ưu hóa

### 11.1. Performance
- Lazy loading cho danh sách dài
- Caching cho dữ liệu thường xuyên truy cập
- Tối ưu hóa query database

### 11.2. User Experience
- Phản hồi realtime
- Xử lý lỗi thông minh
- Progress tracking cho upload

## 12. Bảo mật

### 12.1. Access Control
- Phân quyền người dùng
- Kiểm soát truy cập file
- Bảo vệ API endpoints

### 12.2. Data Protection
- Mã hóa dữ liệu nhạy cảm
- Xác thực file upload
- Kiểm tra tính toàn vẹn dữ liệu 

## 13. Backup và Recovery

### 13.1. Backup Strategy
- Daily full backups
- Hourly incremental backups
- Transaction log backups every 5 minutes
- 30-day retention policy

### 13.2. Recovery Procedures
- Point-in-time recovery support
- Automated recovery testing
- Disaster recovery plan
- Data integrity checks

## 14. Monitoring và Maintenance

### 14.1. Performance Monitoring
- Query performance tracking
- Index usage statistics
- Table growth monitoring
- Lock monitoring

### 14.2. Maintenance Tasks
- Regular vacuum
- Index reindexing
- Statistics updates
- Disk space management 