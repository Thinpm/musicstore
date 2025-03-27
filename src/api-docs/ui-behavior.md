
# UI Behavior Documentation

This document explains key frontend behaviors that backend developers should be aware of to ensure proper integration.

## Alphabet Navigation (A-Z filtering)

The application includes an alphabet bar navigation that lets users quickly filter content:

- Located at the top of the `Dashboard` and `Playlists` pages
- Displays 26 circular buttons from A to Z
- Clicking a letter filters content (tracks or playlists) that start with that letter
- The active letter is highlighted visually

Backend implementation notes:
- The API should support the `startsWith` query parameter for efficient filtering
- Example: `GET /api/tracks?startsWith=A` or `GET /api/playlists?startsWith=B`
- This should filter by the first letter of the title (case-insensitive)
- Empty result sets should be handled gracefully (show "No results found")

## Audio Player

The audio player component has these characteristics:

- Fixed to the bottom of the screen
- Can be collapsed/expanded using a toggle button
- Shows current track info (title, artist, cover)
- Includes controls: play/pause, previous, next, volume, progress bar
- Persists playback state across page navigation

Backend implementation notes:
- Track streaming should support seeking (Range requests)
- Waveform data should be pre-generated and available via API
- Player state is managed client-side but might require play count tracking server-side

## Theme Preferences

The application supports light and dark modes:

- Soft theme uses muted colors that are easier on the eyes
- Theme preference is saved in localStorage
- System preference can be detected and applied automatically

Backend implementation notes:
- User theme preference could be stored in the user profile for cross-device sync
- No specific API endpoints are required for basic theme functionality

## Upload Flow

The upload process follows these steps:

1. User selects audio files (multiple file selection supported)
2. User fills optional metadata: title, artist, cover image
3. User clicks "Upload" to start the process
4. Progress is shown during upload
5. Upon completion, user is redirected to the Dashboard or the new track

Backend implementation notes:
- Support multipart/form-data uploads
- Process files asynchronously for large uploads
- Generate waveform data server-side
- Extract metadata from audio files when possible (ID3 tags)
- Handle cover image uploads separately or as part of the same request
- Provide progress information through WebSockets or chunked responses

## Playlist Management

Playlist management includes these interactions:

- Create, edit, and delete playlists
- Add/remove tracks to/from playlists
- Drag and drop reordering of tracks (future enhancement)
- Share playlists via URL

Backend implementation notes:
- Playlists should have a UUID or slug for sharing
- Track ordering should be preserved in the database
- Consider implementing public/private visibility settings
- Track lists should be paginated for performance with large playlists

## Search Functionality

The search behavior:

- Real-time search suggestions as user types
- Categorized results (tracks, playlists, users)
- Support for filtering by artist, title, or genre

Backend implementation notes:
- Implement full-text search with proper indexing
- Return categorized results in a single API call
- Support partial matching and prefix search
- Consider fuzzy search for typo tolerance
- Optimize for low latency responses
