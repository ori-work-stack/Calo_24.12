import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageTemplate } from './PageTemplate';
import { SectionBuilders } from './PageTemplateSectionBuilders';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import CircularCaloriesProgress from './index/CircularCaloriesProgress';
import WaterIntakeCard from './index/WaterIntake';
import { useOptimizedSelector } from '@/hooks/useOptimizedSelector';

const ConvertedHomePageExample = () => {
  const [refreshing, setRefreshing] = useState(false);
  const user = useOptimizedSelector((state) => state.auth.user);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const sections = [
    {
      type: 'custom' as const,
      data: {
        component: (
          <View style={styles.greetingCard}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <Pressable
              style={styles.notificationButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.neutral[700]} />
            </Pressable>
          </View>
        ),
      },
    },
    {
      type: 'custom' as const,
      data: {
        component: <CircularCaloriesProgress />,
      },
    },
    {
      type: 'custom' as const,
      data: {
        component: <WaterIntakeCard />,
      },
    },
    SectionBuilders.nutritionStats({
      calories: 1500,
      protein: 80,
      carbs: 180,
      fats: 50,
    }),
    SectionBuilders.mainActions({
      onScanFood: () => router.push('/(tabs)/food-scanner'),
      onViewMenus: () => router.push('/(tabs)/recommended-menus'),
      onOpenCalendar: () => router.push('/(tabs)/calendar'),
      onOpenAIChat: () => router.push('/(tabs)/ai-chat'),
    }),
    {
      type: 'custom' as const,
      data: {
        component: (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success[500]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Breakfast Logged</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
          </View>
        ),
      },
    },
  ];

  return (
    <PageTemplate
      pageName="home"
      title="NutriTrack"
      subtitle="Your Health Dashboard"
      headerIcon="home"
      sections={sections}
      refreshing={refreshing}
      onRefresh={onRefresh}
      headerGradient={[colors.success[500], colors.success[600]]}
    />
  );
};

const styles = StyleSheet.create({
  greetingCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  activitySection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
  },
});

export default ConvertedHomePageExample;
