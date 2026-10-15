import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/constants/theme';
import { APP_NAME, APP_TAGLINE } from '@/src/constants/config';
import { useLibrary } from '@/src/context/LibraryContext';
import { usePlayer } from '@/src/context/PlayerContext';
import { useToast } from '@/src/context/ToastContext';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { RepeatMode } from '@/src/types';
import { useRouter } from 'expo-router';
import {
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Trash2,
  Clock,
  Search,
  Heart,
  ListMusic,
  Info,
  ChevronRight,
  Volume1,
  Volume,
} from 'lucide-react-native';


export default function SettingsScreen() {
  const { preferences, toggleShuffle, cycleRepeat, setVolume } = usePlayer();
  const { recentSearches, favoriteTrackIds, playlists, recentTrackIds, clearRecentSearches, clearRecentTracks, clearAllData, clearAllData: clearAll } = useLibrary();
  const { showToast } = useToast();
  const router = useRouter();

  const [clearSearchesVisible, setClearSearchesVisible] = useState(false);
  const [clearRecentVisible, setClearRecentVisible] = useState(false);
  const [clearAllVisible, setClearAllVisible] = useState(false);

  const handleClearSearches = useCallback(async () => {
    await clearRecentSearches();
    showToast('Recent searches cleared', 'success');
    setClearSearchesVisible(false);
  }, [clearRecentSearches, showToast]);

  const handleClearRecent = useCallback(async () => {
    await clearRecentTracks();
    showToast('Recently played cleared', 'success');
    setClearRecentVisible(false);
  }, [clearRecentTracks, showToast]);

  const handleClearAll = useCallback(async () => {
    const success = await clearAllData();
    if (success) {
      showToast('All data cleared', 'success');
    } else {
      showToast('Failed to clear data', 'error');
    }
    setClearAllVisible(false);
  }, [clearAllData, showToast]);

  const repeatIcon = preferences.repeat === 'one' ? <Repeat1 size={20} color={COLORS.textPrimary} /> : <Repeat size={20} color={COLORS.textPrimary} />;
  const repeatLabel = preferences.repeat === 'off' ? 'Off' : preferences.repeat === 'all' ? 'Repeat All' : 'Repeat One';

  const volumeIcon = preferences.volume === 0 ? <Volume size={20} color={COLORS.textPrimary} /> : preferences.volume < 0.5 ? <Volume1 size={20} color={COLORS.textPrimary} /> : <Volume2 size={20} color={COLORS.textPrimary} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Playback Preferences */}
        <Section title="Playback">
          <SettingRow
            icon={<Shuffle size={20} color={COLORS.textSecondary} />}
            label="Shuffle"
            right={
              <Switch
                value={preferences.shuffle}
                onValueChange={toggleShuffle}
                trackColor={{ false: COLORS.bgElevated, true: COLORS.purple }}
                ios_backgroundColor={COLORS.bgElevated}
                accessibilityLabel="Toggle shuffle"
              />
            }
          />
          <PressableRow
            icon={repeatIcon}
            label="Repeat"
            value={repeatLabel}
            onPress={cycleRepeat}
            accessibilityLabel="Cycle repeat mode"
          />
          <View style={styles.volumeRow}>
            {volumeIcon}
            <Text style={styles.settingLabel}>Volume</Text>
            <View style={styles.volumeSliderContainer}>
              <View style={styles.volumeSliderTrack}>
                <View style={[styles.volumeSliderFill, { width: `${preferences.volume * 100}%` }]} />
              </View>
              <View style={styles.volumeControls}>
                <Pressable style={styles.volumeBtn} onPress={() => setVolume(Math.max(0, preferences.volume - 0.1))} accessibilityRole="button" accessibilityLabel="Decrease volume">
                  <Text style={styles.volumeBtnText}>−</Text>
                </Pressable>
                <Text style={styles.volumeValue}>{Math.round(preferences.volume * 100)}%</Text>
                <Pressable style={styles.volumeBtn} onPress={() => setVolume(Math.min(1, preferences.volume + 0.1))} accessibilityRole="button" accessibilityLabel="Increase volume">
                  <Text style={styles.volumeBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Section>

        {/* Data Management */}
        <Section title="Data Management">
          <PressableRow
            icon={<Search size={20} color={COLORS.textSecondary} />}
            label="Recent Searches"
            value={`${recentSearches.length} stored`}
            onPress={() => setClearSearchesVisible(true)}
            accessibilityLabel="Clear recent searches"
          />
          <PressableRow
            icon={<Heart size={20} color={COLORS.textSecondary} />}
            label="Favorites"
            value={`${favoriteTrackIds.length} tracks`}
            onPress={() => router.push('/(tabs)/library')}
            accessibilityLabel="Go to favorites"
          />
          <PressableRow
            icon={<ListMusic size={20} color={COLORS.textSecondary} />}
            label="Playlists"
            value={`${playlists.length} playlists`}
            onPress={() => router.push('/(tabs)/library')}
            accessibilityLabel="Go to playlists"
          />
          <PressableRow
            icon={<Clock size={20} color={COLORS.textSecondary} />}
            label="Recently Played"
            value={`${recentTrackIds.length} tracks`}
            onPress={() => setClearRecentVisible(true)}
            accessibilityLabel="Clear recently played"
          />
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone">
          <PressableRow
            icon={<Trash2 size={20} color={COLORS.error} />}
            label="Clear All Data"
            value="Remove everything"
            onPress={() => setClearAllVisible(true)}
            destructive
            accessibilityLabel="Clear all data"
          />
        </Section>

        {/* About */}
        <Section title="About">
          <InfoRow icon={<Info size={20} color={COLORS.textSecondary} />} label="App Name" value={APP_NAME} />
          <InfoRow icon={<Info size={20} color={COLORS.textSecondary} />} label="Version" value="1.0.0" />
          <InfoRow icon={<Info size={20} color={COLORS.textSecondary} />} label="Tagline" value={APP_TAGLINE} />
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{APP_NAME} uses iTunes Search API for music previews.</Text>
          <Text style={styles.footerSubtext}>Preview clips are 30 seconds. Not full songs.</Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={clearSearchesVisible}
        title="Clear Recent Searches"
        message="This will remove all your recent search history. This cannot be undone."
        confirmLabel="Clear"
        onConfirm={handleClearSearches}
        onCancel={() => setClearSearchesVisible(false)}
        destructive
      />
      <ConfirmDialog
        visible={clearRecentVisible}
        title="Clear Recently Played"
        message="This will remove your recently played history. This cannot be undone."
        confirmLabel="Clear"
        onConfirm={handleClearRecent}
        onCancel={() => setClearRecentVisible(false)}
        destructive
      />
      <ConfirmDialog
        visible={clearAllVisible}
        title="Clear All Data"
        message="This will permanently delete all playlists, favorites, recent tracks, searches, and preferences. This cannot be undone."
        confirmLabel="Delete Everything"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllVisible(false)}
        destructive
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, label, right }: { icon: React.ReactNode; label: string; right: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      {icon}
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}

function PressableRow({ icon, label, value, onPress, destructive, accessibilityLabel }: { icon: React.ReactNode; label: string; value?: string; onPress: () => void; destructive?: boolean; accessibilityLabel?: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && styles.settingRowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      {icon}
      <Text style={[styles.settingLabel, destructive && styles.destructiveText]}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <ChevronRight size={18} color={COLORS.textTertiary} />
    </Pressable>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      {icon}
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text style={styles.settingValue}>{value}</Text>
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
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.hero,
    fontFamily: 'Inter-Bold',
    color: COLORS.textPrimary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  settingRowPressed: {
    backgroundColor: COLORS.bgCardHover,
  },
  settingLabel: {
    flex: 0,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontFamily: 'Inter-Regular',
  },
  settingValue: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.caption,
    fontFamily: 'Inter-Regular',
  },
  destructiveText: {
    color: COLORS.error,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  volumeSliderContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  volumeSliderTrack: {
    height: 4,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeSliderFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 2,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  volumeValue: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  footerText: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.small,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  footerSubtext: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.tiny,
    fontFamily: 'Inter-Regular',
  },
});
