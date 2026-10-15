import React from 'react';
import { View, StyleSheet, Pressable, Text, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { Track } from '@/src/types';
import { usePlayer } from '@/src/context/PlayerContext';
import { Play, Pause } from 'lucide-react-native';

interface TrackRowProps {
  track: Track;
  onPress?: () => void;
  onMorePress?: () => void;
  index?: number;
  showArtwork?: boolean;
}

export function TrackRow({ track, onPress, onMorePress, index, showArtwork = true }: TrackRowProps) {
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
      {index !== undefined && (
        <Text style={[styles.index, isCurrentTrack && styles.indexActive]}>{index + 1}</Text>
      )}
      {showArtwork && (
        <View style={styles.artworkContainer}>
          {track.artworkUrl ? (
            <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholder]}>
              <Text style={styles.placeholderText}>♪</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, isCurrentTrack && styles.titleActive]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <Pressable
        style={styles.playBtn}
        onPress={handlePlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        hitSlop={8}
      >
        {isPlaying ? (
          <Pause size={20} color={COLORS.textPrimary} />
        ) : (
          <Play size={20} color={COLORS.textSecondary} />
        )}
      </Pressable>
      {onMorePress && (
        <Pressable
          onPress={onMorePress}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="More options"
          hitSlop={8}
        >
          <Text style={styles.moreDots}>···</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    borderRadius: RADIUS.sm,
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
  indexActive: {
    color: COLORS.purpleLight,
  },
  artworkContainer: {},
  artwork: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
  },
  placeholder: {
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    color: COLORS.textTertiary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
  },
  titleActive: {
    color: COLORS.purpleLight,
    fontFamily: 'Inter-SemiBold',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  playBtn: {
    padding: SPACING.xs,
  },
  moreBtn: {
    padding: SPACING.xs,
  },
  moreDots: {
    color: COLORS.textTertiary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
