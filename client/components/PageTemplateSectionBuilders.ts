import { PageSection } from './PageTemplate';
import { colors } from '@/constants/theme';

export const SectionBuilders = {
  nutritionStats: (data: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    water?: number;
  }): PageSection => ({
    type: 'stats',
    data: {
      items: [
        {
          icon: 'flame',
          label: 'Calories',
          value: `${data.calories || 0}`,
          color: colors.error[500],
        },
        {
          icon: 'barbell',
          label: 'Protein',
          value: `${data.protein || 0}g`,
          color: colors.charts.protein,
        },
        {
          icon: 'nutrition',
          label: 'Carbs',
          value: `${data.carbs || 0}g`,
          color: colors.warning[500],
        },
        {
          icon: 'water',
          label: 'Fats',
          value: `${data.fats || 0}g`,
          color: colors.success[500],
        },
      ],
      columns: 2,
    },
  }),

  weeklyProgress: (data: {
    avgCalories?: number;
    mealsTracked?: number;
    streakDays?: number;
    totalXP?: number;
  }): PageSection => ({
    type: 'metrics',
    data: {
      items: [
        {
          title: 'Average Calories',
          value: `${data.avgCalories || 0}`,
          subtitle: 'This week',
          icon: 'flame',
          color: colors.error[500],
        },
        {
          title: 'Meals Tracked',
          value: `${data.mealsTracked || 0}`,
          subtitle: 'Last 7 days',
          icon: 'restaurant',
          color: colors.success[500],
        },
        {
          title: 'Streak Days',
          value: `${data.streakDays || 0}`,
          subtitle: 'Current streak',
          icon: 'flame-outline',
          color: colors.warning[500],
        },
        {
          title: 'Total XP',
          value: `${data.totalXP || 0}`,
          subtitle: 'Experience points',
          icon: 'star',
          color: colors.charts.protein,
        },
      ],
    },
  }),

  mainActions: (handlers: {
    onScanFood?: () => void;
    onViewMenus?: () => void;
    onOpenCalendar?: () => void;
    onOpenAIChat?: () => void;
  }): PageSection => ({
    type: 'actions',
    data: {
      items: [
        ...(handlers.onScanFood
          ? [
              {
                icon: 'camera' as const,
                label: 'Scan Food',
                onPress: handlers.onScanFood,
                color: colors.primary[500],
              },
            ]
          : []),
        ...(handlers.onViewMenus
          ? [
              {
                icon: 'restaurant' as const,
                label: 'View Menus',
                onPress: handlers.onViewMenus,
                color: colors.success[500],
              },
            ]
          : []),
        ...(handlers.onOpenCalendar
          ? [
              {
                icon: 'calendar' as const,
                label: 'Calendar',
                onPress: handlers.onOpenCalendar,
                color: colors.warning[500],
              },
            ]
          : []),
        ...(handlers.onOpenAIChat
          ? [
              {
                icon: 'chatbubble-ellipses' as const,
                label: 'AI Chat',
                onPress: handlers.onOpenAIChat,
                color: colors.charts.protein,
              },
            ]
          : []),
      ],
      columns: 2,
    },
  }),

  calendarStats: (data: {
    daysTracked?: number;
    completedDays?: number;
    avgCalories?: number;
    totalMeals?: number;
  }): PageSection => ({
    type: 'stats',
    data: {
      items: [
        {
          icon: 'calendar',
          label: 'Days Tracked',
          value: `${data.daysTracked || 0}`,
          color: colors.primary[500],
        },
        {
          icon: 'checkmark-circle',
          label: 'Completed',
          value: `${data.completedDays || 0}`,
          color: colors.success[500],
        },
        {
          icon: 'flame',
          label: 'Avg Calories',
          value: `${data.avgCalories || 0}`,
          color: colors.error[500],
        },
        {
          icon: 'restaurant',
          label: 'Total Meals',
          value: `${data.totalMeals || 0}`,
          color: colors.warning[500],
        },
      ],
      columns: 2,
    },
  }),

  achievements: (data: {
    totalAchievements?: number;
    unlockedAchievements?: number;
    totalXP?: number;
    level?: number;
  }): PageSection => ({
    type: 'stats',
    data: {
      items: [
        {
          icon: 'trophy',
          label: 'Achievements',
          value: `${data.unlockedAchievements || 0}/${data.totalAchievements || 0}`,
          color: colors.warning[500],
        },
        {
          icon: 'star',
          label: 'Total XP',
          value: `${data.totalXP || 0}`,
          color: colors.charts.protein,
        },
        {
          icon: 'trending-up',
          label: 'Level',
          value: `${data.level || 1}`,
          color: colors.primary[500],
        },
      ],
      columns: 3,
    },
  }),

  profileActions: (handlers: {
    onEditProfile?: () => void;
    onSettings?: () => void;
    onNotifications?: () => void;
    onPrivacy?: () => void;
    onHelp?: () => void;
    onLogout?: () => void;
  }): PageSection => ({
    type: 'actions',
    data: {
      items: [
        ...(handlers.onEditProfile
          ? [
              {
                icon: 'person-circle' as const,
                label: 'Edit Profile',
                onPress: handlers.onEditProfile,
                color: colors.primary[500],
              },
            ]
          : []),
        ...(handlers.onSettings
          ? [
              {
                icon: 'settings' as const,
                label: 'Settings',
                onPress: handlers.onSettings,
                color: colors.neutral[600],
              },
            ]
          : []),
        ...(handlers.onNotifications
          ? [
              {
                icon: 'notifications' as const,
                label: 'Notifications',
                onPress: handlers.onNotifications,
                color: colors.warning[500],
              },
            ]
          : []),
        ...(handlers.onPrivacy
          ? [
              {
                icon: 'lock-closed' as const,
                label: 'Privacy',
                onPress: handlers.onPrivacy,
                color: colors.error[500],
              },
            ]
          : []),
        ...(handlers.onHelp
          ? [
              {
                icon: 'help-circle' as const,
                label: 'Help',
                onPress: handlers.onHelp,
                color: colors.charts.water,
              },
            ]
          : []),
        ...(handlers.onLogout
          ? [
              {
                icon: 'log-out' as const,
                label: 'Logout',
                onPress: handlers.onLogout,
                color: colors.error[600],
              },
            ]
          : []),
      ],
      columns: 3,
    },
  }),

  userStats: (data: {
    totalMeals?: number;
    daysActive?: number;
    favoriteMeals?: number;
    caloriesTotal?: number;
  }): PageSection => ({
    type: 'metrics',
    data: {
      items: [
        {
          title: 'Total Meals',
          value: `${data.totalMeals || 0}`,
          subtitle: 'All time',
          icon: 'restaurant',
          color: colors.success[500],
        },
        {
          title: 'Days Active',
          value: `${data.daysActive || 0}`,
          subtitle: 'Since joining',
          icon: 'calendar',
          color: colors.primary[500],
        },
        {
          title: 'Favorite Meals',
          value: `${data.favoriteMeals || 0}`,
          subtitle: 'Saved recipes',
          icon: 'heart',
          color: colors.error[500],
        },
        {
          title: 'Total Calories',
          value: `${data.caloriesTotal?.toLocaleString() || 0}`,
          subtitle: 'Lifetime tracking',
          icon: 'flame',
          color: colors.warning[500],
        },
      ],
    },
  }),

  menuActions: (handlers: {
    onCreateMenu?: () => void;
    onViewActive?: () => void;
    onViewHistory?: () => void;
    onGenerateAI?: () => void;
  }): PageSection => ({
    type: 'actions',
    data: {
      items: [
        ...(handlers.onCreateMenu
          ? [
              {
                icon: 'add-circle' as const,
                label: 'Create Menu',
                onPress: handlers.onCreateMenu,
                color: colors.primary[500],
              },
            ]
          : []),
        ...(handlers.onViewActive
          ? [
              {
                icon: 'list' as const,
                label: 'Active Menu',
                onPress: handlers.onViewActive,
                color: colors.success[500],
              },
            ]
          : []),
        ...(handlers.onViewHistory
          ? [
              {
                icon: 'time' as const,
                label: 'Menu History',
                onPress: handlers.onViewHistory,
                color: colors.warning[500],
              },
            ]
          : []),
        ...(handlers.onGenerateAI
          ? [
              {
                icon: 'sparkles' as const,
                label: 'AI Generate',
                onPress: handlers.onGenerateAI,
                color: colors.charts.protein,
              },
            ]
          : []),
      ],
      columns: 2,
    },
  }),

  deviceStats: (data: {
    connectedDevices?: number;
    todaysSteps?: number;
    heartRate?: number;
    sleepHours?: number;
  }): PageSection => ({
    type: 'stats',
    data: {
      items: [
        {
          icon: 'phone-portrait',
          label: 'Devices',
          value: `${data.connectedDevices || 0}`,
          color: colors.primary[500],
        },
        {
          icon: 'walk',
          label: 'Steps',
          value: `${data.todaysSteps?.toLocaleString() || 0}`,
          color: colors.success[500],
        },
        {
          icon: 'heart',
          label: 'Heart Rate',
          value: `${data.heartRate || 0} bpm`,
          color: colors.error[500],
        },
        {
          icon: 'bed',
          label: 'Sleep',
          value: `${data.sleepHours || 0}h`,
          color: colors.charts.protein,
        },
      ],
      columns: 2,
    },
  }),

  customSection: (component: React.ReactNode): PageSection => ({
    type: 'custom',
    data: {
      component,
    },
  }),

  calendarSection: (component: React.ReactNode): PageSection => ({
    type: 'calendar',
    data: {
      component,
    },
  }),
};

export const PresetPages = {
  home: (data: any, handlers: any) => [
    SectionBuilders.nutritionStats(data.nutrition),
    SectionBuilders.mainActions(handlers),
  ],

  statistics: (data: any) => [
    SectionBuilders.weeklyProgress(data.weekly),
    SectionBuilders.achievements(data.achievements),
  ],

  calendar: (data: any, calendarComponent: React.ReactNode) => [
    SectionBuilders.calendarStats(data.monthly),
    SectionBuilders.calendarSection(calendarComponent),
  ],

  profile: (data: any, handlers: any) => [
    SectionBuilders.userStats(data.stats),
    SectionBuilders.profileActions(handlers),
  ],

  menus: (data: any, handlers: any) => [
    SectionBuilders.calendarStats(data.menuStats),
    SectionBuilders.menuActions(handlers),
  ],

  devices: (data: any, deviceComponent: React.ReactNode) => [
    SectionBuilders.deviceStats(data.devices),
    SectionBuilders.customSection(deviceComponent),
  ],
};
