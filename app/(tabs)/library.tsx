import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { useLibrary } from '@/src/context/LibraryContext';
import { useToast } from '@/src/context/ToastContext';
import { getTracksByIds } from '@/src/services/storage';
import { Track, Playlist } from '@/src/types';
import { TrackRow } from '@/src/components/TrackRow';
import { TrackOptionsModal } from '@/src/components/TrackOptionsModal';
import { EmptyState } from '@/src/components/EmptyState';
import { TextInputModal } from '@/src/components/TextInputModal';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { Heart, ListMusic, Clock, Plus, Music, Trash2, Play, Shuffle } from 'lucide-react-native';
import { usePlayer } from '@/src/context/PlayerContext';
import { useRouter } from 'expo-router';

type Tab = 'favorites' | 'playlists' | 'recent';

export default function LibraryScreen() {
  const { playlists, favoriteTrackIds, recentTrackIds, createPlaylist, deletePlaylist, refresh } = useLibrary();
  const { showToast } = useToast();
  const { playQueue, playerState } = usePlayer();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);

  // Load favorite tracks
  useEffect(() => {
    if (favoriteTrackIds.length > 0) {
      getTracksByIds(favoriteTrackIds).then(setFavoriteTracks);
    } else {
      setFavoriteTracks([]);
    }
  }, [favoriteTrackIds]);

  // Load recent tracks
  useEffect(() => {
    if (recentTrackIds.length > 0) {
      getTracksByIds(recentTrackIds).then(setRecentTracks);
    } else {
      setRecentTracks([]);
    }
  }, [recentTrackIds]);

  const handleCreatePlaylist = useCallback(async (name: string) => {
    const playlist = await createPlaylist(name);
    if (playlist) {
      showToast(`Playlist "${name}" created`, 'success');
      setCreateModalVisible(false);
      setActiveTab('playlists');
    } else {
      showToast('Failed to create playlist', 'error');
    }
  }, [createPlaylist, showToast]);

  const handleDeletePlaylist = useCallback(async () => {
    if (!deleteTarget) return;
    const success = await deletePlaylist(deleteTarget.id);
    if (success) {
      showToast(`Playlist "${deleteTarget.name}" deleted`, 'info');
    } else {
      showToast('Failed to delete playlist', 'error');
    }
    setDeleteTarget(null);
  }, [deleteTarget, deletePlaylist, showToast]);

  const handlePlayFavorites = useCallback(() => {
    if (favoriteTracks.length > 0) {
      const tracksWithPreview = favoriteTracks.filter(t => t.previewUrl);
      if (tracksWithPreview.length > 0) {
        playQueue(tracksWithPreview, 0);
      } else {
        showToast('No playable tracks in favorites', 'error');
      }
    }
  }, [favoriteTracks, playQueue, showToast]);

  const handlePlayRecent = useCallback(() => {
    if (recentTracks.length > 0) {
      const tracksWithPreview = recentTracks.filter(t => t.previewUrl);
      if (tracksWithPreview.length > 0) {
        playQueue(tracksWithPreview, 0);
      } else {
        showToast('No playable recent tracks', 'error');
      }
    }
  }, [recentTracks, playQueue, showToast]);

  const showOptions = useCallback((track: Track) => {
    setOptionsTrack(track);
    setOptionsVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Library</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setCreateModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Create new playlist"
          >
            <Plus size={22} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TabButton active={activeTab === 'favorites'} onPress={() => setActiveTab('favorites')} icon={<Heart size={16} color={activeTab === 'favorites' ? COLORS.textPrimary : COLORS.textSecondary} />} label="Favorites" count={favoriteTrackIds.length} />
          <TabButton active={activeTab === 'playlists'} onPress={() => setActiveTab('playlists')} icon={<ListMusic size={16} color={activeTab === 'playlists' ? COLORS.textPrimary : COLORS.textSecondary} />} label="Playlists" count={playlists.length} />
          <TabButton active={activeTab === 'recent'} onPress={() => setActiveTab('recent')} icon={<Clock size={16} color={activeTab === 'recent' ? COLORS.textPrimary : COLORS.textSecondary} />} label="Recent" count={recentTrackIds.length} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {activeTab === 'favorites' && (
            <>
              {favoriteTracks.length > 0 ? (
                <>
                  <View style={styles.playActions}>
                    <Pressable style={styles.playAllButton} onPress={handlePlayFavorites} accessibilityRole="button" accessibilityLabel="Play all favorites">
                      <Play size={18} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
                      <Text style={styles.playAllText}>Play All</Text>
                    </Pressable>
                    <Pressable style={styles.shuffleButton} onPress={() => { if (favoriteTracks.length > 0) { playQueue(favoriteTracks.filter(t => t.previewUrl), Math.floor(Math.random() * favoriteTracks.length)); } }} accessibilityRole="button" accessibilityLabel="Shuffle favorites">
                      <Shuffle size={18} color={COLORS.textPrimary} />
                      <Text style={styles.shuffleText}>Shuffle</Text>
                    </Pressable>
                  </View>
                  {favoriteTracks.map((track, i) => (
                    <TrackRow key={`fav-${track.id}-${i}`} track={track} index={i} onMorePress={() => showOptions(track)} />
                  ))}
                </>
              ) : (
                <EmptyState
                  icon={<Heart size={48} color={COLORS.textTertiary} />}
                  title="No Favorites Yet"
                  message="Tap the heart icon on any track to save it here."
                />
              )}
            </>
          )}

          {activeTab === 'playlists' && (
            <>
              {playlists.length > 0 ? (
                <View style={styles.playlistList}>
                  {playlists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onPress={() => router.push(`/playlist/${playlist.id}`)}
                      onDelete={() => setDeleteTarget(playlist)}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon={<ListMusic size={48} color={COLORS.textTertiary} />}
                  title="No Playlists Yet"
                  message="Create a playlist to organize your favorite tracks."
                  actionLabel="Create Playlist"
                  onAction={() => setCreateModalVisible(true)}
                />
              )}
            </>
          )}

          {activeTab === 'recent' && (
            <>
              {recentTracks.length > 0 ? (
                <>
                  <View style={styles.playActions}>
                    <Pressable style={styles.playAllButton} onPress={handlePlayRecent} accessibilityRole="button" accessibilityLabel="Play all recent">
                      <Play size={18} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
                      <Text style={styles.playAllText}>Play All</Text>
                    </Pressable>
                  </View>
                  {recentTracks.map((track, i) => (
                    <TrackRow key={`recent-${track.id}-${i}`} track={track} index={i} onMorePress={() => showOptions(track)} />
                  ))}
                </>
              ) : (
                <EmptyState
                  icon={<Clock size={48} color={COLORS.textTertiary} />}
                  title="No Recent Tracks"
                  message="Tracks you play will appear here for quick access."
                />
              )}
            </>
          )}
        </ScrollView>
      </View>

      <TrackOptionsModal visible={optionsVisible} track={optionsTrack} onClose={() => setOptionsVisible(false)} />
      <TextInputModal
        visible={createModalVisible}
        title="New Playlist"
        label="Playlist Name"
        placeholder="Enter playlist name"
        confirmLabel="Create"
        onConfirm={handleCreatePlaylist}
        onCancel={() => setCreateModalVisible(false)}
      />
      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeletePlaylist}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </SafeAreaView>
  );
}

function TabButton({ active, onPress, icon, label, count }: { active: boolean; onPress: () => void; icon: React.ReactNode; label: string; count: number }) {
  return (
    <Pressable
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      {icon}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {count > 0 && <Text style={[styles.tabCount, active && styles.tabCountActive]}>{count}</Text>}
    </Pressable>
  );
}

function PlaylistCard({ playlist, onPress, onDelete }: { playlist: Playlist; onPress: () => void; onDelete: () => void }) {
  return (
    <View style={styles.playlistCard}>
      <Pressable style={styles.playlistCardInner} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open playlist ${playlist.name}`}>
        <View style={styles.playlistIcon}>
          <Music size={24} color={COLORS.purpleLight} />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
          <Text style={styles.playlistMeta}>{playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'track' : 'tracks'}</Text>
        </View>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={onDelete} accessibilityRole="button" accessibilityLabel={`Delete playlist ${playlist.name}`} hitSlop={8}>
        <Trash2 size={18} color={COLORS.textTertiary} />
      </Pressable>
    </View>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.hero,
    fontFamily: 'Inter-Bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCard,
  },
  tabButtonActive: {
    backgroundColor: COLORS.purple,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  tabCount: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.tiny,
    fontFamily: 'Inter-Regular',
  },
  tabCountActive: {
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  playActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  playAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  playAllText: {
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
  shuffleText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-SemiBold',
  },
  playlistList: {
    gap: SPACING.sm,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingRight: SPACING.md,
  },
  playlistCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  playlistIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    gap: 2,
  },
  playlistName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
  playlistMeta: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  deleteButton: {
    padding: SPACING.sm,
  },
});
