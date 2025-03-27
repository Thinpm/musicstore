
# Frontend Routes and Data Requirements

This document outlines all frontend routes and the data required for each page. Backend developers can use this to understand what API calls will be made when users visit different pages.

## Public Routes (No Authentication Required)

### `/login`

- **Component**: `Login.tsx`
- **Data Requirements**:
  - None initial, but requires auth API endpoint for form submission
- **API Calls**:
  - `POST /api/auth/login` (when form submitted)

### `/register`

- **Component**: `Register.tsx`
- **Data Requirements**:
  - None initial, but requires auth API endpoint for form submission
- **API Calls**:
  - `POST /api/auth/register` (when form submitted)

### `/reset-password`

- **Component**: (To be implemented)
- **Data Requirements**:
  - Token validation
- **API Calls**:
  - `POST /api/auth/reset-password` (when form submitted)

## Protected Routes (Authentication Required)

### `/` (Dashboard)

- **Component**: `Dashboard.tsx`
- **Data Requirements**:
  - List of user's audio tracks
  - Filter functionality by first letter (A-Z)
  - Optional: recently played, favorites
- **API Calls**:
  - `GET /api/tracks` (with optional filtering)
  - `GET /api/stats/popular-tracks` (for recommended section)

### `/playlists`

- **Component**: `Playlists.tsx`
- **Data Requirements**:
  - List of user's playlists
  - Filter functionality by first letter (A-Z)
- **API Calls**:
  - `GET /api/playlists` (with optional filtering)

### `/playlists/:id`

- **Component**: `PlaylistDetails.tsx`
- **Data Requirements**:
  - Playlist metadata (title, description, cover)
  - List of tracks in the playlist
- **API Calls**:
  - `GET /api/playlists/:id?includeTracks=true`
  - `POST /api/playlists/:id/tracks` (when adding track)
  - `DELETE /api/playlists/:id/tracks/:trackId` (when removing track)

### `/upload`

- **Component**: `Upload.tsx`
- **Data Requirements**:
  - Storage usage information
  - Upload endpoint
- **API Calls**:
  - `GET /api/user/storage` (to check available space)
  - `POST /api/tracks/upload` (for file upload)

### `/profile`

- **Component**: `Profile.tsx`
- **Data Requirements**:
  - User profile information
  - Storage usage details
- **API Calls**:
  - `GET /api/user/profile`
  - `GET /api/user/storage`
  - `PUT /api/user/profile` (when updating profile)
  - `POST /api/user/avatar` (when changing avatar)
  - `POST /api/user/change-password` (when changing password)

### `/search`

- **Component**: (To be implemented)
- **Data Requirements**:
  - Search results across tracks, playlists, and users
- **API Calls**:
  - `GET /api/search?q={searchTerm}`

## Global Components

### `AudioPlayer` (Footer)

- **Component**: `audio-player.tsx`
- **Data Requirements**:
  - Current track streaming URL
  - Track metadata (title, artist, cover)
  - Waveform data (optional)
- **API Calls**:
  - Track streaming URL directly
  - `GET /api/tracks/:id/waveform` (optional)
  - `POST /api/tracks/:id/play-count` (for analytics, optional)

### `Sidebar` (Navigation)

- **Component**: `sidebar.tsx`
- **Data Requirements**:
  - User's basic info (name, avatar)
  - Optional: storage usage summary
- **API Calls**:
  - Uses cached user data from profile or auth
  - No direct API calls usually needed
