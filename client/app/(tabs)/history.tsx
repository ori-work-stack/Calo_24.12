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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import { fetchMeals } from "@/src/store/mealSlice";
import { CheckCircle, X } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

const { width, height } = Dimensions.get("window");
const CIRCLE_SIZE = 100;

interface DayData {
  date: string;
  meals: any[];
  totalCalories: number;
  goalMet: boolean;
  mealCount: number;
}

const DayCircle = ({ day, onPress, isFirst }: any) => {
  const hasData = day.mealCount > 0;

  return (
    <View style={styles.dayContainer}>
      {!isFirst && <View style={styles.connector} />}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.circleWrapper}
      >
        <View style={[styles.circleShadow, hasData && styles.circleShadowActive]} />
        <View style={[styles.circle, hasData && styles.circleActive]}>
          {hasData ? (
            <CheckCircle size={50} color="#fff" strokeWidth={3} />
          ) : (
            <View style={styles.emptyCircle} />
          )}
        </View>

        {/* 5 small circles around */}
        <View style={[styles.miniCircle, styles.miniTop, hasData && day.mealCount >= 1 && styles.miniCircleFilled]} />
        <View style={[styles.miniCircle, styles.miniRight, hasData && day.mealCount >= 2 && styles.miniCircleFilled]} />
        <View style={[styles.miniCircle, styles.miniBottom, hasData && day.mealCount >= 3 && styles.miniCircleFilled]} />
        <View style={[styles.miniCircle, styles.miniLeft, hasData && day.mealCount >= 4 && styles.miniCircleFilled]} />
        <View style={[styles.miniCircle, styles.miniTopRight, hasData && day.mealCount >= 5 && styles.miniCircleFilled]} />
      </TouchableOpacity>

      <Text style={styles.dateLabel}>
        {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
      </Text>
    </View>
  );
};

const DetailModal = ({ visible, day, onClose }: any) => {
  const { colors } = useTheme();

  if (!day) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {new Date(day.date).toLocaleDateString("en", {
                weekday: "long",
                month: "long",
                day: "numeric"
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
              <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                Calories
              </Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatValue, { color: colors.text }]}>
                {day.mealCount}
              </Text>
              <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                Meals
              </Text>
            </View>
          </View>

          <ScrollView style={styles.mealsList}>
            {day.meals.length > 0 ? (
              day.meals.map((meal: any, idx: number) => (
                <View key={idx} style={[styles.mealCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.mealName, { color: colors.text }]}>
                    {meal.meal_name || meal.name || "Meal"}
                  </Text>
                  <Text style={[styles.mealDetail, { color: colors.textSecondary }]}>
                    {Math.round(meal.calories || 0)} kcal • {meal.meal_period || "Meal"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noMeals, { color: colors.textSecondary }]}>
                No meals logged
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: "#00CED1" }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Close</Text>
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

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  const daysData = useMemo(() => {
    const grouped: Record<string, DayData> = {};

    meals.forEach((meal: any) => {
      const date = meal.created_at ? meal.created_at.split("T")[0] : new Date().toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = {
          date,
          meals: [],
          totalCalories: 0,
          goalMet: false,
          mealCount: 0,
        };
      }
      grouped[date].meals.push(meal);
      grouped[date].totalCalories += meal.calories || 0;
      grouped[date].mealCount += 1;
    });

    let days = Object.values(grouped);

    // Add empty days for last 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (!days.find(day => day.date === dateStr)) {
        days.push({
          date: dateStr,
          meals: [],
          totalCalories: 0,
          goalMet: false,
          mealCount: 0,
        });
      }
    }

    days = days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    days.forEach(day => {
      day.goalMet = day.mealCount >= 3 || day.totalCalories >= 1500;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Journey</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {daysData.map((day, index) => (
          <DayCircle
            key={day.date}
            day={day}
            onPress={() => handleDayPress(day)}
            isFirst={index === 0}
          />
        ))}
      </ScrollView>

      <DetailModal
        visible={modalVisible}
        day={selectedDay}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
    alignItems: "center",
  },
  dayContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  connector: {
    width: 4,
    height: 50,
    backgroundColor: "#E0E0E0",
    position: "absolute",
    top: -50,
    zIndex: -1,
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
    bottom: -8,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#C0C0C0",
    opacity: 0.3,
  },
  circleShadowActive: {
    backgroundColor: "#009999",
    opacity: 0.4,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#D0D0D0",
  },
  circleActive: {
    backgroundColor: "#00CED1",
    borderColor: "#00B8B8",
  },
  emptyCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#B0B0B0",
  },
  miniCircle: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    borderWidth: 2,
    borderColor: "#D0D0D0",
  },
  miniCircleFilled: {
    backgroundColor: "#00CED1",
    borderColor: "#00B8B8",
  },
  miniTop: {
    top: 0,
    left: CIRCLE_SIZE / 2 - 8,
  },
  miniRight: {
    right: 0,
    top: CIRCLE_SIZE / 2 - 8,
  },
  miniBottom: {
    bottom: 0,
    left: CIRCLE_SIZE / 2 - 8,
  },
  miniLeft: {
    left: 0,
    top: CIRCLE_SIZE / 2 - 8,
  },
  miniTopRight: {
    top: 15,
    right: 15,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  modalStatLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  mealsList: {
    paddingHorizontal: 20,
    maxHeight: height * 0.4,
  },
  mealCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  mealDetail: {
    fontSize: 14,
    fontWeight: "500",
  },
  noMeals: {
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 40,
  },
  closeBtn: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
