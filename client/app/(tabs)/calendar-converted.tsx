import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import { fetchCalendarData, getStatistics } from "@/src/store/calendarSlice";
import { ChevronLeft, ChevronRight, Target, TrendingUp, CheckCircle, Flame } from "lucide-react-native";
import { PageTemplate } from "@/components/PageTemplate";
import { colors as themeColors, spacing, borderRadius, typography } from "@/constants/theme";
import LoadingScreen from "@/components/LoadingScreen";

interface DayData {
  date: string;
  calories_goal: number;
  calories_actual: number;
  protein_goal: number;
  protein_actual: number;
  meal_count: number;
  water_intake_ml: number;
}

export default function CalendarScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { calendarData, isLoading } = useSelector((state: RootState) => state.calendar);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    await dispatch(fetchCalendarData({ year, month }));
    await dispatch(getStatistics({ year, month }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = calendarData[dateStr] || {
        date: dateStr,
        calories_goal: 2000,
        calories_actual: 0,
        protein_goal: 150,
        protein_actual: 0,
        meal_count: 0,
        water_intake_ml: 0,
      };
      days.push(dayData);
    }

    return days;
  };

  const getProgressColor = (actual: number, goal: number) => {
    const percentage = (actual / goal) * 100;
    if (percentage >= 100) return themeColors.success[500];
    if (percentage >= 70) return themeColors.warning[500];
    return themeColors.neutral[300];
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDayPress = (dayData: DayData) => {
    setSelectedDay(dayData);
    setShowDayModal(true);
  };

  const days = getDaysInMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const sections = [
    {
      type: "custom" as const,
      data: {
        component: (
          <View>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                <ChevronLeft size={24} color={themeColors.primary[600]} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                <ChevronRight size={24} color={themeColors.primary[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendar}>
              <View style={styles.dayNamesRow}>
                {dayNames.map((name, index) => (
                  <Text key={index} style={styles.dayName}>
                    {name}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {days.map((day, index) => {
                  if (!day) {
                    return <View key={`empty-${index}`} style={styles.emptyDay} />;
                  }

                  const dayNumber = parseInt(day.date.split("-")[2]);
                  const progress = (day.calories_actual / day.calories_goal) * 100;
                  const color = getProgressColor(day.calories_actual, day.calories_goal);

                  return (
                    <TouchableOpacity
                      key={day.date}
                      style={[styles.dayCell, { borderColor: color }]}
                      onPress={() => handleDayPress(day)}
                    >
                      <Text style={styles.dayNumber}>{dayNumber}</Text>
                      {day.meal_count > 0 && (
                        <View style={[styles.progressBar, { backgroundColor: color, width: `${Math.min(progress, 100)}%` }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ),
      },
    },
  ];

  if (isLoading && !Object.keys(calendarData).length) {
    return <LoadingScreen text="Loading calendar..." />;
  }

  return (
    <>
      <PageTemplate
        pageName="calendar"
        title="Goal Calendar"
        subtitle="Track your daily progress"
        headerIcon="calendar"
        sections={sections}
        refreshing={refreshing}
        onRefresh={onRefresh}
        headerGradient={[themeColors.primary[500], themeColors.primary[600], themeColors.primary[700]]}
      />

      <Modal visible={showDayModal} animationType="slide" transparent onRequestClose={() => setShowDayModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedDay && (
              <>
                <Text style={styles.modalTitle}>Day Details</Text>
                <Text style={styles.modalDate}>{new Date(selectedDay.date).toLocaleDateString()}</Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Flame size={24} color={themeColors.error[500]} />
                    <Text style={styles.modalStatValue}>{selectedDay.calories_actual}</Text>
                    <Text style={styles.modalStatLabel}>/ {selectedDay.calories_goal} kcal</Text>
                  </View>

                  <View style={styles.modalStat}>
                    <TrendingUp size={24} color={themeColors.charts.protein} />
                    <Text style={styles.modalStatValue}>{selectedDay.protein_actual}</Text>
                    <Text style={styles.modalStatLabel}>/ {selectedDay.protein_goal}g protein</Text>
                  </View>

                  <View style={styles.modalStat}>
                    <Target size={24} color={themeColors.primary[500]} />
                    <Text style={styles.modalStatValue}>{selectedDay.meal_count}</Text>
                    <Text style={styles.modalStatLabel}>meals logged</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setShowDayModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  navButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[600],
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: spacing.xs,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.neutral[900],
  },
  progressBar: {
    height: 3,
    position: "absolute",
    bottom: 2,
    left: 2,
    borderRadius: borderRadius.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "85%",
  },
  modalTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
    marginBottom: spacing.sm,
  },
  modalDate: {
    fontSize: typography.fontSize.base,
    color: themeColors.neutral[600],
    marginBottom: spacing.xl,
  },
  modalStats: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  modalStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.neutral[900],
  },
  modalStatLabel: {
    fontSize: typography.fontSize.sm,
    color: themeColors.neutral[600],
  },
  closeButton: {
    backgroundColor: themeColors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
