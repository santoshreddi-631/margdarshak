import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  LayoutGrid,
  Compass,
  CalendarDays,
  Briefcase,
  User,
  GraduationCap,
  LogOut,
  Settings,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export interface ResponsiveTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, {
    options: {
      title?: string;
      tabBarLabel?: string;
    };
  }>;
  navigation?: any;
  insets?: any;
}

export const ResponsiveTabBar: React.FC<ResponsiveTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const isDesktop = width >= 768;

  const getIcon = (routeName: string, isFocused: boolean, color: string) => {
    const size = 20;
    switch (routeName) {
      case 'index':
        return <LayoutGrid size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'explore':
        return <Compass size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'roadmap':
        return <CalendarDays size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'opportunities':
        return <Briefcase size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'profile':
        return <User size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
      default:
        return <LayoutGrid size={size} color={color} strokeWidth={2} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Dashboard';
      case 'explore':
        return 'Explore';
      case 'roadmap':
        return 'Schedule';
      case 'opportunities':
        return 'Opportunities';
      case 'profile':
        return 'My profile';
      default:
        return routeName;
    }
  };

  const handleTabPress = (routeKey: string, routeName: string, isFocused: boolean) => {
    if (isFocused) return;
    try {
      if (navigation?.emit) {
        const event = navigation.emit({
          type: 'tabPress',
          target: routeKey,
          canPreventDefault: true,
        });
        if (event?.defaultPrevented) return;
      }
      if (navigation?.navigate) {
        navigation.navigate(routeName);
      } else {
        const target = routeName === 'index' ? '/(tabs)' : `/(tabs)/${routeName}`;
        router.push(target as any);
      }
    } catch (_err) {
      const target = routeName === 'index' ? '/(tabs)' : `/(tabs)/${routeName}`;
      router.push(target as any);
    }
  };

  // DESKTOP WEB SIDEBAR LAYOUT (Matches Image 5 & 6 EduWay layout)
  if (isDesktop) {
    return (
      <View style={styles.desktopSidebar}>
        {/* App Logo & Brand Header */}
        <View style={styles.sidebarBrandRow}>
          <View style={styles.logoSquare}>
            <GraduationCap size={22} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.sidebarBrandTitle}>Margdarshak</Text>
            <Text style={styles.sidebarBrandSubtitle}>AI Career Guide</Text>
          </View>
        </View>

        {/* Navigation Items List */}
        <View style={styles.sidebarNavList}>
          {state.routes.map((route: { key: string; name: string }, index: number) => {
            const { options } = descriptors[route.key] || { options: {} };
            const isFocused = state.index === index;
            const label = options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : getLabel(route.name);

            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route.key, route.name, isFocused)}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                style={({ pressed }) => [
                  styles.sidebarNavItem,
                  isFocused && styles.sidebarNavItemFocused,
                  pressed && styles.sidebarNavItemPressed,
                ]}
              >
                {getIcon(
                  route.name,
                  isFocused,
                  isFocused ? '#FFFFFF' : Colors.textSecondary
                )}
                <Text
                  style={[
                    styles.sidebarNavLabel,
                    isFocused && styles.sidebarNavLabelFocused,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sidebar Footer Actions */}
        <View style={styles.sidebarFooter}>
          <Pressable
            onPress={() => {
              try {
                if (navigation?.navigate) {
                  navigation.navigate('profile');
                } else {
                  router.push('/(tabs)/profile');
                }
              } catch {
                router.push('/(tabs)/profile');
              }
            }}
            style={styles.sidebarFooterItem}
          >
            <Settings size={18} color={Colors.textSecondary} />
            <Text style={styles.sidebarFooterLabel}>Settings</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                await signOut();
                router.replace('/(auth)/welcome');
              } catch {
                router.replace('/(auth)/welcome');
              }
            }}
            style={styles.sidebarFooterItem}
          >
            <LogOut size={18} color={Colors.textSecondary} />
            <Text style={styles.sidebarFooterLabel}>Log out</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // MOBILE FLOATING DOCK BAR (Matches Images 1, 2, 3, 4)
  return (
    <View
      style={[
        styles.dockWrapper,
        { bottom: Math.max(insets.bottom + 12, 22) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.floatingDock}>
        {state.routes.map((route: { key: string; name: string }, index: number) => {
          const isFocused = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(route.key, route.name, isFocused)}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={getLabel(route.name)}
              style={({ pressed }) => [
                styles.dockItem,
                pressed && styles.dockItemPressed,
              ]}
            >
              {isFocused ? (
                <View style={styles.activeCapsule}>
                  {getIcon(route.name, true, Colors.dockActiveIcon)}
                </View>
              ) : (
                <View style={styles.inactiveIconWrapper}>
                  {getIcon(route.name, false, Colors.dockInactiveIcon)}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // MOBILE FLOATING DOCK STYLES
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  floatingDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dockBackground, // Deep charcoal/black #222222
    borderRadius: BorderRadius.full, // Pill container
    height: 60,
    paddingHorizontal: 8,
    width: '88%',
    maxWidth: 360,
    ...Shadows.dock,
  },
  dockItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  dockItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  activeCapsule: {
    backgroundColor: Colors.dockActiveCapsule, // Pure white capsule #FFFFFF
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    height: 42,
    ...Shadows.sm,
  },
  inactiveIconWrapper: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // DESKTOP SIDEBAR STYLES (Clean tablet / desktop web)
  desktopSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    zIndex: 100,
    justifyContent: 'space-between',
  },
  sidebarBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  logoSquare: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.mint, // Pastel mint green badge
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarBrandTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sidebarBrandSubtitle: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
  },
  sidebarNavList: {
    flex: 1,
    gap: 8,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  sidebarNavItemFocused: {
    backgroundColor: Colors.dark, // Active dark pill #222222
  },
  sidebarNavItemPressed: {
    opacity: 0.85,
  },
  sidebarNavLabel: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
  },
  sidebarNavLabelFocused: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    gap: 8,
  },
  sidebarFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  sidebarFooterLabel: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
});
