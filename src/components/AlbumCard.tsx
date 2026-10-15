import React from 'react';
import { View, StyleSheet, Pressable, Text, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { Track } from '@/src/types';
import { usePlayer } from '@/src/context/PlayerContext';
import { Play, Pause } from 'lucide-react-native';

interface AlbumCardProps {
  track: Track;
  onPress?: () => void;
  size?: number;
}

export function AlbumCard({ track, onPress, size = 160 }: AlbumCardProps) {
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
      <View style={styles.artworkContainer}>
        {track.artworkUrl ? (
          <Image source={{ uri: track.artworkUrl }} style={[styles.artwork, { width: size, height: size }]} />
        ) : (
          <View style={[styles.artwork, styles.placeholder, { width: size, height: size }]}>
            <Text style={styles.placeholderText}>♪</Text>
          </View>
        )}
        <Pressable
          style={[styles.playOverlay, { opacity: isCurrentTrack ? 1 : 0 }]}
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={24} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          ) : (
            <Play size={24} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          )}
        </Pressable>
      </View>
      <View style={[styles.info, { width: size }]}>
        <Text style={styles.title} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  pressed: {
    opacity: 0.8,
  },
  artworkContainer: {
    position: 'relative',
  },
  artwork: {
    borderRadius: RADIUS.md,
  },
  placeholder: {
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: COLORS.textTertiary,
  },
  playOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  info: {
    marginTop: SPACING.sm,
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
});
