import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import { fetchMeals, toggleMealFavorite, duplicateMeal, removeMeal } from "@/src/store/mealSlice";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Heart, Star, Copy, Trash2, Camera, Flame, Dumbbell, Wheat, Droplets } from "lucide-react-native";
import { PageTemplate } from "@/components/PageTemplate";
import { SectionBuilders } from "@/components/PageTemplateSectionBuilders";
import { colors as themeColors, spacing, borderRadius, typography } from "@/constants/theme";
import LoadingScreen from "@/components/LoadingScreen";
import ManualMealAddition from "@/components/history/ManualMealAddition";

interface Meal {
  id: string;
  meal_id?: string;
  meal_name?: string;
  name?: string;
  calories: number;
  protein?: number;
  protein_g?: number;
  carbs?: number;
  carbs_g?: number;
  fat?: number;
  fats_g?: number;
  meal_period?: string;
  mealPeriod?: string;
  created_at: string;
  upload_time?: string;
  image_url?: string;
  is_favorite: boolean;
  taste_rating?: number;
  ingredients?: any;
}

const getMealPeriodStyle = (mealPeriod: string) => {
  const styles = {
    breakfast: { color: "#F59E0B", bgColor: "#FEF3C7" },
    lunch: { color: "#EF4444", bgColor: "#FEE2E2" },
    dinner: { color: "#10B981", bgColor: "#D1FAE5" },
    snack: { color: "#F97316", bgColor: "#FED7AA" },
  };
  const type = mealPeriod?.toLowerCase().replace(/\s+/g, "_") || "other";
  return styles[type as keyof typeof styles] || { color: "#6B7280", bgColor: "#F3F4F6" };
};

const MealCard = ({ meal, onDelete, onDuplicate, onToggleFavorite }: any) => {
  const style = getMealPeriodStyle(meal.meal_period || meal.mealPeriod);

  const renderLeftActions = () => (
    <View style={styles.swipeAction}>
      <TouchableOpacity
        style={[styles.swipeActionButton, { backgroundColor: "#10B981" }]}
        onPress={() => onDuplicate(meal.id || meal.meal_id?.toString())}
      >
        <Copy size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Copy</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.swipeAction}>
      <TouchableOpacity
        style={[styles.swipeActionButton, { backgroundColor: "#EF4444" }]}
        onPress={() => onDelete(meal.id || meal.meal_id?.toString())}
      >
        <Trash2 size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions} renderRightActions={renderRightActions}>
      <View style={styles.mealCard}>
        <View style={styles.mealImage}>
          {meal.image_url ? (
            <Image source={{ uri: meal.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: style.bgColor }]}>
              <Camera size={24} color={style.color} />
            </View>
          )}
        </View>

        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={1}>
            {meal.meal_name || meal.name || "Unknown"}
          </Text>
          <View style={styles.mealMeta}>
            <View style={styles.caloriesBadge}>
              <Flame size={14} color="#F59E0B" />
              <Text style={styles.caloriesText}>{Math.round(meal.calories || 0)}</Text>
            </View>
            <View style={[styles.periodBadge, { backgroundColor: style.bgColor }]}>
              <Text style={[styles.periodText, { color: style.color }]}>
                {meal.meal_period || meal.mealPeriod || "Other"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onToggleFavorite(meal.id || meal.meal_id?.toString())}
          style={styles.favoriteButton}
        >
          <Heart
            size={20}
            color={meal.is_favorite ? "#EF4444" : "#9CA3AF"}
            fill={meal.is_favorite ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { meals, isLoading } = useSelector((state: RootState) => state.meal);
  const [refreshing, setRefreshing] = useState(false);
  const [showManualMealModal, setShowManualMealModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMeals());
    setRefreshing(false);
  }, [dispatch]);

  const handleToggleFavorite = useCallback(
    async (mealId: string) => {
      try {
        await dispatch(toggleMealFavorite(mealId)).unwrap();
        dispatch(fetchMeals());
      } catch (error) {
        Alert.alert("Error", "Failed to update favorite");
      }
    },
    [dispatch]
  );

  const handleDuplicateMeal = useCallback(
    async (mealId: string) => {
      try {
        await dispatch(duplicateMeal({ mealId, newDate: new Date().toISOString().split("T")[0] })).unwrap();
        Alert.alert("Success", "Meal duplicated");
        dispatch(fetchMeals());
      } catch (error) {
        Alert.alert("Error", "Failed to duplicate meal");
      }
    },
    [dispatch]
  );

  const handleRemoveMeal = useCallback(
    async (mealId: string) => {
      Alert.alert("Delete Meal", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(removeMeal(mealId)).unwrap();
              Alert.alert("Success", "Meal deleted");
              dispatch(fetchMeals());
            } catch (error) {
              Alert.alert("Error", "Failed to delete meal");
            }
          },
        },
      ]);
    },
    [dispatch]
  );

  const insights = useMemo(() => {
    if (!meals.length) return null;
    const totalCalories = meals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
    const avgCalories = Math.round(totalCalories / meals.length);
    const favoriteMeals = meals.filter((meal: any) => meal.is_favorite).length;
    return { totalMeals: meals.length, avgCalories, favoriteMeals, totalCalories };
  }, [meals]);

  const sections = [
    ...(insights
      ? [
          {
            type: "custom" as const,
            data: {
              component: (
                <View style={styles.insightsCard}>
                  <Text style={styles.insightsTitle}>Quick Stats</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{insights.totalMeals}</Text>
                      <Text style={styles.statLabel}>Total Meals</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{insights.avgCalories}</Text>
                      <Text style={styles.statLabel}>Avg Calories</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{insights.favoriteMeals}</Text>
                      <Text style={styles.statLabel}>Favorites</Text>
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
          <GestureHandlerRootView style={{ flex: 1 }}>
            <FlatList
              data={meals}
              keyExtractor={(item: any) => item.id || item.meal_id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  onDelete={handleRemoveMeal}
                  onDuplicate={handleDuplicateMeal}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
              scrollEnabled={false}
            />
          </GestureHandlerRootView>
        ),
      },
    },
  ];

  if (isLoading && !meals.length) {
    return <LoadingScreen text="Loading meals..." />;
  }

  return (
    <>
      <PageTemplate
        pageName="history"
        title="Meal History"
        subtitle="Track your nutrition journey"
        headerIcon="time"
        sections={sections}
        refreshing={refreshing}
        onRefresh={onRefresh}
        headerGradient={[themeColors.primary[500], themeColors.primary[600]]}
        headerRight={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowManualMealModal(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        }
      />
      <ManualMealAddition
        visible={showManualMealModal}
        onClose={() => setShowManualMealModal(false)}
        onMealAdded={() => dispatch(fetchMeals())}
      />
    </>
  );
}

const styles = StyleSheet.create({
  insightsCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  insightsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
    marginBottom: spacing.md,
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
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImage: {
    marginRight: spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
    marginBottom: spacing.xs,
  },
  mealMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  caloriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  caloriesText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: "#92400E",
  },
  periodBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  periodText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: spacing.md,
  },
  swipeActionButton: {
    flex: 1,
    width: "100%",
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  swipeActionText: {
    color: "#fff",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
