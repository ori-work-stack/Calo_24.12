import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/src/i18n/context/LanguageContext";
import { ChefHat, Plus, Calendar, Star, Eye, Play, Award } from "lucide-react-native";
import { PageTemplate } from "@/components/PageTemplate";
import { colors as themeColors, spacing, borderRadius, typography } from "@/constants/theme";
import { api } from "@/src/services/api";
import LoadingScreen from "@/components/LoadingScreen";
import { router } from "expo-router";
import { EnhancedMenuCreator } from "@/components/menu";

interface RecommendedMenu {
  menu_id: string;
  title: string;
  description?: string;
  total_calories: number;
  total_protein?: number;
  days_count: number;
  dietary_category?: string;
  estimated_cost?: number;
  prep_time_minutes?: number;
  difficulty_level: number;
  meals: any[];
}

const MenuCard = ({ menu, onStart, onView }: any) => {
  const avgCalories = Math.round(menu.total_calories / (menu.days_count || 1));
  const avgProtein = Math.round((menu.total_protein || 0) / (menu.days_count || 1));

  return (
    <View style={styles.menuCard}>
      <View style={styles.menuHeader}>
        <ChefHat size={32} color={themeColors.primary[500]} />
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Calendar size={12} color="#fff" />
            <Text style={styles.badgeText}>{menu.days_count}d</Text>
          </View>
        </View>
      </View>

      <Text style={styles.menuTitle} numberOfLines={2}>
        {menu.title}
      </Text>
      <Text style={styles.menuSubtitle}>{menu.dietary_category || "Balanced Menu"}</Text>

      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{avgCalories}</Text>
          <Text style={styles.nutritionLabel}>Calories</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{avgProtein}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{menu.prep_time_minutes || 30}m</Text>
          <Text style={styles.nutritionLabel}>Prep</Text>
        </View>
      </View>

      <View style={styles.menuActions}>
        <TouchableOpacity style={styles.viewButton} onPress={() => onView(menu.menu_id)}>
          <Eye size={16} color={themeColors.neutral[600]} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton} onPress={() => onStart(menu.menu_id)}>
          <Play size={16} color="#fff" />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function RecommendedMenusScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [menus, setMenus] = useState<RecommendedMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [activePlanData, setActivePlanData] = useState<any>(null);

  useEffect(() => {
    loadRecommendedMenus();
    checkForActivePlan();
  }, []);

  const loadRecommendedMenus = async () => {
    try {
      const response = await api.get("/recommended-menus");
      if (response.data.success) {
        setMenus(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading menus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForActivePlan = async () => {
    try {
      const response = await api.get("/meal-plans/current");
      if (response.data.success && response.data.hasActivePlan) {
        setActivePlanData({
          plan_id: response.data.planId,
          name: response.data.planName || "Active Plan",
        });
        setHasActivePlan(true);
      } else {
        setActivePlanData(null);
        setHasActivePlan(false);
      }
    } catch (error) {
      setActivePlanData(null);
      setHasActivePlan(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecommendedMenus();
    await checkForActivePlan();
    setRefreshing(false);
  }, []);

  const handleStartMenu = async (menuId: string) => {
    try {
      const response = await api.post(`/recommended-menus/${menuId}/start-today`, {});
      if (response.data.success) {
        Alert.alert("Success!", "Menu started successfully!", [
          {
            text: "OK",
            onPress: () => router.push(`/menu/activeMenu?planId=${response.data.data.plan_id}`),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start menu");
    }
  };

  const stats = useMemo(() => {
    if (!menus.length) return null;
    const totalCalories = menus.reduce((sum, menu) => sum + (menu.total_calories || 0), 0);
    const avgCalories = Math.round(totalCalories / menus.length);
    const totalMeals = menus.reduce((sum, menu) => sum + menu.meals.length, 0);
    return { totalMenus: menus.length, avgCalories, totalMeals };
  }, [menus]);

  const sections = [
    ...(hasActivePlan && activePlanData
      ? [
          {
            type: "custom" as const,
            data: {
              component: (
                <TouchableOpacity
                  style={styles.activePlanCard}
                  onPress={() => router.push(`/menu/activeMenu?planId=${activePlanData.plan_id}`)}
                >
                  <Text style={styles.activePlanBadge}>Active</Text>
                  <Text style={styles.activePlanTitle}>{activePlanData.name}</Text>
                  <Text style={styles.activePlanSubtitle}>Continue tracking your progress</Text>
                </TouchableOpacity>
              ),
            },
          },
        ]
      : []),
    ...(stats
      ? [
          {
            type: "custom" as const,
            data: {
              component: (
                <View style={styles.statsCard}>
                  <View style={styles.statsHeader}>
                    <Text style={styles.statsTitle}>Menu Overview</Text>
                    <Award size={20} color={themeColors.primary[500]} />
                  </View>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.totalMenus}</Text>
                      <Text style={styles.statLabel}>Menus</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.avgCalories}</Text>
                      <Text style={styles.statLabel}>Avg Cal</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.totalMeals}</Text>
                      <Text style={styles.statLabel}>Meals</Text>
                    </View>
                  </View>
                </View>
              ),
            },
          },
        ]
      : []),
    {
      type: "custom" as const,
      data: {
        component: (
          <View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowEnhancedCreation(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Plus size={20} color="#fff" />
              )}
              <Text style={styles.createButtonText}>Create New Menu</Text>
            </TouchableOpacity>

            <View style={styles.menusGrid}>
              {menus.map((menu) => (
                <MenuCard
                  key={menu.menu_id}
                  menu={menu}
                  onStart={handleStartMenu}
                  onView={(menuId: string) => router.push(`/menu/${menuId}`)}
                />
              ))}
            </View>
          </View>
        ),
      },
    },
  ];

  if (isLoading) {
    return <LoadingScreen text="Loading menus..." />;
  }

  return (
    <>
      <PageTemplate
        pageName="recommended-menus"
        title="Recommended Menus"
        subtitle="Personalized meal plans"
        headerIcon="restaurant"
        sections={sections}
        refreshing={refreshing}
        onRefresh={onRefresh}
        headerGradient={[themeColors.primary[500], themeColors.primary[600]]}
      />
      {showEnhancedCreation && (
        <EnhancedMenuCreator
          onCreateMenu={async () => {
            setShowEnhancedCreation(false);
            await loadRecommendedMenus();
          }}
          onClose={() => setShowEnhancedCreation(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  activePlanCard: {
    backgroundColor: themeColors.primary[500],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  activePlanBadge: {
    color: "#fff",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  activePlanTitle: {
    color: "#fff",
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  activePlanSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: typography.fontSize.sm,
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: themeColors.primary[600],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[600],
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themeColors.primary[500],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  createButtonText: {
    color: "#fff",
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  menusGrid: {
    gap: spacing.lg,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  badgeText: {
    color: "#fff",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  menuTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
    marginBottom: spacing.xs,
  },
  menuSubtitle: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[600],
    marginBottom: spacing.md,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
  },
  nutritionLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.neutral[600],
  },
  menuActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: themeColors.neutral[100],
    gap: spacing.xs,
  },
  viewButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[600],
  },
  startButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: themeColors.primary[500],
    gap: spacing.xs,
  },
  startButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: "#fff",
  },
});
