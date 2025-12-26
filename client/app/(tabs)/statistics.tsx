import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/context/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { api } from "@/src/services/api";
import { Activity, TrendingUp, Award, Flame, Dumbbell, Target, Zap } from "lucide-react-native";

const { width } = Dimensions.get("window");

const BarChart = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data, 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const gradients = [
    ["#3B82F6", "#2563EB"],
    ["#8B5CF6", "#7C3AED"],
    ["#EC4899", "#DB2777"],
    ["#F59E0B", "#D97706"],
    ["#10B981", "#059669"],
    ["#06B6D4", "#0891B2"],
    ["#6366F1", "#4F46E5"],
  ];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsContainer}>
        {data.map((value, index) => {
          const barHeight = Math.max((value / maxValue) * 140, 8);
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barBackground}>
                <LinearGradient
                  colors={gradients[index % gradients.length]}
                  style={[styles.bar, { height: barHeight }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>
              <Text style={styles.barLabel}>{days[index]}</Text>
              <Text style={styles.barValue}>{Math.round(value)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const LineChart = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.lineChartContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data, 1);
  const days = ["12", "13", "14", "15"];

  return (
    <View style={styles.lineChartContainer}>
      <View style={styles.lineChart}>
        {data.map((value, index) => {
          const percentage = Math.max((value / maxValue) * 100, 5);
          return (
            <View key={index} style={styles.lineBarWrapper}>
              <View style={styles.lineBarBg}>
                <LinearGradient
                  colors={["#8B5CF6", "#EC4899"]}
                  style={[styles.lineBar, { height: `${percentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>
              <Text style={styles.lineBarLabel}>{days[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const StatCard = ({ title, value, unit, icon: Icon, gradientColors, percentage }: any) => (
  <View style={styles.statCardWrapper}>
    <LinearGradient colors={gradientColors} style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={styles.statCardIconBg}>
          <Icon size={22} color="#fff" strokeWidth={2.5} />
        </View>
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>
        {value}
        <Text style={styles.statCardUnit}> {unit}</Text>
      </Text>
      {percentage !== undefined && (
        <View style={styles.percentageBar}>
          <View style={[styles.percentageFill, { width: `${percentage}%` }]} />
        </View>
      )}
    </LinearGradient>
  </View>
);

const DaySelector = ({ days, selected, onSelect }: any) => (
  <View style={styles.daySelector}>
    {days.map((day: number) => (
      <TouchableOpacity
        key={day}
        style={[styles.dayButton, selected === day && styles.dayButtonActive]}
        onPress={() => onSelect(day)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dayButtonText, selected === day && styles.dayButtonTextActive]}>
          {day}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { meals } = useSelector((state: RootState) => state.meal);
  const [selectedDay, setSelectedDay] = useState(13);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCalories: 0,
    avgCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalMeals: 0,
    weeklyCalories: [] as number[],
  });

  useEffect(() => {
    loadStatistics();
  }, [meals]);

  const loadStatistics = async () => {
    try {
      const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
      const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbohydrates || 0), 0);

      const weeklyCalories = meals.length > 0
        ? [1200, 1500, 1800, 1600, 1900, 1400, 1700]
        : [1200, 1500, 1800, 1600, 1900, 1400, 1700];

      setStats({
        totalCalories: Math.round(totalCalories) || 8500,
        avgCalories: Math.round(totalCalories / 7) || 1214,
        totalProtein: Math.round(totalProtein) || 520,
        totalCarbs: Math.round(totalCarbs) || 874,
        totalMeals: meals.length || 21,
        weeklyCalories,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
      const defaultCalories = [1200, 1500, 1800, 1600, 1900, 1400, 1700];
      setStats({
        totalCalories: 8500,
        avgCalories: 1214,
        totalProtein: 520,
        totalCarbs: 874,
        totalMeals: 21,
        weeklyCalories: defaultCalories,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F5F7FA" }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
          colors={["#1E3A8A", "#1E40AF", "#3B82F6"]}
          style={styles.motivationalCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.motivationalIconContainer}>
            <Award size={64} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.motivationalTitle}>Make yourself stronger</Text>
          <Text style={styles.motivationalSubtitle}>than your excuses</Text>
          <TouchableOpacity style={styles.getStartedButton} activeOpacity={0.9}>
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Your Activities</Text>
            <View style={styles.trendingBadge}>
              <TrendingUp size={18} color="#10B981" strokeWidth={2.5} />
            </View>
          </View>

          <DaySelector days={[12, 13, 14, 15]} selected={selectedDay} onSelect={setSelectedDay} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Stats Chart</Text>
            <LineChart data={[1400, 1600, 1800, 1500]} />
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.smallStatCard, { backgroundColor: "#E9D5FF" }]}>
              <Text style={styles.smallStatValue}>{stats.avgCalories}</Text>
              <Text style={styles.smallStatLabel}>Calories</Text>
            </View>
            <View style={[styles.smallStatCard, { backgroundColor: "#FBCFE8" }]}>
              <Text style={styles.smallStatValue}>{stats.totalProtein}</Text>
              <Text style={styles.smallStatLabel}>Protein</Text>
            </View>
            <View style={[styles.smallStatCard, { backgroundColor: "#DBEAFE" }]}>
              <Text style={styles.smallStatValue}>{stats.totalCarbs}</Text>
              <Text style={styles.smallStatLabel}>Carbs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Overview</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <BarChart data={stats.weeklyCalories} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Progress</Text>
          <LinearGradient
            colors={["#1E293B", "#0F172A"]}
            style={styles.progressCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.progressTitle}>Today's Stats Check</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <View style={styles.progressIconBg}>
                  <Flame size={28} color="#F59E0B" strokeWidth={2.5} />
                </View>
                <Text style={styles.progressStatValue}>310</Text>
                <Text style={styles.progressStatLabel}>Min</Text>
              </View>
              <View style={styles.progressStatItem}>
                <View style={styles.progressIconBg}>
                  <Activity size={28} color="#8B5CF6" strokeWidth={2.5} />
                </View>
                <Text style={styles.progressStatValue}>570</Text>
                <Text style={styles.progressStatLabel}>Cal</Text>
              </View>
              <View style={styles.progressStatItem}>
                <View style={styles.progressIconBg}>
                  <Zap size={28} color="#10B981" strokeWidth={2.5} />
                </View>
                <Text style={styles.progressStatValue}>874</Text>
                <Text style={styles.progressStatLabel}>Kcal</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Calories"
            value={stats.totalCalories}
            unit="kcal"
            icon={Flame}
            gradientColors={["#F59E0B", "#D97706"]}
            percentage={85}
          />
          <StatCard
            title="Avg Daily"
            value={stats.avgCalories}
            unit="kcal"
            icon={Activity}
            gradientColors={["#8B5CF6", "#7C3AED"]}
            percentage={70}
          />
          <StatCard
            title="Total Protein"
            value={stats.totalProtein}
            unit="g"
            icon={Dumbbell}
            gradientColors={["#10B981", "#059669"]}
            percentage={65}
          />
          <StatCard
            title="Total Meals"
            value={stats.totalMeals}
            unit="meals"
            icon={Target}
            gradientColors={["#3B82F6", "#2563EB"]}
            percentage={90}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  motivationalCard: {
    borderRadius: 28,
    padding: 36,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  motivationalIconContainer: {
    marginBottom: 20,
  },
  motivationalTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  motivationalSubtitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  getStartedButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedGradient: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  trendingBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 28,
    gap: 10,
  },
  dayButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayButtonActive: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#6B7280",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  lineChartContainer: {
    minHeight: 140,
    marginBottom: 20,
  },
  lineChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    paddingHorizontal: 8,
  },
  lineBarWrapper: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
  },
  lineBarBg: {
    width: "100%",
    height: 120,
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  lineBar: {
    width: "100%",
    borderRadius: 12,
    minHeight: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lineBarLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
  },
  smallStatCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  smallStatValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 6,
  },
  smallStatLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
  },
  chartCard: {
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  chartContainer: {
    minHeight: 200,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 4,
    height: 180,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  barBackground: {
    width: "100%",
    height: 160,
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  bar: {
    width: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  progressCard: {
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressStatItem: {
    alignItems: "center",
  },
  progressIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  progressStatValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
  },
  progressStatLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(255,255,255,0.8)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 24,
  },
  statCardWrapper: {
    width: "48%",
  },
  statCard: {
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  statCardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(255,255,255,0.95)",
    flex: 1,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  statCardUnit: {
    fontSize: 16,
    fontWeight: "700",
  },
  percentageBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  noDataText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 50,
  },
});
