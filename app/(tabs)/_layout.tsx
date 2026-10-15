import { Tabs } from 'expo-router';
import { Home, Search, Library, Settings } from 'lucide-react-native';
import { COLORS } from '@/src/constants/theme';
import { MiniPlayer } from '@/src/components/MiniPlayer';
import { usePlayer } from '@/src/context/PlayerContext';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { playerState } = usePlayer();
  const hasTrack = playerState.currentTrack !== null;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.bgDark,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarActiveTintColor: COLORS.purpleLight,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Regular',
            fontSize: 11,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ size, color }) => <Search size={size} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ size, color }) => <Library size={size} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => <Settings size={size} color={color} strokeWidth={2} />,
          }}
        />
      </Tabs>
      {hasTrack && <MiniPlayer />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
});
