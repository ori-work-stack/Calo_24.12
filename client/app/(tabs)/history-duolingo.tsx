import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import { fetchMeals } from "@/src/store/mealSlice";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/src/context/ThemeContext";
import { CheckCircle, Circle, Flame, Trophy, Star, Droplets, Target } from "lucide-react-native";
import LoadingScreen from "@/components/LoadingScreen";

const { width, height } = Dimensions.get("window");
const CIRCLE_SIZE = 80;
const MEAL_DOT_SIZE = 12;

interface DayData {
  date: string;
  meals: any[];
  totalCalories: number;
  goalMet: boolean;
  mealCount: number;
}

const MealDot = ({ filled, color, style }: any) => (
  <View style={[styles.mealDot, style]}>
    <View style={[styles.mealDotInner, { backgroundColor: filled ? color : "transparent", borderColor: color }]} />
  </View>
);

const DayCircle = ({ day, onPress, index }: any) => {
  const isToday = new Date(day.date).toDateString() === new Date().toDateString();
  const completionPercentage = Math.min((day.mealCount / 5) * 100, 100);
  const circleColor = day.goalMet ? "#10B981" : day.mealCount > 0 ? "#22D3EE" : "#D1D5DB";

  // Position meal dots in a circle around the main circle
  const mealDotPositions = [
    { top: -8, left: CIRCLE_SIZE / 2 - MEAL_DOT_SIZE / 2 }, // Top
    { top: CIRCLE_SIZE / 2 - MEAL_DOT_SIZE / 2, right: -8 }, // Right
    { bottom: -8, left: CIRCLE_SIZE / 2 - MEAL_DOT_SIZE / 2 }, // Bottom
    { top: CIRCLE_SIZE / 2 - MEAL_DOT_SIZE / 2, left: -8 }, // Left
    { top: 10, right: 10 }, // Top-right
  ];

  return (
    <View style={styles.dayContainer}>
      {index > 0 && <View style={styles.pathLine} />}

      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.circleContainer]}>
          <LinearGradient
            colors={day.goalMet ? ["#10B981", "#059669"] : day.mealCount > 0 ? ["#22D3EE", "#06B6D4"] : ["#E5E7EB", "#D1D5DB"]}
            style={styles.dayCircle}
          >
            {day.goalMet ? (
              <CheckCircle size={36} color="#fff" strokeWidth={3} />
            ) : (
              <Text style={styles.dayNumber}>{new Date(day.date).getDate()}</Text>
            )}
          </LinearGradient>

          {/* Meal dots around the circle */}
          {[...Array(5)].map((_, i) => (
            <MealDot
              key={i}
              filled={i < day.mealCount}
              color={day.goalMet ? "#10B981" : "#22D3EE"}
              style={mealDotPositions[i]}
            />
          ))}

          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>

        <Text style={styles.dateText}>
          {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const DayDetailModal = ({ visible, day, onClose }: any) => {
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  if (!day) return null;

  const modalTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTransform }] }]}>
          {/* Speech bubble pointer */}
          <View style={styles.speechBubblePointer} />

          <LinearGradient
            colors={day.goalMet ? ["#10B981", "#059669"] : ["#22D3EE", "#06B6D4"]}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalDate}>
                  {new Date(day.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
                <Text style={styles.modalSubtitle}>{day.mealCount} meals logged</Text>
              </View>
              {day.goalMet && <Trophy size={32} color="#fff" />}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Flame size={24} color="#fff" />
                <Text style={styles.statValue}>{day.totalCalories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>

              <View style={styles.statCard}>
                <Target size={24} color="#fff" />
                <Text style={styles.statValue}>{day.mealCount}/5</Text>
                <Text style={styles.statLabel}>Meals</Text>
              </View>

              <View style={styles.statCard}>
                <Star size={24} color="#fff" fill={day.goalMet ? "#fff" : "transparent"} />
                <Text style={styles.statValue}>{day.goalMet ? "100" : Math.round((day.mealCount / 5) * 100)}</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.mealsSection}>
            <Text style={[styles.mealsSectionTitle, { color: colors.text }]}>Meals Today</Text>
            {day.meals.length > 0 ? (
              day.meals.map((meal: any, index: number) => (
                <View key={index} style={[styles.mealItem, { backgroundColor: colors.card }]}>
                  <View style={styles.mealIconContainer}>
                    <Flame size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealName, { color: colors.text }]}>
                      {meal.meal_name || meal.name || "Meal"}
                    </Text>
                    <Text style={[styles.mealCalories, { color: colors.textSecondary }]}>
                      {Math.round(meal.calories || 0)} kcal
                    </Text>
                  </View>
                  <View style={[styles.mealPeriodBadge, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.mealPeriodText, { color: colors.textSecondary }]}>
                      {meal.meal_period || "Meal"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noMealsText, { color: colors.textSecondary }]}>No meals logged yet</Text>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { meals, isLoading } = useSelector((state: RootState) => state.meal);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  const daysData = useMemo(() => {
    const grouped = meals.reduce((acc: any, meal: any) => {
      const date = meal.created_at ? meal.created_at.split("T")[0] : new Date().toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          meals: [],
          totalCalories: 0,
          goalMet: false,
          mealCount: 0,
        };
      }
      acc[date].meals.push(meal);
      acc[date].totalCalories += meal.calories || 0;
      acc[date].mealCount += 1;
      return acc;
    }, {});

    // Convert to array and sort by date (newest first)
    const days = Object.values(grouped).sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ) as DayData[];

    // Determine if goal is met (3+ meals or 1500+ calories)
    days.forEach((day: DayData) => {
      day.goalMet = day.mealCount >= 3 || day.totalCalories >= 1500;
    });

    // Add empty days if needed (show at least 7 days)
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (!days.find(d => d.date === dateStr)) {
        days.push({
          date: dateStr,
          meals: [],
          totalCalories: 0,
          goalMet: false,
          mealCount: 0,
        });
      }
    }

    return days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meals]);

  const handleDayPress = (day: DayData) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMeals());
    setRefreshing(false);
  }, [dispatch]);

  const streak = useMemo(() => {
    let count = 0;
    for (const day of daysData) {
      if (day.goalMet) count++;
      else break;
    }
    return count;
  }, [daysData]);

  if (isLoading && !meals.length) {
    return <LoadingScreen text="Loading your journey..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#10B981", "#059669", "#047857"]} style={styles.header}>
        <Text style={styles.headerTitle}>Your Journey</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Flame size={20} color="#fff" />
            <Text style={styles.headerStatText}>{streak} day streak</Text>
          </View>
          <View style={styles.headerStat}>
            <Trophy size={20} color="#fff" />
            <Text style={styles.headerStatText}>{daysData.filter(d => d.goalMet).length} goals</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <Text style={{ padding: 20, textAlign: "center" }}>Pull to refresh</Text>
        }
      >
        <View style={styles.path}>
          {daysData.map((day, index) => (
            <DayCircle key={day.date} day={day} onPress={() => handleDayPress(day)} index={index} />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <DayDetailModal visible={showModal} day={selectedDay} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: "row",
    gap: 16,
  },
  headerStat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  headerStatText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 100,
  },
  path: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dayContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  pathLine: {
    width: 4,
    height: 40,
    backgroundColor: "#E5E7EB",
    position: "absolute",
    top: -40,
    borderRadius: 2,
  },
  circleContainer: {
    position: "relative",
    marginBottom: 12,
  },
  dayCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dayNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  mealDot: {
    position: "absolute",
    width: MEAL_DOT_SIZE,
    height: MEAL_DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  mealDotInner: {
    width: MEAL_DOT_SIZE,
    height: MEAL_DOT_SIZE,
    borderRadius: MEAL_DOT_SIZE / 2,
    borderWidth: 2,
  },
  todayBadge: {
    position: "absolute",
    bottom: -24,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  speechBubblePointer: {
    position: "absolute",
    top: -10,
    left: width / 2 - 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#10B981",
  },
  modalGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalDate: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    marginTop: 4,
  },
  mealsSection: {
    padding: 24,
  },
  mealsSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: "600",
  },
  mealPeriodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mealPeriodText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noMealsText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 32,
  },
  closeButton: {
    backgroundColor: "#10B981",
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomPadding: {
    height: 100,
  },
});
