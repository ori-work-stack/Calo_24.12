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
import { CheckCircle, X, BookOpen, Trophy, Star } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

const { width, height } = Dimensions.get("window");
const CIRCLE_SIZE = 110;
const SEGMENT_SIZE = 18;

interface DayData {
  date: string;
  meals: any[];
  totalCalories: number;
  goalMet: boolean;
  mealCount: number;
  daysPast: number;
}

const MealSegment = ({ meal, index, totalMeals }: any) => {
  const angle = (index / 5) * 360 - 90;
  const radius = CIRCLE_SIZE / 2 + 12;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  const initial = meal?.meal_name?.charAt(0)?.toUpperCase() || "M";
  const color = "#00CED1";

  return (
    <View
      style={[
        styles.mealSegment,
        {
          left: CIRCLE_SIZE / 2 + x - SEGMENT_SIZE / 2,
          top: CIRCLE_SIZE / 2 + y - SEGMENT_SIZE / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={styles.mealInitial}>{initial}</Text>
    </View>
  );
};

const EmptySegment = ({ index }: any) => {
  const angle = (index / 5) * 360 - 90;
  const radius = CIRCLE_SIZE / 2 + 12;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

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

const DayCircle = ({ day, onPress, position }: any) => {
  const isLeft = position === "left";
  const isRight = position === "right";
  const isCenter = position === "center";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);
  const isPast = dayDate < today;
  const isToday = dayDate.getTime() === today.getTime();

  let circleColor = "#E0E0E0";
  let borderColor = "#D0D0D0";

  if (day.goalMet) {
    circleColor = "#00CED1";
    borderColor = "#00B8B8";
  } else if (day.mealCount > 0) {
    circleColor = "#FFA500";
    borderColor = "#FF8C00";
  } else if (isPast && !isToday) {
    circleColor = "#FF6B6B";
    borderColor = "#FF5252";
  }

  const containerStyle = isLeft
    ? styles.dayContainerLeft
    : isRight
    ? styles.dayContainerRight
    : styles.dayContainerCenter;

  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.circleWrapper}>
          <View
            style={[
              styles.circleShadow,
              { backgroundColor: circleColor, opacity: 0.3 },
            ]}
          />

          <View
            style={[
              styles.circle,
              { backgroundColor: circleColor, borderColor: borderColor },
            ]}
          >
            {day.goalMet ? (
              <CheckCircle size={48} color="#fff" strokeWidth={3} />
            ) : (
              <Text style={styles.dayNumber}>
                {new Date(day.date).getDate()}
              </Text>
            )}
          </View>

          {[...Array(5)].map((_, i) =>
            i < day.mealCount ? (
              <MealSegment
                key={i}
                meal={day.meals[i]}
                index={i}
                totalMeals={day.mealCount}
              />
            ) : (
              <EmptySegment key={i} index={i} />
            )
          )}

          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          )}
        </View>

        <Text style={styles.dateLabel}>
          {new Date(day.date).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ChestRewardModal = ({ visible, onClose, xpEarned }: any) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.rewardOverlay}>
        <Animated.View
          style={[
            styles.rewardContent,
            { transform: [{ scale: scaleAnim }, { rotate }] },
          ]}
        >
          <LinearGradient
            colors={["#FFD700", "#FFA500", "#FF8C00"]}
            style={styles.chestContainer}
          >
            <Trophy size={80} color="#fff" />
          </LinearGradient>

          <Text style={styles.rewardTitle}>Goal Achieved!</Text>
          <Text style={styles.rewardXP}>+{xpEarned} XP</Text>

          <TouchableOpacity style={styles.rewardButton} onPress={onClose}>
            <Text style={styles.rewardButtonText}>Claim Reward</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const DayDetailModal = ({ visible, day, onClose }: any) => {
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {new Date(day.date).toLocaleDateString("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalStats}>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.totalCalories}
              </Text>
              <Text
                style={[styles.modalStatLabel, { color: colors.textSecondary }]}
              >
                Calories
              </Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.mealCount}
              </Text>
              <Text
                style={[styles.modalStatLabel, { color: colors.textSecondary }]}
              >
                Meals
              </Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.goalMet ? "100" : Math.round((day.mealCount / 5) * 100)}%
              </Text>
              <Text
                style={[styles.modalStatLabel, { color: colors.textSecondary }]}
              >
                Progress
              </Text>
            </View>
          </View>

          <ScrollView style={styles.mealsList}>
            {day.meals.length > 0 ? (
              day.meals.map((meal: any, idx: number) => (
                <View
                  key={idx}
                  style={[styles.mealCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.mealCardHeader}>
                    <View
                      style={[
                        styles.mealInitialBig,
                        { backgroundColor: "#00CED1" },
                      ]}
                    >
                      <Text style={styles.mealInitialBigText}>
                        {meal.meal_name?.charAt(0)?.toUpperCase() || "M"}
                      </Text>
                    </View>
                    <View style={styles.mealCardInfo}>
                      <Text style={[styles.mealName, { color: colors.text }]}>
                        {meal.meal_name || meal.name || "Meal"}
                      </Text>
                      <Text
                        style={[
                          styles.mealDetail,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {Math.round(meal.calories || 0)} kcal •{" "}
                        {meal.meal_period || "Meal"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noMealsContainer}>
                <BookOpen size={48} color={colors.textSecondary} />
                <Text style={[styles.noMeals, { color: colors.textSecondary }]}>
                  No meals logged yet
                </Text>
                <Text
                  style={[
                    styles.noMealsHint,
                    { color: colors.textSecondary },
                  ]}
                >
                  Tap the camera icon to add your first meal
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
          >
            <LinearGradient
              colors={["#00CED1", "#00B8B8"]}
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

      if (day.goalMet && Math.random() > 0.7) {
        setTimeout(() => {
          setXpEarned(Math.floor(Math.random() * 50) + 50);
          setShowChestModal(true);
        }, 500);
      }
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
  };

  const streak = useMemo(() => {
    let count = 0;
    for (const day of daysData) {
      if (day.goalMet) count++;
      else break;
    }
    return count;
  }, [daysData]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={["#00CED1", "#00B8B8", "#009999"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Journey</Text>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Star size={18} color="#FFD700" fill="#FFD700" />
            <Text style={styles.statBadgeText}>{streak} Day Streak</Text>
          </View>
          <View style={styles.statBadge}>
            <Trophy size={18} color="#FFD700" />
            <Text style={styles.statBadgeText}>
              {daysData.filter((d) => d.goalMet).length} Goals
            </Text>
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
          let position = "center";
          if (index % 3 === 0) position = "left";
          if (index % 3 === 1) position = "center";
          if (index % 3 === 2) position = "right";

          return (
            <React.Fragment key={day.date}>
              <DayCircle
                day={day}
                onPress={() => handleDayPress(day)}
                position={position}
              />
              {index < daysData.length - 1 && (
                <View
                  style={[
                    styles.pathConnector,
                    position === "left" && styles.pathConnectorLeft,
                    position === "center" && styles.pathConnectorCenter,
                    position === "right" && styles.pathConnectorRight,
                  ]}
                />
              )}
            </React.Fragment>
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
    gap: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 120,
  },
  dayContainerLeft: {
    alignItems: "flex-start",
    paddingLeft: 40,
    marginBottom: 20,
  },
  dayContainerCenter: {
    alignItems: "center",
    marginBottom: 20,
  },
  dayContainerRight: {
    alignItems: "flex-end",
    paddingRight: 40,
    marginBottom: 20,
  },
  circleWrapper: {
    position: "relative",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  circleShadow: {
    position: "absolute",
    bottom: -6,
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
    borderWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dayNumber: {
    fontSize: 36,
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
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mealInitial: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
  },
  emptySegment: {
    position: "absolute",
    width: SEGMENT_SIZE,
    height: SEGMENT_SIZE,
    borderRadius: SEGMENT_SIZE / 2,
    backgroundColor: "#F0F0F0",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  todayBadge: {
    position: "absolute",
    bottom: -20,
    backgroundColor: "#00CED1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  todayText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  pathConnector: {
    height: 40,
    width: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 10,
  },
  pathConnectorLeft: {
    marginLeft: 40 + CIRCLE_SIZE / 2 - 2,
    transform: [{ rotate: "30deg" }],
  },
  pathConnectorCenter: {
    alignSelf: "center",
  },
  pathConnectorRight: {
    marginRight: 40 + CIRCLE_SIZE / 2 - 2,
    alignSelf: "flex-end",
    transform: [{ rotate: "-30deg" }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.75,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  modalStatLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  mealsList: {
    paddingHorizontal: 24,
    maxHeight: height * 0.4,
  },
  mealCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  mealInitialBig: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mealInitialBigText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
  mealCardInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  mealDetail: {
    fontSize: 14,
    fontWeight: "600",
  },
  noMealsContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  noMeals: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  noMealsHint: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  closeBtn: {
    margin: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  closeBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  rewardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardContent: {
    alignItems: "center",
  },
  chestContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  rewardTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 12,
  },
  rewardXP: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFD700",
    marginBottom: 32,
  },
  rewardButton: {
    backgroundColor: "#00CED1",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
  },
  rewardButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
