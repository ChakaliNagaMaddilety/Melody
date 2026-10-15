import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { HOME_CATEGORIES, HOME_FEATURED_QUERIES, APP_NAME, APP_TAGLINE } from '@/src/constants/config';
import { AlbumCard } from '@/src/components/AlbumCard';
import { CategoryCard } from '@/src/components/CategoryCard';
import { TrackRow } from '@/src/components/TrackRow';
import { TrackOptionsModal } from '@/src/components/TrackOptionsModal';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { AlbumCardSkeleton, TrackListSkeleton } from '@/src/components/Skeletons';
import { useFetchTracks } from '@/src/hooks/useFetchTracks';
import { useLibrary } from '@/src/context/LibraryContext';
import { getTracksByIds } from '@/src/services/storage';
import { Track } from '@/src/types';
import { useToast } from '@/src/context/ToastContext';
import { Headphones, TrendingUp, Sparkles, Clock } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const featuredQueries = useMemo(() => HOME_FEATURED_QUERIES.slice(0, 4), []);
  const trendingQueries = useMemo(() => ['top charts', 'viral hits', 'trending songs'], []);
  const { tracks: featuredTracks, isLoading: featuredLoading, error: featuredError, reload: reloadFeatured } = useFetchTracks(featuredQueries);
  const { tracks: trendingTracks, isLoading: trendingLoading, error: trendingError, reload: reloadTrending } = useFetchTracks(trendingQueries);

  const { recentTrackIds } = useLibrary();
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Load recent tracks from storage
  React.useEffect(() => {
    if (recentTrackIds.length > 0) {
      getTracksByIds(recentTrackIds.slice(0, 6)).then(setRecentTracks);
    } else {
      setRecentTracks([]);
    }
  }, [recentTrackIds]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    reloadFeatured();
    reloadTrending();
    if (recentTrackIds.length > 0) {
      const tracks = await getTracksByIds(recentTrackIds.slice(0, 6));
      setRecentTracks(tracks);
    }
    setTimeout(() => setRefreshing(false), 1000);
  }, [reloadFeatured, reloadTrending, recentTrackIds]);

  const featuredTracksByAlbum = useMemo(() => {
    const seen = new Map<string, Track>();
    for (const track of featuredTracks) {
      if (!seen.has(track.album)) {
        seen.set(track.album, track);
      }
    }
    return Array.from(seen.values()).slice(0, 10);
  }, [featuredTracks]);

  const showOptions = useCallback((track: Track) => {
    setOptionsTrack(track);
    setOptionsVisible(true);
  }, []);

  const handleCategoryPress = useCallback((query: string, label: string) => {
    showToast(`Browsing ${label}...`, 'info');
  }, [showToast]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.purple} />}
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroAppName}>{APP_NAME}</Text>
            <Text style={styles.heroTagline}>{APP_TAGLINE}</Text>
          </View>
          <View style={styles.heroIconContainer}>
            <Headphones size={28} color={COLORS.textPrimary} />
          </View>
        </View>

        {/* Featured Albums */}
        <SectionHeader icon={<Sparkles size={18} color={COLORS.purpleLight} />} title="Featured Albums" />
        {featuredLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[160, 160, 160, 160].map((s, i) => <AlbumCardSkeleton key={i} size={s} />)}
          </ScrollView>
        ) : featuredError ? (
          <ErrorState message={featuredError} onRetry={reloadFeatured} />
        ) : featuredTracksByAlbum.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {featuredTracksByAlbum.map((track) => (
              <AlbumCard key={track.id} track={track} size={160} />
            ))}
          </ScrollView>
        ) : null}

        {/* Categories */}
        <SectionHeader title="Browse Categories" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {HOME_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              label={cat.label}
              icon={cat.icon}
              onPress={() => handleCategoryPress(cat.query, cat.label)}
            />
          ))}
        </ScrollView>

        {/* Trending Tracks */}
        <SectionHeader icon={<TrendingUp size={18} color={COLORS.coral} />} title="Trending Now" />
        {trendingLoading ? (
          <TrackListSkeleton count={5} />
        ) : trendingError ? (
          <ErrorState message={trendingError} onRetry={reloadTrending} />
        ) : trendingTracks.length > 0 ? (
          <View style={styles.trackList}>
            {trendingTracks.slice(0, 8).map((track, i) => (
              <TrackRow
                key={`${track.id}-${i}`}
                track={track}
                index={i}
                onMorePress={() => showOptions(track)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No trending tracks" message="Check your connection and pull down to refresh." />
        )}

        {/* Recently Played */}
        {recentTracks.length > 0 && (
          <>
            <SectionHeader icon={<Clock size={18} color={COLORS.purpleLight} />} title="Recently Played" />
            <View style={styles.trackList}>
              {recentTracks.slice(0, 5).map((track, i) => (
                <TrackRow
                  key={`recent-${track.id}-${i}`}
                  track={track}
                  index={i}
                  onMorePress={() => showOptions(track)}
                />
              ))}
            </View>
          </>
        )}

        {/* Recommendations (from featured) */}
        <SectionHeader title="Recommended For You" />
        {featuredLoading ? (
          <TrackListSkeleton count={4} />
        ) : featuredTracks.length > 0 ? (
          <View style={styles.trackList}>
            {featuredTracks.slice(0, 6).map((track, i) => (
              <TrackRow
                key={`rec-${track.id}-${i}`}
                track={track}
                index={i}
                onMorePress={() => showOptions(track)}
              />
            ))}
          </View>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>
      <TrackOptionsModal
        visible={optionsVisible}
        track={optionsTrack}
        onClose={() => setOptionsVisible(false)}
      />
    </SafeAreaView>
  );
}

function SectionHeader({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroContent: {
    flex: 1,
  },
  heroAppName: {
    fontSize: TYPOGRAPHY.hero,
    fontFamily: 'Inter-Bold',
    color: COLORS.textPrimary,
  },
  heroTagline: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textPrimary,
  },
  horizontalList: {
    paddingHorizontal: SPACING.xl,
    gap: 0,
  },
  categoriesList: {
    paddingHorizontal: SPACING.xl,
  },
  trackList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
});
