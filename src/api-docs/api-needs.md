
# API Requirements for MP3 SaaS Platform

This document describes the API endpoints needed by the frontend. Backend developers should implement these endpoints to ensure smooth integration.

## Authentication Endpoints

| Method | Endpoint                  | Description                                      | Request Body                                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| POST   | `/api/auth/register`      | Register a new user                              | `{ name, email, username, password }`          | `{ user: UserProfile, token: string }` |
| POST   | `/api/auth/login`         | Log in an existing user                          | `{ email, password }`                          | `{ user: UserProfile, token: string }` |
| POST   | `/api/auth/logout`        | Log out current user                             | `{}`                                           | `{ success: boolean }`                 |
| GET    | `/api/auth/verify-email/:token` | Verify user's email with token             | N/A                                            | `{ success: boolean, message: string }`|
| POST   | `/api/auth/forgot-password` | Request password reset                         | `{ email }`                                    | `{ success: boolean, message: string }`|
| POST   | `/api/auth/reset-password` | Reset password with token                       | `{ token, newPassword }`                       | `{ success: boolean, message: string }`|

## User Profile Endpoints

| Method | Endpoint                  | Description                                      | Request Body                                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| GET    | `/api/user/profile`       | Get current user's profile                       | N/A                                            | `UserProfile`                          |
| PUT    | `/api/user/profile`       | Update user profile                              | `{ name?, email?, username?, bio? }`           | `UserProfile`                          |
| POST   | `/api/user/avatar`        | Upload user avatar                               | FormData with `avatar` file                    | `{ avatarUrl: string }`                |
| GET    | `/api/user/storage`       | Get storage usage info                           | N/A                                            | `UserStorage`                          |
| POST   | `/api/user/change-password` | Change user password                           | `{ currentPassword, newPassword }`             | `{ success: boolean, message: string }`|

## Tracks Endpoints

| Method | Endpoint                  | Description                                      | Request Body / Query Params                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| GET    | `/api/tracks`             | Get all tracks with filtering                    | Query: `startsWith`, `limit`, `offset`, `sortBy`, `sortOrder` | `Track[]`                    |
| GET    | `/api/tracks/:id`         | Get a single track by ID                         | N/A                                            | `Track`                                |
| POST   | `/api/tracks/upload`      | Upload a new track                               | FormData with `file` and `metadata`            | `Track`                                |
| PUT    | `/api/tracks/:id`         | Update track metadata                            | `{ title?, artist?, cover? }`                  | `Track`                                |
| DELETE | `/api/tracks/:id`         | Delete a track                                   | N/A                                            | `{ success: boolean }`                 |
| POST   | `/api/tracks/:id/play`    | Record a play for analytics                      | N/A                                            | `{ success: boolean }`                 |
| GET    | `/api/tracks/:id/waveform` | Get track waveform data                         | N/A                                            | `number[]` (waveform data points)      |

## Playlists Endpoints

| Method | Endpoint                  | Description                                      | Request Body / Query Params                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| GET    | `/api/playlists`          | Get all playlists                                | Query: `startsWith`, `limit`, `offset`, `sortBy`, `sortOrder` | `Playlist[]`                 |
| GET    | `/api/playlists/:id`      | Get a playlist by ID                             | Query: `includeTracks=true/false`              | `Playlist` (with tracks if requested)  |
| POST   | `/api/playlists`          | Create a new playlist                            | `{ title, description, coverUrl? }`            | `Playlist`                             |
| PUT    | `/api/playlists/:id`      | Update a playlist                                | `{ title?, description?, coverUrl? }`          | `Playlist`                             |
| DELETE | `/api/playlists/:id`      | Delete a playlist                                | N/A                                            | `{ success: boolean }`                 |
| POST   | `/api/playlists/:id/tracks` | Add a track to a playlist                      | `{ trackId }`                                  | `{ success: boolean }`                 |
| DELETE | `/api/playlists/:id/tracks/:trackId` | Remove a track from playlist          | N/A                                            | `{ success: boolean }`                 |
| PUT    | `/api/playlists/:id/tracks/reorder` | Reorder tracks in a playlist           | `{ trackIds: string[] }`                       | `{ success: boolean }`                 |

## User Playback State Endpoints

| Method | Endpoint                  | Description                                      | Request Body / Query Params                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| GET    | `/api/user/playback`      | Get user's playback state                        | N/A                                            | `{ currentTrackId: string, progress: number, isPlaying: boolean, volume: number }` |
| PUT    | `/api/user/playback`      | Update user's playback state                     | `{ currentTrackId?: string, progress?: number, isPlaying?: boolean, volume?: number }` | `{ success: boolean }` |
| GET    | `/api/user/play-history`  | Get user's recently played tracks                | Query: `limit` (default 20)                    | `Track[]`                              |
| GET    | `/api/user/queue`         | Get user's play queue                            | N/A                                            | `Track[]`                              |
| POST   | `/api/user/queue`         | Add tracks to queue                              | `{ trackIds: string[] }`                       | `{ success: boolean }`                 |
| DELETE | `/api/user/queue/:trackId` | Remove track from queue                         | N/A                                            | `{ success: boolean }`                 |

## Search Endpoints

| Method | Endpoint                  | Description                                      | Request Body / Query Params                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| GET    | `/api/search`             | Search across tracks, playlists, users           | Query: `q` (search term), `type` (all/tracks/playlists/users) | `{ tracks: Track[], playlists: Playlist[], users: UserProfile[] }` |

## Miscellaneous Endpoints

| Method | Endpoint                  | Description                                      | Request Body / Query Params                    | Response                                |
|--------|---------------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------|
| GET    | `/api/stats/popular-tracks` | Get popular/trending tracks                    | Query: `limit` (default 10)                    | `Track[]`                              |
| GET    | `/api/stats/genres`       | Get list of available genres                     | N/A                                            | `string[]`                             |
