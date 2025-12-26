import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import { fetchMeals } from "@/src/store/mealSlice";
import { Check, X, BookOpen, Trophy, Star, Flame, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

const { width, height } = Dimensions.get("window");
const CIRCLE_SIZE = 100;
const SEGMENT_SIZE = 16;

interface DayData {
  date: string;
  meals: any[];
  totalCalories: number;
  goalMet: boolean;
  mealCount: number;
  daysPast: number;
}

const MealSegment = ({ meal, angle }: { meal: any; angle: number }) => {
  const radius = CIRCLE_SIZE / 2 + 10;
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;

  const initial = meal?.meal_name?.charAt(0)?.toUpperCase() || meal?.name?.charAt(0)?.toUpperCase() || "M";

  return (
    <View
      style={[
        styles.mealSegment,
        {
          left: CIRCLE_SIZE / 2 + x - SEGMENT_SIZE / 2,
          top: CIRCLE_SIZE / 2 + y - SEGMENT_SIZE / 2,
        },
      ]}
    >
      <Text style={styles.mealInitial}>{initial}</Text>
    </View>
  );
};

const EmptySegment = ({ angle }: { angle: number }) => {
  const radius = CIRCLE_SIZE / 2 + 10;
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;

  return (
    <View
      style={[
        styles.emptySegment,
        {
          left: CIRCLE_SIZE / 2 + x - SEGMENT_SIZE / 2,
          top: CIRCLE_SIZE / 2 + y - SEGMENT_SIZE / 2,
        },
      ]}
    />
  );
};

const PathLine = ({ fromPosition, toPosition }: { fromPosition: "left" | "center" | "right"; toPosition: "left" | "center" | "right" }) => {
  if (fromPosition === toPosition) {
    return <View style={styles.straightLine} />;
  }

  const isLeftToCenter = fromPosition === "left" && toPosition === "center";
  const isCenterToRight = fromPosition === "center" && toPosition === "right";
  const isRightToCenter = fromPosition === "right" && toPosition === "center";
  const isCenterToLeft = fromPosition === "center" && toPosition === "left";

  let lineStyle = styles.diagonalLineRight;
  if (isLeftToCenter || isCenterToLeft) {
    lineStyle = styles.diagonalLineRight;
  } else if (isCenterToRight || isRightToCenter) {
    lineStyle = styles.diagonalLineLeft;
  }

  return <View style={[styles.pathLine, lineStyle]} />;
};

const DayCircle = ({ day, position, index }: { day: DayData; position: "left" | "center" | "right"; index: number }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);
  const isPast = dayDate < today;
  const isToday = dayDate.getTime() === today.getTime();

  let circleColor = "#E5E7EB";
  let borderColor = "#D1D5DB";

  if (day.goalMet) {
    circleColor = "#58CC02";
    borderColor = "#47A302";
  } else if (day.mealCount > 0) {
    circleColor = "#FFA500";
    borderColor = "#FF8C00";
  } else if (isPast && !isToday) {
    circleColor = "#FF4B4B";
    borderColor = "#E03E3E";
  }

  const segmentAngles = [-90, 0, 90, 180, 45];

  return (
    <View style={styles.circleWrapper}>
      <View
        style={[
          styles.circleShadow,
          { backgroundColor: circleColor, opacity: 0.25 },
        ]}
      />

      <View
        style={[
          styles.circle,
          { backgroundColor: circleColor, borderColor: borderColor },
        ]}
      >
        {day.goalMet ? (
          <Check size={44} color="#fff" strokeWidth={4} />
        ) : (
          <Text style={styles.dayNumber}>
            {new Date(day.date).getDate()}
          </Text>
        )}
      </View>

      {segmentAngles.map((angle, i) =>
        i < day.mealCount && day.meals[i] ? (
          <MealSegment key={i} meal={day.meals[i]} angle={angle} />
        ) : (
          <EmptySegment key={i} angle={angle} />
        )
      )}

      {isToday && (
        <View style={styles.todayBadge}>
          <Text style={styles.todayText}>TODAY</Text>
        </View>
      )}
    </View>
  );
};

const ChestRewardModal = ({ visible, onClose, xpEarned }: { visible: boolean; onClose: () => void; xpEarned: number }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [sparkleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      sparkleAnim.setValue(0);
    }
  }, [visible]);

  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.rewardOverlay}>
        <Animated.View
          style={[
            styles.rewardContent,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: sparkleRotate }] }}>
            <LinearGradient
              colors={["#FFD700", "#FFA500", "#FF8C00"]}
              style={styles.chestContainer}
            >
              <Trophy size={80} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.rewardTitle}>Goal Achieved!</Text>
          <View style={styles.xpBadge}>
            <Star size={28} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rewardXP}>+{xpEarned} XP</Text>
          </View>

          <TouchableOpacity style={styles.rewardButton} onPress={onClose}>
            <LinearGradient
              colors={["#58CC02", "#47A302"]}
              style={styles.rewardButtonGradient}
            >
              <Text style={styles.rewardButtonText}>Claim Reward</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const DayDetailModal = ({ visible, day, onClose }: { visible: boolean; day: DayData | null; onClose: () => void }) => {
  const { colors } = useTheme();

  if (!day) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {new Date(day.date).toLocaleDateString("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {day.goalMet && (
                <View style={styles.completeBadge}>
                  <Check size={16} color="#fff" strokeWidth={3} />
                  <Text style={styles.completeBadgeText}>Complete</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalStats}>
            <View style={styles.modalStatItem}>
              <LinearGradient colors={["#FF6B6B", "#FF5252"]} style={styles.statIconContainer}>
                <Flame size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.totalCalories}
              </Text>
              <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                Calories
              </Text>
            </View>
            <View style={styles.modalStatItem}>
              <LinearGradient colors={["#58CC02", "#47A302"]} style={styles.statIconContainer}>
                <Trophy size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.mealCount}/5
              </Text>
              <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                Meals
              </Text>
            </View>
            <View style={styles.modalStatItem}>
              <LinearGradient colors={["#FFA500", "#FF8C00"]} style={styles.statIconContainer}>
                <TrendingUp size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.goalMet ? "100" : Math.round((day.mealCount / 5) * 100)}%
              </Text>
              <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                Progress
              </Text>
            </View>
          </View>

          <ScrollView style={styles.mealsList} showsVerticalScrollIndicator={false}>
            {day.meals.length > 0 ? (
              day.meals.map((meal: any, idx: number) => (
                <View key={idx} style={[styles.mealCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.mealCardHeader}>
                    <LinearGradient
                      colors={["#58CC02", "#47A302"]}
                      style={styles.mealInitialBig}
                    >
                      <Text style={styles.mealInitialBigText}>
                        {meal.meal_name?.charAt(0)?.toUpperCase() || meal.name?.charAt(0)?.toUpperCase() || "M"}
                      </Text>
                    </LinearGradient>
                    <View style={styles.mealCardInfo}>
                      <Text style={[styles.mealName, { color: colors.text }]}>
                        {meal.meal_name || meal.name || "Meal"}
                      </Text>
                      <Text style={[styles.mealDetail, { color: colors.textSecondary }]}>
                        {Math.round(meal.calories || 0)} kcal • {meal.meal_period || "Meal"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noMealsContainer}>
                <BookOpen size={56} color={colors.textSecondary} opacity={0.5} />
                <Text style={[styles.noMeals, { color: colors.textSecondary }]}>
                  No meals logged yet
                </Text>
                <Text style={[styles.noMealsHint, { color: colors.textSecondary }]}>
                  Tap the camera icon to add your first meal
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <LinearGradient
              colors={["#58CC02", "#47A302"]}
              style={styles.closeBtnGradient}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function HistoryScreen() {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { meals, isLoading } = useSelector((state: RootState) => state.meal);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showChestModal, setShowChestModal] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  const daysData = useMemo(() => {
    const grouped: Record<string, DayData> = {};

    meals.forEach((meal: any) => {
      const date = meal.created_at
        ? meal.created_at.split("T")[0]
        : new Date().toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = {
          date,
          meals: [],
          totalCalories: 0,
          goalMet: false,
          mealCount: 0,
          daysPast: 0,
        };
      }
      grouped[date].meals.push(meal);
      grouped[date].totalCalories += meal.calories || 0;
      grouped[date].mealCount += 1;
    });

    let days = Object.values(grouped);

    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (!days.find((day) => day.date === dateStr)) {
        days.push({
          date: dateStr,
          meals: [],
          totalCalories: 0,
          goalMet: false,
          mealCount: 0,
          daysPast: i,
        });
      }
    }

    days = days.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    days.forEach((day) => {
      day.goalMet = day.mealCount >= 5;
    });

    return days;
  }, [meals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMeals());
    setRefreshing(false);
  }, [dispatch]);

  const handleDayPress = (day: DayData) => {
    setSelectedDay(day);
    setModalVisible(true);

    if (day.goalMet && Math.random() > 0.5) {
      setTimeout(() => {
        setXpEarned(Math.floor(Math.random() * 50) + 50);
        setShowChestModal(true);
      }, 300);
    }
  };

  const streak = useMemo(() => {
    let count = 0;
    for (const day of daysData) {
      if (day.goalMet) count++;
      else break;
    }
    return count;
  }, [daysData]);

  const totalGoals = useMemo(() => {
    return daysData.filter((d) => d.goalMet).length;
  }, [daysData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F8F9FA" }]}>
      <LinearGradient
        colors={["#58CC02", "#47A302"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Journey</Text>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Flame size={20} color="#FFD700" />
            <Text style={styles.statBadgeText}>{streak} Day Streak</Text>
          </View>
          <View style={styles.statBadge}>
            <Trophy size={20} color="#FFD700" />
            <Text style={styles.statBadgeText}>{totalGoals} Goals</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {daysData.map((day, index) => {
          const position = index % 3 === 0 ? "left" : index % 3 === 1 ? "center" : "right";
          const nextPosition = (index + 1) % 3 === 0 ? "left" : (index + 1) % 3 === 1 ? "center" : "right";

          return (
            <View key={day.date} style={styles.dayItemContainer}>
              <TouchableOpacity
                onPress={() => handleDayPress(day)}
                activeOpacity={0.8}
                style={[
                  styles.dayContainer,
                  position === "left" && styles.dayContainerLeft,
                  position === "center" && styles.dayContainerCenter,
                  position === "right" && styles.dayContainerRight,
                ]}
              >
                <DayCircle day={day} position={position} index={index} />
                <Text style={styles.dateLabel}>
                  {new Date(day.date).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              {index < daysData.length - 1 && (
                <View
                  style={[
                    styles.pathLineContainer,
                    position === "left" && styles.pathLineLeft,
                    position === "center" && styles.pathLineCenter,
                    position === "right" && styles.pathLineRight,
                  ]}
                >
                  <PathLine fromPosition={position} toPosition={nextPosition} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <DayDetailModal
        visible={modalVisible}
        day={selectedDay}
        onClose={() => setModalVisible(false)}
      />

      <ChestRewardModal
        visible={showChestModal}
        onClose={() => setShowChestModal(false)}
        xpEarned={xpEarned}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  statBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 140,
  },
  dayItemContainer: {
    marginBottom: 16,
  },
  dayContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dayContainerLeft: {
    alignItems: "flex-start",
    paddingLeft: 50,
  },
  dayContainerCenter: {
    alignItems: "center",
  },
  dayContainerRight: {
    alignItems: "flex-end",
    paddingRight: 50,
  },
  circleWrapper: {
    position: "relative",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  circleShadow: {
    position: "absolute",
    bottom: -5,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dayNumber: {
    fontSize: 38,
    fontWeight: "900",
    color: "#fff",
  },
  mealSegment: {
    position: "absolute",
    width: SEGMENT_SIZE,
    height: SEGMENT_SIZE,
    borderRadius: SEGMENT_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#58CC02",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mealInitial: {
    fontSize: 9,
    fontWeight: "900",
    color: "#fff",
  },
  emptySegment: {
    position: "absolute",
    width: SEGMENT_SIZE,
    height: SEGMENT_SIZE,
    borderRadius: SEGMENT_SIZE / 2,
    backgroundColor: "#E5E7EB",
    borderWidth: 3,
    borderColor: "#D1D5DB",
  },
  todayBadge: {
    position: "absolute",
    bottom: -24,
    backgroundColor: "#58CC02",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  todayText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
  },
  pathLineContainer: {
    height: 50,
    justifyContent: "center",
  },
  pathLineLeft: {
    marginLeft: 50 + CIRCLE_SIZE / 2,
  },
  pathLineCenter: {
    alignSelf: "center",
  },
  pathLineRight: {
    marginRight: 50 + CIRCLE_SIZE / 2,
    alignSelf: "flex-end",
  },
  pathLine: {
    width: 4,
    height: 50,
    backgroundColor: "#D1D5DB",
  },
  straightLine: {
    width: 4,
    height: 50,
    backgroundColor: "#D1D5DB",
  },
  diagonalLineRight: {
    width: 4,
    height: 60,
    backgroundColor: "#D1D5DB",
    transform: [{ rotate: "25deg" }],
  },
  diagonalLineLeft: {
    width: 4,
    height: 60,
    backgroundColor: "#D1D5DB",
    transform: [{ rotate: "-25deg" }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.8,
    paddingTop: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  modalTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  completeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#58CC02",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 4,
  },
  completeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  closeButton: {
    padding: 4,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  modalStatItem: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  modalStatValue: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  mealsList: {
    paddingHorizontal: 24,
    maxHeight: height * 0.4,
  },
  mealCard: {
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mealCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  mealInitialBig: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mealInitialBigText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },
  mealCardInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  mealDetail: {
    fontSize: 15,
    fontWeight: "600",
  },
  noMealsContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noMeals: {
    fontSize: 19,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  noMealsHint: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.7,
  },
  closeBtn: {
    margin: 24,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  closeBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  rewardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardContent: {
    alignItems: "center",
    padding: 24,
  },
  chestContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  rewardTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 20,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 36,
    gap: 12,
  },
  rewardXP: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFD700",
  },
  rewardButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  rewardButtonGradient: {
    paddingHorizontal: 56,
    paddingVertical: 18,
  },
  rewardButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
  },
});
