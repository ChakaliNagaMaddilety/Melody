import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'react-native';
import { Text } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { Track } from '@/src/types';
import { usePlayer } from '@/src/context/PlayerContext';
import { Play, Pause } from 'lucide-react-native';
import { formatDuration } from '@/src/utils/format';

interface TrackCardProps {
  track: Track;
  onPress?: () => void;
  showDuration?: boolean;
  index?: number;
}

export function TrackCard({ track, onPress, showDuration, index }: TrackCardProps) {
  const { playerState, playTrack, togglePlayPause } = usePlayer();
  const isCurrentTrack = playerState.currentTrack?.id === track.id;
  const isPlaying = isCurrentTrack && playerState.isPlaying;

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress || handlePlay}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title} by ${track.artist}`}
    >
      {index !== undefined && <Text style={styles.index}>{index + 1}</Text>}
      <View style={styles.artworkContainer}>
        {track.artworkUrl ? (
          <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Text style={styles.placeholderText}>♪</Text>
          </View>
        )}
        <Pressable
          style={styles.playButton}
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={16} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          ) : (
            <Play size={16} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          )}
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isCurrentTrack && styles.titleActive]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
        <Text style={styles.album} numberOfLines={1}>
          {track.album}
        </Text>
      </View>
      {showDuration && track.durationMs && (
        <Text style={styles.duration}>{formatDuration(track.durationMs)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    borderRadius: RADIUS.md,
  },
  pressed: {
    backgroundColor: COLORS.bgCardHover,
  },
  index: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    width: 24,
    textAlign: 'center',
  },
  artworkContainer: {
    position: 'relative',
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
  },
  artworkPlaceholder: {
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  playButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
  },
  titleActive: {
    color: COLORS.purpleLight,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
  },
  album: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  duration: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
});
