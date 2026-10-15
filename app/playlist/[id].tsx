import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { useLibrary } from '@/src/context/LibraryContext';
import { usePlayer } from '@/src/context/PlayerContext';
import { useToast } from '@/src/context/ToastContext';
import { getTracksByIds } from '@/src/services/storage';
import { Track, Playlist } from '@/src/types';
import { TrackRow } from '@/src/components/TrackRow';
import { TrackOptionsModal } from '@/src/components/TrackOptionsModal';
import { EmptyState } from '@/src/components/EmptyState';
import { TextInputModal } from '@/src/components/TextInputModal';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { TrackListSkeleton } from '@/src/components/Skeletons';
import {
  ChevronLeft,
  Play,
  Shuffle,
  MoreVertical,
  Pencil,
  Trash2,
  Music,
} from 'lucide-react-native';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { playlists, renamePlaylist, deletePlaylist, removeTrackFromPlaylist, addTrackToPlaylist } = useLibrary();
  const { playQueue, playerState } = usePlayer();
  const { showToast } = useToast();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    const pl = playlists.find((p) => p.id === id);
    setPlaylist(pl || null);
    if (pl) {
      setIsLoading(true);
      getTracksByIds(pl.trackIds)
        .then((loaded) => {
          setTracks(loaded);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setTracks([]);
      setIsLoading(false);
    }
  }, [id, playlists]);

  const handlePlayAll = useCallback(() => {
    const playable = tracks.filter((t) => t.previewUrl);
    if (playable.length > 0) {
      playQueue(playable, 0);
      showToast(`Playing "${playlist?.name}"`, 'success');
    } else {
      showToast('No playable tracks in this playlist', 'error');
    }
  }, [tracks, playQueue, playlist, showToast]);

  const handleShuffle = useCallback(() => {
    const playable = tracks.filter((t) => t.previewUrl);
    if (playable.length > 0) {
      const shuffled = [...playable];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      playQueue(shuffled, 0);
      showToast(`Shuffling "${playlist?.name}"`, 'success');
    } else {
      showToast('No playable tracks to shuffle', 'error');
    }
  }, [tracks, playQueue, playlist, showToast]);

  const handleRename = useCallback(async (newName: string) => {
    if (!playlist) return;
    const success = await renamePlaylist(playlist.id, newName);
    if (success) {
      showToast('Playlist renamed', 'success');
    } else {
      showToast('Failed to rename playlist', 'error');
    }
    setRenameVisible(false);
  }, [playlist, renamePlaylist, showToast]);

  const handleDelete = useCallback(async () => {
    if (!playlist) return;
    const success = await deletePlaylist(playlist.id);
    if (success) {
      showToast('Playlist deleted', 'info');
      router.back();
    } else {
      showToast('Failed to delete playlist', 'error');
    }
    setDeleteConfirmVisible(false);
  }, [playlist, deletePlaylist, showToast, router]);

  const handleRemoveTrack = useCallback(async (trackId: number) => {
    if (!playlist) return;
    const success = await removeTrackFromPlaylist(playlist.id, trackId);
    if (success) {
      showToast('Track removed from playlist', 'info');
    } else {
      showToast('Failed to remove track', 'error');
    }
  }, [playlist, removeTrackFromPlaylist, showToast]);

  const showOptions = useCallback((track: Track) => {
    setOptionsTrack(track);
    setOptionsVisible(true);
  }, []);

  const firstTrack = tracks[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
            <ChevronLeft size={26} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>Playlist</Text>
          <Pressable onPress={() => setMenuVisible(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel="More options">
            <MoreVertical size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {playlist ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Playlist Hero */}
            <View style={styles.hero}>
              <View style={styles.heroArtwork}>
                {firstTrack?.artworkUrl ? (
                  <Image source={{ uri: firstTrack.artworkUrl }} style={styles.heroArtworkImage} />
                ) : (
                  <View style={[styles.heroArtworkImage, styles.placeholder]}>
                    <Music size={48} color={COLORS.textTertiary} />
                  </View>
                )}
              </View>
              <Text style={styles.playlistName} numberOfLines={2}>{playlist.name}</Text>
              <Text style={styles.playlistMeta}>
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
              </Text>

              {/* Action Buttons */}
              {tracks.length > 0 && (
                <View style={styles.actions}>
                  <Pressable style={styles.playButton} onPress={handlePlayAll} accessibilityRole="button" accessibilityLabel="Play all tracks">
                    <Play size={20} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
                    <Text style={styles.playButtonText}>Play All</Text>
                  </Pressable>
                  <Pressable style={styles.shuffleButton} onPress={handleShuffle} accessibilityRole="button" accessibilityLabel="Shuffle tracks">
                    <Shuffle size={20} color={COLORS.textPrimary} />
                    <Text style={styles.shuffleButtonText}>Shuffle</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Track List */}
            {isLoading ? (
              <TrackListSkeleton count={4} />
            ) : tracks.length > 0 ? (
              <View style={styles.trackList}>
                {tracks.map((track, i) => (
                  <TrackRow
                    key={`pl-track-${track.id}-${i}`}
                    track={track}
                    index={i}
                    onMorePress={() => showOptions(track)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<Music size={48} color={COLORS.textTertiary} />}
                title="No Tracks Yet"
                message="Search for music and add tracks to this playlist from the track options menu."
              />
            )}
          </ScrollView>
        ) : (
          <EmptyState
            icon={<Music size={48} color={COLORS.textTertiary} />}
            title="Playlist Not Found"
            message="This playlist may have been deleted."
            actionLabel="Go Back"
            onAction={() => router.back()}
          />
        )}
      </View>

      <TrackOptionsModal visible={optionsVisible} track={optionsTrack} onClose={() => setOptionsVisible(false)} />
      <TextInputModal
        visible={renameVisible}
        title="Rename Playlist"
        label="Playlist Name"
        placeholder="Enter new name"
        initialValue={playlist?.name || ''}
        confirmLabel="Rename"
        onConfirm={handleRename}
        onCancel={() => setRenameVisible(false)}
      />
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlist?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        destructive
      />

      {/* Menu Modal */}
      <ConfirmDialog
        visible={menuVisible}
        title="Playlist Options"
        message={`Manage "${playlist?.name}"`}
        confirmLabel="Delete"
        cancelLabel="Close"
        onConfirm={() => { setMenuVisible(false); setDeleteConfirmVisible(true); }}
        onCancel={() => setMenuVisible(false)}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  heroArtwork: {
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  heroArtworkImage: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.lg,
  },
  placeholder: {
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistName: {
    fontSize: TYPOGRAPHY.title,
    fontFamily: 'Inter-Bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  playlistMeta: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    width: '100%',
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  playButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-SemiBold',
  },
  shuffleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  shuffleButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-SemiBold',
  },
  trackList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
});
