import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/context/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { api } from "@/src/services/api";
import {
  Activity,
  TrendingUp,
  Award,
  Flame,
  Dumbbell,
  Target,
  Zap,
  Droplet,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

interface StatisticsData {
  level: number;
  currentXP: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  weeklyStreak: number;
  perfectDays: number;
  dailyGoalDays: number;
  totalDays: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  averageFiber: number;
  averageSugar: number;
  averageSodium: number;
  averageFluids: number;
  achievements: any[];
  dailyBreakdown: any[];
  successfulDays: number;
  averageCompletion: number;
  happyDays: number;
  highEnergyDays: number;
  satisfiedDays: number;
  averageMealQuality: number;
}

const BarChart = ({ data, label }: { data: number[]; label?: string }) => {
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
      {label && <Text style={styles.chartLabel}>{label}</Text>}
      <View style={styles.barsContainer}>
        {data.slice(0, 7).map((value, index) => {
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

const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  gradientColors,
  percentage,
}: any) => (
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
          <View style={[styles.percentageFill, { width: `${Math.min(percentage, 100)}%` }]} />
        </View>
      )}
    </LinearGradient>
  </View>
);

const DaySelector = ({ days, selected, onSelect }: any) => (
  <View style={styles.daySelector}>
    {days.map((day: string) => (
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
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("week");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log("📊 Fetching statistics...");
      const response = await api.get("/statistics", {
        params: { period: selectedPeriod },
        timeout: 30000,
      });

      console.log("📊 Statistics response:", response.data);

      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        throw new Error("Failed to load statistics");
      }
    } catch (error: any) {
      console.error("❌ Error loading statistics:", error);
      setError(error.message || "Failed to load statistics");
      Alert.alert("Error", "Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  }, [selectedPeriod]);

  const getWeeklyCalories = () => {
    if (!stats?.dailyBreakdown) return [0, 0, 0, 0, 0, 0, 0];

    const last7Days = stats.dailyBreakdown.slice(-7);
    return last7Days.map((day: any) => day.calories || 0);
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading statistics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStatistics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F5F7FA" }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
          colors={["#1E3A8A", "#1E40AF", "#3B82F6"]}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerIconContainer}>
            <Award size={48} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>
            Level {stats?.level || 1} • {stats?.currentXP || 0} XP
          </Text>
          <View style={styles.streakBadge}>
            <Flame size={20} color="#FFD700" />
            <Text style={styles.streakText}>{stats?.currentStreak || 0} Day Streak</Text>
          </View>
        </LinearGradient>

        <DaySelector
          days={["Today", "Week", "Month"]}
          selected={selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
          onSelect={(day: string) => setSelectedPeriod(day.toLowerCase() as any)}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Overview</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <BarChart data={getWeeklyCalories()} label="Daily Calories" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrition Averages</Text>
          <View style={styles.statsRow}>
            <View style={[styles.smallStatCard, { backgroundColor: "#E9D5FF" }]}>
              <Text style={styles.smallStatValue}>{stats?.averageCalories || 0}</Text>
              <Text style={styles.smallStatLabel}>Calories</Text>
            </View>
            <View style={[styles.smallStatCard, { backgroundColor: "#FBCFE8" }]}>
              <Text style={styles.smallStatValue}>{stats?.averageProtein || 0}g</Text>
              <Text style={styles.smallStatLabel}>Protein</Text>
            </View>
            <View style={[styles.smallStatCard, { backgroundColor: "#DBEAFE" }]}>
              <Text style={styles.smallStatValue}>{stats?.averageCarbs || 0}g</Text>
              <Text style={styles.smallStatLabel}>Carbs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievement Stats</Text>
          <LinearGradient
            colors={["#1E293B", "#0F172A"]}
            style={styles.progressCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.progressTitle}>Your Achievements</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <View style={styles.progressIconBg}>
                  <Flame size={28} color="#F59E0B" strokeWidth={2.5} />
                </View>
                <Text style={styles.progressStatValue}>{stats?.currentStreak || 0}</Text>
                <Text style={styles.progressStatLabel}>Days Streak</Text>
              </View>
              <View style={styles.progressStatItem}>
                <View style={styles.progressIconBg}>
                  <Target size={28} color="#8B5CF6" strokeWidth={2.5} />
                </View>
                <Text style={styles.progressStatValue}>{stats?.perfectDays || 0}</Text>
                <Text style={styles.progressStatLabel}>Perfect Days</Text>
              </View>
              <View style={styles.progressStatItem}>
                <View style={styles.progressIconBg}>
                  <Award size={28} color="#10B981" strokeWidth={2.5} />
                </View>
                <Text style={styles.progressStatValue}>{stats?.successfulDays || 0}</Text>
                <Text style={styles.progressStatLabel}>Goal Days</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Avg Calories"
            value={stats?.averageCalories || 0}
            unit="kcal"
            icon={Flame}
            gradientColors={["#F59E0B", "#D97706"]}
            percentage={Math.round(((stats?.averageCalories || 0) / 2000) * 100)}
          />
          <StatCard
            title="Avg Protein"
            value={stats?.averageProtein || 0}
            unit="g"
            icon={Dumbbell}
            gradientColors={["#10B981", "#059669"]}
            percentage={Math.round(((stats?.averageProtein || 0) / 150) * 100)}
          />
          <StatCard
            title="Avg Hydration"
            value={Math.round((stats?.averageFluids || 0) / 250)}
            unit="cups"
            icon={Droplet}
            gradientColors={["#06B6D4", "#0891B2"]}
            percentage={Math.round(((stats?.averageFluids || 0) / 2500) * 100)}
          />
          <StatCard
            title="Total Days"
            value={stats?.totalDays || 0}
            unit="days"
            icon={Calendar}
            gradientColors={["#3B82F6", "#2563EB"]}
            percentage={100}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  headerCard: {
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
  headerIconContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
  },
  streakText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
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
    fontSize: 16,
    fontWeight: "900",
    color: "#6B7280",
  },
  dayButtonTextActive: {
    color: "#fff",
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
  chartLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 6,
  },
  smallStatLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
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
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
  },
  progressStatLabel: {
    fontSize: 13,
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
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  statCardUnit: {
    fontSize: 15,
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
