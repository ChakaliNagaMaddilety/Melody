# Melody

**Your Music. Your Mood.**

A premium mobile music application built with React Native, Expo, and TypeScript. Melody lets you discover, search, and play music using the iTunes Search API, with full playlist management, favorites, and persistent storage.

---

## Features

### Music Discovery
- **Home/Discover screen** with featured albums, trending tracks, browse categories, recommendations, and recently played songs
- **Search screen** with real iTunes Search API integration, debounced input, loading states, empty results handling, and recent search history
- **Category browsing** across Pop, Rock, Hip-Hop, Electronic, Jazz, Classical, R&B, and Country

### Audio Player
- **Full-screen player** with album artwork, song title, artist, play/pause, previous/next, seek bar, shuffle, repeat (off/all/one), volume control, and playback queue
- **Persistent mini-player** visible across all main screens with progress bar
- **Preview clips** — all audio is 30-second previews from the iTunes API, clearly labeled in the UI
- **Shared player state** — one context drives both the mini-player and full-screen player
- **Queue management** — add to queue, remove from queue, clear queue

### Library & Storage
- **Favorites** — favorite and unfavorite tracks with heart icon
- **Playlists** — create, rename, delete, add tracks, remove tracks, with duplicate prevention
- **Recently played** — automatically tracks your listening history
- **Recent searches** — persisted search history with clear option
- **Preferences** — shuffle, repeat, and volume settings persist across restarts
- All data stored locally using `@react-native-async-storage/async-storage`

### User Experience
- Polished loading skeletons, toast notifications, confirmation dialogs
- Empty states with helpful messages and actions
- Error states with retry buttons
- Accessibility labels and roles throughout
- Safe-area support for notched devices
- Responsive layouts for small and large screens
- Dark theme with purple and coral accents

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native 0.81.4 + Expo SDK 54 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router 6 |
| Audio | expo-av 15.1.7 |
| Storage | @react-native-async-storage/async-storage 3.1.1 |
| Icons | lucide-react-native |
| Fonts | @expo-google-fonts/inter |
| Testing | Jest + ts-jest |

---

## Architecture

### Folder Structure

```
melody/
├── app/                        # Expo Router routes
│   ├── _layout.tsx            # Root layout: fonts, providers, Stack
│   ├── +not-found.tsx         # 404 screen
│   ├── player.tsx             # Full-screen player (modal)
│   ├── playlist/
│   │   └── [id].tsx           # Playlist detail screen
│   └── (tabs)/                # Bottom tab navigation
│       ├── _layout.tsx        # Tab bar + mini-player
│       ├── index.tsx          # Home/Discover
│       ├── search.tsx         # Search
│       ├── library.tsx        # Library (favorites/playlists/recent)
│       └── settings.tsx       # Settings
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── AlbumCard.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── Skeletons.tsx
│   │   ├── TextInputModal.tsx
│   │   ├── TrackCard.tsx
│   │   ├── TrackOptionsModal.tsx
│   │   └── TrackRow.tsx
│   ├── context/               # React Context providers
│   │   ├── LibraryContext.tsx # Playlists, favorites, recents
│   │   ├── PlayerContext.tsx  # Shared audio player state
│   │   └── ToastContext.tsx   # Toast notifications
│   ├── constants/             # App constants & theme
│   │   ├── config.ts
│   │   └── theme.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useFetchTracks.ts
│   │   └── useSearch.ts
│   ├── services/              # Business logic services
│   │   ├── audioPlayer.ts     # expo-av wrapper (singleton)
│   │   ├── itunesApi.ts       # iTunes Search API client
│   │   └── storage.ts         # AsyncStorage persistence
│   ├── types/                 # TypeScript models
│   │   └── index.ts
│   ├── utils/                 # Utilities
│   │   └── format.ts
│   └── __tests__/             # Jest test suites
│       ├── itunesApi.test.ts
│       ├── playerState.test.ts
│       ├── searchErrors.test.ts
│       └── storage.test.ts
├── hooks/
│   └── useFrameworkReady.ts
├── assets/images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Key Design Decisions

- **Single audio instance**: `AudioPlayerService` is a singleton that unloads the previous sound before loading a new one, preventing simultaneous audio.
- **Shared player state**: `PlayerContext` wraps the app and exposes one `playerState` object consumed by both the mini-player and full-screen player.
- **Track store**: Tracks referenced by playlists/favorites are persisted in AsyncStorage by ID. On load, the app resolves IDs back to full track objects.
- **Request cancellation**: Search uses `AbortController` to cancel stale requests when a new search begins.
- **Debounced search**: 400ms debounce prevents excessive API calls during typing.

---

## API Details

### iTunes Search API

- **Endpoint**: `https://itunes.apple.com/search`
- **Parameters**: `term`, `media=music`, `entity=song`, `limit=25`, `country=US`
- **Lookup endpoint**: `https://itunes.apple.com/lookup` (for batch track lookups)
- **Response**: JSON with `resultCount` and `results` array
- **Parsed fields**: `trackId`, `trackName`, `artistName`, `collectionName`, `artworkUrl100` (upgraded to 600x600), `previewUrl`, `trackTimeMillis`, `collectionId`, `primaryGenreName`, `releaseDate`

### Error Handling

- Network errors → user-facing message with retry button
- Parse errors → user-facing message with retry
- Empty/short search terms → no API call, inline validation
- Cancelled requests (AbortController) → silently ignored
- Missing preview URLs → error displayed in player, track still showable

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the Expo dev server
npm run dev

# Or use Expo CLI directly
npx expo start
```

Then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan QR code with Expo Go app on your physical device

---

## Testing Commands

```bash
# Run all tests
npm test

# Run tests with verbose output
npx jest --verbose

# TypeScript type checking
npm run typecheck

# Linting
npm run lint

# Web build
npm run build:web
```

### Test Coverage

| Test Suite | Tests | What's Covered |
|-----------|-------|---------------|
| itunesApi.test.ts | 15 | API response parsing, field extraction, artwork upgrade, error filtering |
| searchErrors.test.ts | 6 | Network errors, HTTP errors, parse errors, short terms, ApiError class |
| storage.test.ts | 20 | Playlist CRUD, favorites toggle, recent tracks, recent searches, preferences, clear all |
| playerState.test.ts | 12 | Repeat cycling, queue progression, previous track logic, shuffle, track end, queue removal |

**Total: 53 tests, all passing.**

---

## Android & iOS Build

### App Configuration

- **Display Name**: Melody
- **Android Package**: `com.melody.app`
- **iOS Bundle Identifier**: `com.melody.app`
- **Scheme**: `melody`

### EAS Build Setup

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Create `eas.json` in project root:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

5. Build for Android:
```bash
eas build --platform android --profile preview
```

6. Build for iOS:
```bash
eas build --platform ios --profile preview
```

### Testing on Android Emulator

1. Open Android Studio → AVD Manager → Create a virtual device
2. Start the emulator
3. Run `npx expo start` and press `a`

### Producing an Android Installable (APK)

```bash
eas build --platform android --profile preview --local
```

This produces an APK you can install on a physical device.

---

## Audio Preview Limitations

- All audio clips are **30-second previews** provided by the iTunes Search API, not full songs
- The app clearly labels these as previews with a "30-second preview" badge in the full-screen player
- Some tracks may not have preview URLs available — these show an error in the player
- Audio playback uses `expo-av` which supports background audio on both platforms
- Preview URLs are temporary and may expire; the app handles load failures gracefully

---

## Known Issues & Limitations

1. **Preview clips only**: The iTunes API provides 30-second previews, not full tracks
2. **No offline playback**: Audio requires an internet connection
3. **Artwork availability**: Some tracks may have missing artwork; a placeholder is shown
4. **No account system**: All data is stored locally on-device; no cloud sync
5. **Web platform**: The app is optimized for mobile; web playback may have limitations with expo-av

---

## License

This project uses the iTunes Search API which is subject to Apple's terms of service. This is a demo/educational project.
