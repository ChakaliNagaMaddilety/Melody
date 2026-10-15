import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { MIN_SEARCH_LENGTH } from '@/src/constants/config';
import { useSearch } from '@/src/hooks/useSearch';
import { useLibrary } from '@/src/context/LibraryContext';
import { TrackRow } from '@/src/components/TrackRow';
import { TrackOptionsModal } from '@/src/components/TrackOptionsModal';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { TrackListSkeleton } from '@/src/components/Skeletons';
import { Track } from '@/src/types';
import { Search as SearchIcon, X, Clock, TrendingUp, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useToast } from '@/src/context/ToastContext';
import { saveTracks } from '@/src/services/storage';

export default function SearchScreen() {
  const { query, results, isLoading, error, hasSearched, search, clearSearch, retry } = useSearch();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useLibrary();
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSearch = useCallback((term: string) => {
    search(term);
  }, [search]);

  const handleSearchSubmit = useCallback(() => {
    if (query.trim().length >= MIN_SEARCH_LENGTH) {
      addRecentSearch(query);
      saveTracks(results);
    }
    Keyboard.dismiss();
  }, [query, results, addRecentSearch]);

  const handleRecentSearchPress = useCallback((term: string) => {
    search(term);
    inputRef.current?.focus();
  }, [search]);

  const handleClearSearch = useCallback(() => {
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const showOptions = useCallback((track: Track) => {
    setOptionsTrack(track);
    setOptionsVisible(true);
  }, []);

  const renderTrack = useCallback(({ item, index }: { item: Track; index: number }) => (
    <TrackRow track={item} index={index} onMorePress={() => showOptions(item)} />
  ), [showOptions]);

  const showRecentSearches = !hasSearched && !isLoading && recentSearches.length > 0;
  const showEmptyState = hasSearched && !isLoading && !error && results.length === 0;
  const showInitialState = !hasSearched && !isLoading && !error && recentSearches.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Search</Text>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <SearchIcon size={20} color={COLORS.textTertiary} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search songs, artists, albums..."
              placeholderTextColor={COLORS.textTertiary}
              value={query}
              onChangeText={handleSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search for music"
            />
            {query.length > 0 && (
              <Pressable onPress={handleClearSearch} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
                <X size={18} color={COLORS.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results / States */}
        {isLoading ? (
          <View style={styles.contentArea}>
            <Text style={styles.searchingText}>Searching for "{query}"...</Text>
            <TrackListSkeleton count={6} />
          </View>
        ) : error ? (
          <View style={styles.contentArea}>
            <ErrorState message={error} onRetry={retry} />
          </View>
        ) : results.length > 0 ? (
          <>
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{query.trim()}"
            </Text>
            <FlatList
              data={results}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={renderTrack}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => Keyboard.dismiss()}
            />
          </>
        ) : showEmptyState ? (
          <View style={styles.contentArea}>
            <EmptyState
              icon={<SearchIcon size={48} color={COLORS.textTertiary} />}
              title="No results found"
              message={`We couldn't find any songs matching "${query.trim()}". Try a different search term.`}
              actionLabel="Search Again"
              onAction={() => { clearSearch(); inputRef.current?.focus(); }}
            />
          </View>
        ) : showRecentSearches ? (
          <ScrollView style={styles.contentArea} contentContainerStyle={{ padding: SPACING.xl }}>
            <View style={styles.recentHeader}>
              <View style={styles.recentHeaderLeft}>
                <Clock size={18} color={COLORS.textSecondary} />
                <Text style={styles.recentTitle}>Recent Searches</Text>
              </View>
              <Pressable onPress={clearRecentSearches} hitSlop={8}>
                <Text style={styles.clearText}>Clear All</Text>
              </Pressable>
            </View>
            {recentSearches.map((term, i) => (
              <Pressable
                key={`${term}-${i}`}
                style={({ pressed }) => [styles.recentItem, pressed && styles.recentItemPressed]}
                onPress={() => handleRecentSearchPress(term)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${term}`}
              >
                <RotateCcw size={16} color={COLORS.textTertiary} />
                <Text style={styles.recentItemText}>{term}</Text>
                <X size={14} color={COLORS.textTertiary} />
              </Pressable>
            ))}
          </ScrollView>
        ) : showInitialState ? (
          <View style={styles.contentArea}>
            <EmptyState
              icon={<SearchIcon size={48} color={COLORS.textTertiary} />}
              title="Find Your Music"
              message="Search for your favorite songs, artists, and albums from the iTunes catalog."
            />
          </View>
        ) : null}
      </View>
      <TrackOptionsModal
        visible={optionsVisible}
        track={optionsTrack}
        onClose={() => setOptionsVisible(false)}
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
  headerTitle: {
    fontSize: TYPOGRAPHY.hero,
    fontFamily: 'Inter-Bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchBarContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
    padding: 0,
  },
  contentArea: {
    flex: 1,
  },
  searchingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  resultsCount: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  resultsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.xs,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  recentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recentTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.subtitle,
    fontFamily: 'Inter-SemiBold',
  },
  clearText: {
    color: COLORS.purpleLight,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  recentItemPressed: {
    backgroundColor: COLORS.bgCard,
  },
  recentItemText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
  },
});
