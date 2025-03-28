
# MP3 SaaS Backend Development Guide

This document provides technical information and guidelines for implementing the backend of our MP3 SaaS platform. It serves as the primary reference for backend developers working on this project.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime Environment** | Node.js |
| **API Framework** | Express.js |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **Type Safety** | TypeScript |
| **API Testing** | Jest / Supertest |
| **Documentation** | OpenAPI / Swagger |

## 🗺️ Architecture Overview

The backend follows a layered architecture:

1. **API Controllers** - Handle HTTP requests/responses
2. **Services** - Implement business logic
3. **Models** - Define database schemas and type interfaces
4. **Middleware** - Handle authentication, logging, error handling
5. **Utils** - Reusable helper functions

## 🔐 Authentication & Authorization

- User authentication is implemented using **Supabase Auth**
- JWT tokens are used for maintaining user sessions
- Role-based access control (RBAC) is implemented for features like:
  - Public vs. private tracks
  - Playlist sharing
  - Admin functions

## 💾 Data Storage

### Database Tables (PostgreSQL via Supabase)

- **users** - User profiles and account information
- **tracks** - Audio file metadata (title, artist, duration, etc.)
- **playlists** - Collection of tracks created by users
- **playlist_tracks** - Many-to-many relationship between playlists and tracks
- **favorites** - Users' favorite tracks
- **play_history** - Track play history for recommendations
- **user_playback_state** - State of current playback (current track, progress, volume)
- **play_queue** - User's queued tracks for continuous playback

### File Storage (Supabase Storage)

- **audio_files** - MP3 and other audio format storage
- **images** - Cover art, user avatars, playlist covers
- Use bucket policies to control access permissions

## 🔌 API Implementation Guide

1. **Review the API documents in this directory:**
   - `api-needs.md` - Comprehensive list of required endpoints
   - `schema-examples.json` - Expected data structures
   - `frontend-routes.md` - Frontend pages and their data requirements
   - `ui-behavior.md` - Special UI behaviors needing backend support

2. **Key API Features to Implement:**
   - User registration, login, and profile management
   - Track upload, streaming, and metadata management
   - Playlist creation and management
   - Track filtering (A-Z, genres, etc.)
   - Search functionality across tracks, playlists, and users
   - Playback state tracking and syncing across devices
   - Play history tracking for analytics and recommendations

3. **Data Processing Requirements:**
   - Extract metadata from uploaded audio files (title, artist, duration)
   - Generate waveform data for audio visualization
   - Process and optimize cover images
   - Track play count and user activity for analytics
   - Store and retrieve playback state for continuous listening experience

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Storage Configuration
STORAGE_BUCKET_AUDIO=audio_files
STORAGE_BUCKET_IMAGES=images

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Optional: External Services
AUDIO_PROCESSING_API=https://api.example.com/audio
```

## 📊 Database Schema

Follow the schemas in `schema-examples.json` closely when designing your database. Key considerations:

- Use UUIDs for primary keys
- Include created_at and updated_at timestamps on all tables
- Set up appropriate foreign key relationships
- Define indexes for frequently queried fields
- Implement Row Level Security (RLS) policies in Supabase

### Playback State Tracking

For the full-screen player and continuous playback features, implement these tables:

#### user_playback_state
- **user_id** (Primary Key, FK to users) - The user's ID
- **current_track_id** (FK to tracks) - Currently playing track
- **progress** (float) - Current playback position (0.0 to 1.0)
- **volume** (float) - Current volume level (0.0 to 1.0)
- **is_playing** (boolean) - Whether playback is active
- **is_looping** (boolean) - Whether repeat mode is enabled
- **is_shuffling** (boolean) - Whether shuffle mode is enabled
- **updated_at** (timestamp) - Last update time

#### play_history
- **id** (Primary Key, UUID) - Unique ID for the play event
- **user_id** (FK to users) - The user who played the track
- **track_id** (FK to tracks) - The track that was played
- **played_at** (timestamp) - When the track was played
- **play_duration** (integer) - How many seconds the track was played
- **source** (string) - From where the track was played (playlist, search, etc.)

#### play_queue
- **id** (Primary Key, UUID) - Unique queue entry ID
- **user_id** (FK to users) - The user's queue
- **track_id** (FK to tracks) - Track in the queue
- **position** (integer) - Position in the queue (for ordering)
- **added_at** (timestamp) - When the track was added to the queue

## 🔄 Real-time Features

Some features may benefit from real-time updates:

- Upload progress (via WebSockets or Server-Sent Events)
- Play count updates
- New playlist notifications
- Collaborative playlist editing
- Sync playback state across multiple devices
- Real-time player queue updates

## 📝 Implementation Notes

1. **Error Handling**
   - Return consistent error responses following the format in `schema-examples.json`
   - Log errors comprehensively for debugging
   - Provide user-friendly error messages

2. **Performance Considerations**
   - Paginate results for lists of tracks and playlists
   - Optimize database queries with appropriate indexes
   - Use caching where appropriate
   - Consider implementing CDN for audio file delivery
   - Optimize waveform data for quick loading in the full-screen player

3. **Security Best Practices**
   - Sanitize all user inputs
   - Implement proper access controls at the database level
   - Set up rate limiting to prevent abuse
   - Follow OWASP security guidelines
   - Secure playback URLs to prevent unauthorized access

4. **Playback State Management**
   - Update play count only when a significant portion of the track has been played
   - Store playback state periodically (not on every progress update)
   - Implement efficient queue management for continuous playback
   - Consider WebSocket connections for real-time sync across devices

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure your `.env` file
4. Set up Supabase tables and storage buckets
5. Run migrations and seed data if applicable
6. Start the development server with `npm run dev`

## 🧪 Testing

- Write unit tests for all service methods
- Write integration tests for API endpoints
- Set up a test database with Supabase for testing

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Working with the Frontend

- Review the frontend code to understand the expected data formats
- Check React Query implementations to see how data is consumed
- The frontend expects the API to be available at `VITE_API_URL` (from frontend `.env`)
- Default API URL is `http://localhost:3001/api`

---

Remember to follow the format described in `schema-examples.json` precisely, as the frontend expects specific data structures.
