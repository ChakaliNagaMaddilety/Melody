import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { usePlayer } from '@/src/context/PlayerContext';
import { useToast } from '@/src/context/ToastContext';
import { formatDuration } from '@/src/utils/format';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ChevronDown,
  Heart,
  ListMusic,
  X,
  Volume2,
  Volume1,
  Volume,
  AlertCircle,
} from 'lucide-react-native';
import { useLibrary } from '@/src/context/LibraryContext';
import { useRouter } from 'expo-router';

export default function PlayerScreen() {
  const {
    playerState,
    preferences,
    togglePlayPause,
    next,
    prev,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    hidePlayer,
    removeFromQueue,
    clearQueue,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const { showToast } = useToast();
  const router = useRouter();

  const [showQueue, setShowQueue] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const track = playerState.currentTrack;
  if (!track) {
    return (
      <SafeAreaView style={styles.emptySafe}>
        <Text style={styles.emptyText}>No track playing</Text>
        <Pressable style={styles.goBackButton} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(track.id);
  const progress = playerState.durationMs > 0
    ? (isSeeking ? seekPosition : playerState.positionMs) / playerState.durationMs
    : 0;
  const progressPercent = Math.min(Math.max(progress * 100, 0), 100);
  const currentTime = isSeeking ? seekPosition : playerState.positionMs;
  const remainingTime = Math.max(0, playerState.durationMs - currentTime);

  const repeatIcon = playerState.repeat === 'one' ? <Repeat1 size={22} color={COLORS.textPrimary} /> : <Repeat size={22} color={playerState.repeat === 'all' ? COLORS.textPrimary : COLORS.textTertiary} />;
  const isPreview = true; // All tracks from iTunes API are previews

  const handleFavorite = useCallback(async () => {
    await toggleFavorite(track.id);
    showToast(fav ? 'Removed from favorites' : 'Added to favorites', fav ? 'info' : 'success');
  }, [track.id, fav, toggleFavorite, showToast]);

  const handleClose = useCallback(() => {
    hidePlayer();
    router.back();
  }, [hidePlayer, router]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
    setSeekPosition(playerState.positionMs);
  }, [playerState.positionMs]);

  const handleSeekMove = useCallback((newPos: number) => {
    setSeekPosition(newPos);
  }, []);

  const handleSeekEnd = useCallback(() => {
    seekTo(seekPosition);
    setIsSeeking(false);
  }, [seekPosition, seekTo]);

  const volumeIcon = preferences.volume === 0 ? <Volume size={20} color={COLORS.textPrimary} /> : preferences.volume < 0.5 ? <Volume1 size={20} color={COLORS.textPrimary} /> : <Volume2 size={20} color={COLORS.textPrimary} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={handleClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close player">
            <ChevronDown size={26} color={COLORS.textSecondary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.nowPlaying}>PLAYING FROM PREVIEW</Text>
            <Text style={styles.queueLabel} numberOfLines={1}>
              {track.album}
            </Text>
          </View>
          <Pressable onPress={() => setShowQueue(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Show queue">
            <ListMusic size={24} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {track.artworkUrl ? (
            <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholder]}>
              <Text style={styles.placeholderText}>♪</Text>
            </View>
          )}
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <View style={styles.trackInfoLeft}>
            <Text style={styles.trackTitle} numberOfLines={2}>{track.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
          </View>
          <Pressable onPress={handleFavorite} hitSlop={12} accessibilityRole="button" accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}>
            <Heart size={26} color={fav ? COLORS.coral : COLORS.textSecondary} fill={fav ? COLORS.coral : 'transparent'} />
          </Pressable>
        </View>

        {/* Preview Badge */}
        <View style={styles.previewBadge}>
          <AlertCircle size={12} color={COLORS.warning} />
          <Text style={styles.previewText}>30-second preview</Text>
        </View>

        {/* Seek Bar */}
        <View style={styles.seekBarContainer}>
          <Pressable
            style={styles.seekBar}
            onPress={(e) => {
              const x = e.nativeEvent.locationX;
              const pct = x / (SCREEN_WIDTH - SPACING.xl * 2);
              const newPos = Math.min(Math.max(pct * playerState.durationMs, 0), playerState.durationMs);
              seekTo(newPos);
            }}
            accessibilityRole="adjustable"
            accessibilityLabel="Seek bar"
            accessibilityValue={{ now: Math.floor(currentTime / 1000), max: Math.floor(playerState.durationMs / 1000) }}
          >
            <View style={styles.seekBarTrack}>
              <View style={[styles.seekBarFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.seekBarThumb, { left: `${progressPercent}%` }]} />
            </View>
          </Pressable>
          <View style={styles.seekTimes}>
            <Text style={styles.seekTime}>{formatDuration(currentTime)}</Text>
            <Text style={styles.seekTime}>-{formatDuration(remainingTime)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={toggleShuffle} hitSlop={12} accessibilityRole="button" accessibilityLabel="Toggle shuffle">
            <Shuffle size={22} color={playerState.shuffle ? COLORS.purpleLight : COLORS.textTertiary} />
          </Pressable>
          <Pressable onPress={prev} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous track">
            <SkipBack size={32} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          </Pressable>
          <Pressable
            onPress={togglePlayPause}
            style={styles.playButton}
            accessibilityRole="button"
            accessibilityLabel={playerState.isPlaying ? 'Pause' : 'Play'}
          >
            {playerState.isLoading ? (
              <Text style={styles.loadingText}>···</Text>
            ) : playerState.isPlaying ? (
              <Pause size={32} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            ) : (
              <Play size={32} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            )}
          </Pressable>
          <Pressable onPress={next} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next track">
            <SkipForward size={32} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          </Pressable>
          <Pressable onPress={cycleRepeat} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cycle repeat mode">
            {repeatIcon}
          </Pressable>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeContainer}>
          {volumeIcon}
          <View style={styles.volumeBar}>
            <View style={styles.volumeBarTrack}>
              <View style={[styles.volumeBarFill, { width: `${preferences.volume * 100}%` }]} />
            </View>
          </View>
          <View style={styles.volumeButtons}>
            <Pressable style={styles.volumeBtn} onPress={() => setVolume(Math.max(0, preferences.volume - 0.1))} accessibilityRole="button" accessibilityLabel="Decrease volume">
              <Text style={styles.volumeBtnText}>−</Text>
            </Pressable>
            <Pressable style={styles.volumeBtn} onPress={() => setVolume(Math.min(1, preferences.volume + 0.1))} accessibilityRole="button" accessibilityLabel="Increase volume">
              <Text style={styles.volumeBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Error Display */}
        {playerState.error && (
          <View style={styles.errorBar}>
            <AlertCircle size={14} color={COLORS.error} />
            <Text style={styles.errorText} numberOfLines={2}>{playerState.error}</Text>
          </View>
        )}
      </View>

      {/* Queue Modal */}
      <Modal visible={showQueue} animationType="slide" transparent onRequestClose={() => setShowQueue(false)}>
        <View style={styles.queueOverlay}>
          <View style={styles.queueSheet}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Play Queue</Text>
              <View style={styles.queueHeaderActions}>
                {playerState.queue.length > 1 && (
                  <Pressable onPress={clearQueue} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear queue">
                    <Text style={styles.clearQueueText}>Clear</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => setShowQueue(false)} hitSlop={8}>
                  <X size={22} color={COLORS.textSecondary} />
                </Pressable>
              </View>
            </View>
            <FlatList
              data={playerState.queue}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => (
                <View style={[styles.queueItem, index === playerState.queueIndex && styles.queueItemActive]}>
                  {item.artworkUrl ? (
                    <Image source={{ uri: item.artworkUrl }} style={styles.queueItemArtwork} />
                  ) : (
                    <View style={[styles.queueItemArtwork, styles.placeholder]}>
                      <Text style={styles.placeholderText}>♪</Text>
                    </View>
                  )}
                  <View style={styles.queueItemInfo}>
                    <Text style={[styles.queueItemTitle, index === playerState.queueIndex && styles.queueItemTitleActive]} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.queueItemArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <Pressable onPress={() => removeFromQueue(index)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from queue`}>
                    <X size={16} color={COLORS.textTertiary} />
                  </Pressable>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.queueEmpty}>Queue is empty</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { Dimensions } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  nowPlaying: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.tiny,
    fontFamily: 'Inter-Regular',
    letterSpacing: 1,
  },
  queueLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  artwork: {
    width: Math.min(SCREEN_WIDTH - SPACING.xl * 4, 320),
    height: Math.min(SCREEN_WIDTH - SPACING.xl * 4, 320),
    borderRadius: RADIUS.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  placeholder: {
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
    color: COLORS.textTertiary,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  trackInfoLeft: {
    flex: 1,
    gap: 4,
  },
  trackTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.title,
    fontFamily: 'Inter-Bold',
  },
  trackArtist: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-Regular',
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xl,
  },
  previewText: {
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.tiny,
    fontFamily: 'Inter-Regular',
  },
  seekBarContainer: {
    marginBottom: SPACING.xl,
  },
  seekBar: {
    paddingVertical: SPACING.sm,
  },
  seekBarTrack: {
    height: 4,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 2,
    overflow: 'visible',
  },
  seekBarFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 2,
  },
  seekBarThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textPrimary,
    marginLeft: -8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  seekTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  seekTime: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    color: COLORS.bgDarkest,
    fontSize: 22,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  volumeBar: {
    flex: 1,
  },
  volumeBarTrack: {
    height: 3,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 1.5,
  },
  volumeButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  volumeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  emptySafe: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
    marginBottom: SPACING.lg,
  },
  goBackButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  goBackText: {
    color: COLORS.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  // Queue Modal
  queueOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay,
  },
  queueSheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  queueTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
  },
  queueHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  clearQueueText: {
    color: COLORS.purpleLight,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  queueItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  queueItemArtwork: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
  },
  queueItemInfo: {
    flex: 1,
    gap: 2,
  },
  queueItemTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
  },
  queueItemTitleActive: {
    color: COLORS.purpleLight,
    fontFamily: 'Inter-SemiBold',
  },
  queueItemArtist: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  queueEmpty: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    padding: SPACING.xl,
  },
});
