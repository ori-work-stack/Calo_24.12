import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { Flame, TrendingUp, Award, Trophy, Star, Target, Activity } from "lucide-react-native";
import { PageTemplate } from "@/components/PageTemplate";
import { SectionBuilders } from "@/components/PageTemplateSectionBuilders";
import { colors as themeColors, spacing, borderRadius, typography } from "@/constants/theme";
import { api } from "@/src/services/api";
import LoadingScreen from "@/components/LoadingScreen";
import { AchievementsSection } from "@/components/statistics/AchievementsSection";

interface WeeklyStats {
  avgCalories: number;
  totalMeals: number;
  avgProtein: number;
  streakDays: number;
}

export default function StatisticsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [statsRes, achievementsRes] = await Promise.all([
        api.get("/statistics/weekly"),
        api.get("/achievements/user"),
      ]);

      if (statsRes.data.success) {
        setWeeklyStats(statsRes.data.data);
      }

      if (achievementsRes.data.success) {
        setAchievements(achievementsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const sections = [
    SectionBuilders.weeklyProgress({
      avgCalories: weeklyStats?.avgCalories || 0,
      mealsTracked: weeklyStats?.totalMeals || 0,
      streakDays: weeklyStats?.streakDays || 0,
      totalXP: 1200,
    }),
    SectionBuilders.achievements({
      totalAchievements: 50,
      unlockedAchievements: achievements.length,
      totalXP: 1200,
      level: Math.floor(1200 / 200) + 1,
    }),
    {
      type: "custom" as const,
      data: {
        component: (
          <View style={styles.nutritionBreakdown}>
            <Text style={styles.sectionTitle}>Nutrition Breakdown</Text>
            <View style={styles.macroGrid}>
              <View style={styles.macroCard}>
                <View style={[styles.macroIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Flame size={24} color="#F59E0B" />
                </View>
                <Text style={styles.macroValue}>{weeklyStats?.avgCalories || 0}</Text>
                <Text style={styles.macroLabel}>Avg Calories</Text>
              </View>

              <View style={styles.macroCard}>
                <View style={[styles.macroIcon, { backgroundColor: "#DCFCE7" }]}>
                  <TrendingUp size={24} color="#10B981" />
                </View>
                <Text style={styles.macroValue}>{weeklyStats?.avgProtein || 0}g</Text>
                <Text style={styles.macroLabel}>Avg Protein</Text>
              </View>

              <View style={styles.macroCard}>
                <View style={[styles.macroIcon, { backgroundColor: "#DBEAFE" }]}>
                  <Activity size={24} color="#3B82F6" />
                </View>
                <Text style={styles.macroValue}>{weeklyStats?.totalMeals || 0}</Text>
                <Text style={styles.macroLabel}>Total Meals</Text>
              </View>

              <View style={styles.macroCard}>
                <View style={[styles.macroIcon, { backgroundColor: "#F3E8FF" }]}>
                  <Target size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.macroValue}>{weeklyStats?.streakDays || 0}</Text>
                <Text style={styles.macroLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        ),
      },
    },
    {
      type: "custom" as const,
      data: {
        component: <AchievementsSection />,
      },
    },
  ];

  if (isLoading) {
    return <LoadingScreen text="Loading statistics..." />;
  }

  return (
    <PageTemplate
      pageName="statistics"
      title="Statistics"
      subtitle="Track your progress"
      headerIcon="stats-chart"
      sections={sections}
      refreshing={refreshing}
      onRefresh={onRefresh}
      headerGradient={[themeColors.primary[500], themeColors.primary[600]]}
    />
  );
}

const styles = StyleSheet.create({
  nutritionBreakdown: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
    marginBottom: spacing.lg,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  macroCard: {
    width: "48%",
    backgroundColor: themeColors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  macroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  macroValue: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
    marginBottom: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[600],
    textAlign: "center",
  },
});
