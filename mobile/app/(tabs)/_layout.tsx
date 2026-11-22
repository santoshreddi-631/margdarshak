import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ResponsiveTabBar } from '@/components/navigation/ResponsiveTabBar';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Tabs
      tabBar={(props: any) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.background,
          marginLeft: isDesktop ? 250 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarLabel: t('navigation.home'),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('navigation.explore'),
          tabBarLabel: t('navigation.explore'),
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: t('navigation.roadmap'),
          tabBarLabel: t('navigation.roadmap'),
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: t('navigation.opportunities'),
          tabBarLabel: t('navigation.opportunities'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarLabel: t('navigation.profile'),
        }}
      />
    </Tabs>
  );
}
