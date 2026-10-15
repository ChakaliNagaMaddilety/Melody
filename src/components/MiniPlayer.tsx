import React from 'react';
import { View, StyleSheet, Pressable, Text, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { usePlayer } from '@/src/context/PlayerContext';
import { Play, Pause, SkipForward, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatDuration } from '@/src/utils/format';

export function MiniPlayer() {
  const { playerState, togglePlayPause, next, showPlayer } = usePlayer();
  const router = useRouter();

  if (!playerState.currentTrack) return null;

  const track = playerState.currentTrack;
  const progress =
    playerState.durationMs > 0
      ? (playerState.positionMs / playerState.durationMs) * 100
      : 0;

  const handleOpenPlayer = () => {
    showPlayer();
    router.push('/player');
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handleOpenPlayer}
      accessibilityRole="button"
      accessibilityLabel="Open full player"
    >
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <View style={styles.content}>
        <View style={styles.trackInfo}>
          {track.artworkUrl ? (
            <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholder]}>
              <Text style={styles.placeholderText}>♪</Text>
            </View>
          )}
          <View style={styles.textInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {track.artist}
            </Text>
          </View>
        </View>
        <View style={styles.controls}>
          <Pressable
            onPress={togglePlayPause}
            style={styles.playButton}
            accessibilityRole="button"
            accessibilityLabel={playerState.isPlaying ? 'Pause' : 'Play'}
            hitSlop={8}
          >
            {playerState.isLoading ? (
              <Text style={styles.loadingText}>···</Text>
            ) : playerState.isPlaying ? (
              <Pause size={22} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            ) : (
              <Play size={22} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            )}
          </Pressable>
          <Pressable
            onPress={next}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Next track"
            hitSlop={8}
          >
            <SkipForward size={20} color={COLORS.textSecondary} />
          </Pressable>
          <Pressable
            onPress={handleOpenPlayer}
            style={styles.expandButton}
            accessibilityRole="button"
            accessibilityLabel="Expand player"
            hitSlop={8}
          >
            <ChevronUp size={20} color={COLORS.textTertiary} />
          </Pressable>
        </View>
      </View>
      {playerState.error && (
        <Text style={styles.errorText} numberOfLines={1}>
          {playerState.error}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  progressContainer: {
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
  },
  placeholder: {
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.textTertiary,
  },
  textInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-SemiBold',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playButton: {
    padding: SPACING.xs,
  },
  skipButton: {
    padding: SPACING.xs,
  },
  expandButton: {
    padding: SPACING.xs,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.tiny,
    fontFamily: 'Inter-Regular',
    marginTop: SPACING.xs,
  },
});
