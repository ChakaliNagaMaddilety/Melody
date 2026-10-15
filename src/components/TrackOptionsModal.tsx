import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { Track } from '@/src/types';
import { useLibrary } from '@/src/context/LibraryContext';
import { usePlayer } from '@/src/context/PlayerContext';
import { useToast } from '@/src/context/ToastContext';
import { Heart, Plus, ListPlus, ListEnd, X, Trash2 } from 'lucide-react-native';


interface TrackOptionsModalProps {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
}

export function TrackOptionsModal({ visible, track, onClose }: TrackOptionsModalProps) {
  const { playlists, favoriteTrackIds, toggleFavorite, createPlaylist, addTrackToPlaylist } = useLibrary();
  const { addToQueue, playTrack } = usePlayer();
  const { showToast } = useToast();
  const [showPlaylistPicker, setShowPlaylistPicker] = React.useState(false);
  const [showNewPlaylist, setShowNewPlaylist] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');

  if (!track) return null;

  const isFavorite = favoriteTrackIds.includes(track.id);

  const handleToggleFavorite = async () => {
    await toggleFavorite(track.id);
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites', isFavorite ? 'info' : 'success');
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    showToast('Added to queue', 'success');
    onClose();
  };

  const handlePlayNow = () => {
    playTrack(track);
    onClose();
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    const success = await addTrackToPlaylist(playlistId, track.id);
    if (success) {
      showToast(`Added to "${playlistName}"`, 'success');
    } else {
      showToast('Failed to add to playlist', 'error');
    }
    setShowPlaylistPicker(false);
    onClose();
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      showToast('Playlist name cannot be empty', 'error');
      return;
    }
    const playlist = await createPlaylist(newPlaylistName);
    if (playlist) {
      await addTrackToPlaylist(playlist.id, track.id);
      showToast(`Created "${playlist.name}" and added track`, 'success');
      setNewPlaylistName('');
      setShowNewPlaylist(false);
      onClose();
    } else {
      showToast('Failed to create playlist', 'error');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {!showPlaylistPicker && !showNewPlaylist && (
            <>
              <View style={styles.header}>
                <View style={styles.trackPreview}>
                  {track.artworkUrl ? (
                    <Text style={styles.trackPreviewArt}>♪</Text>
                  ) : (
                    <Text style={styles.trackPreviewArt}>♪</Text>
                  )}
                  <View style={styles.trackPreviewInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={onClose} hitSlop={8}>
                  <X size={20} color={COLORS.textSecondary} />
                </Pressable>
              </View>
              <ScrollView style={styles.options}>
                <OptionRow icon={<Heart size={20} color={isFavorite ? COLORS.coral : COLORS.textSecondary} fill={isFavorite ? COLORS.coral : 'transparent'} />} label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} onPress={handleToggleFavorite} />
                <OptionRow icon={<ListEnd size={20} color={COLORS.textSecondary} />} label="Add to Queue" onPress={handleAddToQueue} />
                <OptionRow icon={<Plus size={20} color={COLORS.textSecondary} />} label="Play Now" onPress={handlePlayNow} />
                <OptionRow icon={<ListPlus size={20} color={COLORS.textSecondary} />} label="Add to Playlist" onPress={() => setShowPlaylistPicker(true)} />
              </ScrollView>
            </>
          )}

          {showPlaylistPicker && (
            <>
              <View style={styles.header}>
                <Text style={styles.sheetTitle}>Add to Playlist</Text>
                <Pressable onPress={() => setShowPlaylistPicker(false)} hitSlop={8}>
                  <X size={20} color={COLORS.textSecondary} />
                </Pressable>
              </View>
              <ScrollView style={styles.options}>
                <OptionRow icon={<Plus size={20} color={COLORS.purple} />} label="Create New Playlist" onPress={() => { setShowPlaylistPicker(false); setShowNewPlaylist(true); }} />
                {playlists.length === 0 ? (
                  <Text style={styles.emptyText}>No playlists yet. Create one to get started.</Text>
                ) : (
                  playlists.map((pl) => (
                    <OptionRow
                      key={pl.id}
                      icon={<ListPlus size={20} color={COLORS.textSecondary} />}
                      label={`${pl.name} (${pl.trackIds.length})`}
                      onPress={() => handleAddToPlaylist(pl.id, pl.name)}
                    />
                  ))
                )}
              </ScrollView>
            </>
          )}

          {showNewPlaylist && (
            <View style={styles.newPlaylistContainer}>
              <View style={styles.header}>
                <Text style={styles.sheetTitle}>New Playlist</Text>
                <Pressable onPress={() => setShowNewPlaylist(false)} hitSlop={8}>
                  <X size={20} color={COLORS.textSecondary} />
                </Pressable>
              </View>
              <Text style={styles.inputLabel}>Playlist Name</Text>
              <TextInput
                style={styles.input}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                placeholder="Enter playlist name"
                placeholderTextColor={COLORS.textTertiary}
                autoFocus
                maxLength={50}
              />
              <Pressable style={styles.createButton} onPress={handleCreatePlaylist}>
                <Text style={styles.createButtonText}>Create & Add Track</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}



function OptionRow({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} accessibilityRole="button">
      {icon}
      <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trackPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  trackPreviewArt: {
    fontSize: 28,
    color: COLORS.purple,
  },
  trackPreviewInfo: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
  trackArtist: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  sheetTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
  },
  options: {
    padding: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  optionLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    padding: SPACING.md,
    textAlign: 'center',
  },
  newPlaylistContainer: {
    padding: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
    marginBottom: SPACING.lg,
  },
  createButton: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
});
