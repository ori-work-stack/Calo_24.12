import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PageTemplate, PageSection } from './PageTemplate';
import { colors } from '@/constants/theme';

export const HomePageExample = ({
  refreshing,
  onRefresh,
  onScanFood,
  onViewMenus,
  onOpenCalendar,
  onOpenAIChat,
  caloriesData,
  waterIntake,
}: any) => {
  const sections: PageSection[] = [
    {
      type: 'stats',
      data: {
        items: [
          {
            icon: 'flame',
            label: 'Calories',
            value: `${caloriesData?.consumed || 0}`,
            color: colors.error[500],
          },
          {
            icon: 'barbell',
            label: 'Protein',
            value: `${caloriesData?.protein || 0}g`,
            color: colors.charts.protein,
          },
          {
            icon: 'water',
            label: 'Water',
            value: `${waterIntake || 0}L`,
            color: colors.charts.water,
          },
          {
            icon: 'nutrition',
            label: 'Carbs',
            value: `${caloriesData?.carbs || 0}g`,
            color: colors.warning[500],
          },
        ],
        columns: 2,
      },
    },
    {
      type: 'actions',
      data: {
        items: [
          {
            icon: 'camera',
            label: 'Scan Food',
            onPress: onScanFood,
            color: colors.primary[500],
          },
          {
            icon: 'restaurant',
            label: 'View Menus',
            onPress: onViewMenus,
            color: colors.success[500],
          },
          {
            icon: 'calendar',
            label: 'Calendar',
            onPress: onOpenCalendar,
            color: colors.warning[500],
          },
          {
            icon: 'chatbubble-ellipses',
            label: 'AI Chat',
            onPress: onOpenAIChat,
            color: colors.charts.protein,
          },
        ],
        columns: 2,
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
    />
  );
};

export const StatisticsPageExample = ({
  refreshing,
  onRefresh,
  weeklyStats,
  achievements,
}: any) => {
  const sections: PageSection[] = [
    {
      type: 'metrics',
      data: {
        items: [
          {
            title: 'Average Calories',
            value: `${weeklyStats?.avgCalories || 0}`,
            subtitle: 'This week',
            icon: 'flame',
            color: colors.error[500],
          },
          {
            title: 'Meals Tracked',
            value: `${weeklyStats?.mealsTracked || 0}`,
            subtitle: 'Last 7 days',
            icon: 'restaurant',
            color: colors.success[500],
          },
          {
            title: 'Streak Days',
            value: `${weeklyStats?.streakDays || 0}`,
            subtitle: 'Current streak',
            icon: 'flame-outline',
            color: colors.warning[500],
          },
        ],
      },
    },
    {
      type: 'stats',
      data: {
        items: [
          {
            icon: 'trophy',
            label: 'Achievements',
            value: `${achievements?.length || 0}`,
            color: colors.warning[500],
          },
          {
            icon: 'star',
            label: 'Total XP',
            value: `${weeklyStats?.totalXP || 0}`,
            color: colors.charts.protein,
          },
          {
            icon: 'trending-up',
            label: 'Level',
            value: `${weeklyStats?.level || 1}`,
            color: colors.primary[500],
          },
        ],
        columns: 3,
      },
    },
    {
      type: 'custom',
      data: {
        component: (
          <View style={styles.customSection}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
          </View>
        ),
      },
    },
  ];

  return (
    <PageTemplate
      pageName="statistics"
      title="Statistics"
      subtitle="Track your progress"
      headerIcon="stats-chart"
      sections={sections}
      refreshing={refreshing}
      onRefresh={onRefresh}
      headerGradient={[colors.primary[500], colors.primary[600]]}
    />
  );
};

export const CalendarPageExample = ({
  refreshing,
  onRefresh,
  monthlyStats,
  calendarComponent,
}: any) => {
  const sections: PageSection[] = [
    {
      type: 'stats',
      data: {
        items: [
          {
            icon: 'calendar',
            label: 'Days Tracked',
            value: `${monthlyStats?.daysTracked || 0}`,
            color: colors.primary[500],
          },
          {
            icon: 'checkmark-circle',
            label: 'Completed',
            value: `${monthlyStats?.completedDays || 0}`,
            color: colors.success[500],
          },
          {
            icon: 'flame',
            label: 'Avg Calories',
            value: `${monthlyStats?.avgCalories || 0}`,
            color: colors.error[500],
          },
        ],
        columns: 3,
      },
    },
    {
      type: 'calendar',
      data: {
        component: calendarComponent,
      },
    },
  ];

  return (
    <PageTemplate
      pageName="calendar"
      title="Calendar"
      subtitle="Monthly overview"
      headerIcon="calendar-outline"
      sections={sections}
      refreshing={refreshing}
      onRefresh={onRefresh}
      headerGradient={[colors.primary[500], colors.primary[600], colors.primary[700]]}
    />
  );
};

export const ProfilePageExample = ({
  refreshing,
  onRefresh,
  userStats,
  onEditProfile,
  onSettings,
  onLogout,
}: any) => {
  const sections: PageSection[] = [
    {
      type: 'metrics',
      data: {
        items: [
          {
            title: 'Total Meals',
            value: `${userStats?.totalMeals || 0}`,
            subtitle: 'All time',
            icon: 'restaurant',
            color: colors.success[500],
          },
          {
            title: 'Days Active',
            value: `${userStats?.daysActive || 0}`,
            subtitle: 'Since joining',
            icon: 'calendar',
            color: colors.primary[500],
          },
        ],
      },
    },
    {
      type: 'actions',
      data: {
        items: [
          {
            icon: 'person-circle',
            label: 'Edit Profile',
            onPress: onEditProfile,
            color: colors.primary[500],
          },
          {
            icon: 'settings',
            label: 'Settings',
            onPress: onSettings,
            color: colors.neutral[600],
          },
          {
            icon: 'log-out',
            label: 'Logout',
            onPress: onLogout,
            color: colors.error[500],
          },
        ],
        columns: 3,
      },
    },
  ];

  return (
    <PageTemplate
      pageName="profile"
      title="Profile"
      subtitle="Manage your account"
      headerIcon="person"
      sections={sections}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  customSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
});
