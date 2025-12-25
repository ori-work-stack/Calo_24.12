import React from 'react';
import { PageTemplate } from './PageTemplate';
import { SectionBuilders, PresetPages } from './PageTemplateSectionBuilders';

export const QuickStartHomePage = () => {
  const sections = PresetPages.home(
    {
      nutrition: {
        calories: 1500,
        protein: 80,
        carbs: 180,
        fats: 50,
      },
    },
    {
      onScanFood: () => console.log('Scan food'),
      onViewMenus: () => console.log('View menus'),
      onOpenCalendar: () => console.log('Open calendar'),
      onOpenAIChat: () => console.log('Open AI chat'),
    }
  );

  return (
    <PageTemplate
      pageName="home"
      title="NutriTrack"
      subtitle="Your Health Dashboard"
      headerIcon="home"
      sections={sections}
    />
  );
};

export const QuickStartStatisticsPage = () => {
  const sections = PresetPages.statistics({
    weekly: {
      avgCalories: 1800,
      mealsTracked: 21,
      streakDays: 7,
      totalXP: 1200,
    },
    achievements: {
      totalAchievements: 50,
      unlockedAchievements: 15,
      totalXP: 1200,
      level: 5,
    },
  });

  return (
    <PageTemplate
      pageName="statistics"
      title="Statistics"
      subtitle="Track your progress"
      headerIcon="stats-chart"
      sections={sections}
    />
  );
};

export const QuickStartProfilePage = () => {
  const sections = PresetPages.profile(
    {
      stats: {
        totalMeals: 450,
        daysActive: 60,
        favoriteMeals: 12,
        caloriesTotal: 675000,
      },
    },
    {
      onEditProfile: () => console.log('Edit profile'),
      onSettings: () => console.log('Settings'),
      onNotifications: () => console.log('Notifications'),
      onPrivacy: () => console.log('Privacy'),
      onHelp: () => console.log('Help'),
      onLogout: () => console.log('Logout'),
    }
  );

  return (
    <PageTemplate
      pageName="profile"
      title="Profile"
      subtitle="Manage your account"
      headerIcon="person"
      sections={sections}
    />
  );
};

export const CustomPageWithBuilder = () => {
  const sections = [
    SectionBuilders.nutritionStats({
      calories: 2000,
      protein: 100,
      carbs: 250,
      fats: 70,
    }),
    SectionBuilders.weeklyProgress({
      avgCalories: 1900,
      mealsTracked: 18,
      streakDays: 5,
      totalXP: 850,
    }),
    SectionBuilders.mainActions({
      onScanFood: () => console.log('Scan'),
      onViewMenus: () => console.log('Menus'),
    }),
  ];

  return (
    <PageTemplate
      pageName="custom"
      title="Custom Page"
      subtitle="Built with section builders"
      headerIcon="construct"
      sections={sections}
    />
  );
};

export const MinimalCustomPage = () => {
  return (
    <PageTemplate
      pageName="minimal"
      title="Minimal Page"
      sections={[
        {
          type: 'stats',
          data: {
            items: [
              { icon: 'flame', label: 'Value 1', value: '100' },
              { icon: 'water', label: 'Value 2', value: '50' },
            ],
            columns: 2,
          },
        },
        {
          type: 'actions',
          data: {
            items: [
              {
                icon: 'add',
                label: 'Action 1',
                onPress: () => console.log('Action 1'),
              },
              {
                icon: 'share',
                label: 'Action 2',
                onPress: () => console.log('Action 2'),
              },
            ],
            columns: 2,
          },
        },
      ]}
    />
  );
};
