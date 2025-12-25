import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { Flame, TrendingUp, Award, Activity, Target, Dumbbell, Calendar, Zap } from "lucide-react-native";
import { api } from "@/src/services/api";
import LoadingScreen from "@/components/LoadingScreen";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 200;

interface WeeklyData {
  day: string;
  calories: number;
  protein: number;
  meals: number;
}

const WeeklyChart = ({ data }: { data: WeeklyData[] }) => {
  const maxCalories = Math.max(...data.map(d => d.calories || 0)) || 2000;
  const padding = 40;
  const chartWidth = CHART_WIDTH - padding * 2;
  const chartHeight = CHART_HEIGHT - padding * 2;

  const points = data.map((item, index) => {
    const x = padding + (index * chartWidth) / (data.length - 1 || 1);
    const y = padding + chartHeight - ((item.calories || 0) / maxCalories) * chartHeight;
    return { x, y };
  });

  const pathData = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding + chartHeight * ratio;
        return (
          <Line key={i} x1={padding} y1={y} x2={CHART_WIDTH - padding} y2={y} stroke="#374151" strokeWidth={1} opacity={0.2} />
        );
      })}

      {/* Gradient fill */}
      <Path
        d={`${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`}
        fill="url(#gradient)"
        opacity={0.3}
      />

      {/* Line */}
      <Path d={pathData} stroke="#8B5CF6" strokeWidth={3} fill="none" />

      {/* Points */}
      {points.map((point, i) => (
        <Circle key={i} cx={point.x} cy={point.y} r={5} fill="#8B5CF6" stroke="#fff" strokeWidth={2} />
      ))}

      {/* Day labels */}
      {data.map((item, i) => {
        const x = padding + (i * chartWidth) / (data.length - 1 || 1);
        return (
          <SvgText key={i} x={x} y={CHART_HEIGHT - 10} fontSize={12} fill="#9CA3AF" textAnchor="middle">
            {item.day}
          </SvgText>
        );
      })}
    </Svg>
  );
};

const StatCard = ({ title, value, unit, icon: Icon, gradient, subValue }: any) => (
  <View style={styles.statCardWrapper}>
    <LinearGradient colors={gradient} style={styles.statCardGradient}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <Icon size={20} color="#fff" />
      </View>
      <Text style={styles.statCardValue}>
        {value}
        <Text style={styles.statCardUnit}> {unit}</Text>
      </Text>
      {subValue && <Text style={styles.statCardSubValue}>{subValue}</Text>}
    </LinearGradient>
  </View>
);

const ActivityCard = ({ title, current, goal, icon: Icon, color }: any) => {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: color + "20" }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activityProgress}>
            {current} / {goal}
          </Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export default function StatisticsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [stats, setStats] = useState({
    totalCalories: 0,
    avgCalories: 0,
    totalProtein: 0,
    totalMeals: 0,
    streak: 0,
    weeklyGoal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await api.get("/statistics/weekly");
      if (response.data.success) {
        const data = response.data.data;

        // Generate weekly data for chart
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weekData = days.map(day => ({
          day,
          calories: Math.floor(Math.random() * 2000) + 1000, // Mock data
          protein: Math.floor(Math.random() * 100) + 50,
          meals: Math.floor(Math.random() * 5) + 1,
        }));

        setWeeklyData(weekData);
        setStats({
          totalCalories: data.totalCalories || 12500,
          avgCalories: data.avgCalories || 1785,
          totalProtein: data.totalProtein || 520,
          totalMeals: data.totalMeals || 21,
          streak: data.streak || 7,
          weeklyGoal: 85,
        });
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen text="Loading statistics..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.header}>
        <Text style={styles.headerTitle}>Your Activities</Text>
        <View style={styles.periodSelector}>
          {["Day", "Week", "Month"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period.toLowerCase() && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period.toLowerCase())}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === period.toLowerCase() && styles.periodButtonTextActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Weekly Stats Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartCardTitle}>Weekly Stats</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
                <Text style={styles.legendText}>Calories</Text>
              </View>
            </View>
          </View>
          <WeeklyChart data={weeklyData} />
        </View>

        {/* Today's Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <View style={styles.goalsGrid}>
            <ActivityCard title="Calories" current={stats.avgCalories} goal={2000} icon={Flame} color="#F59E0B" />
            <ActivityCard title="Protein" current={stats.totalProtein / 7} goal={150} icon={Dumbbell} color="#8B5CF6" />
            <ActivityCard title="Meals" current={3} goal={5} icon={Target} color="#10B981" />
          </View>
        </View>

        {/* Stats Cards Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Calories"
            value={stats.totalCalories}
            unit="kcal"
            icon={Flame}
            gradient={["#F59E0B", "#D97706"]}
            subValue="This week"
          />
          <StatCard
            title="Avg Daily"
            value={stats.avgCalories}
            unit="kcal"
            icon={Activity}
            gradient={["#8B5CF6", "#7C3AED"]}
            subValue="Per day"
          />
          <StatCard
            title="Total Meals"
            value={stats.totalMeals}
            unit="meals"
            icon={Target}
            gradient={["#10B981", "#059669"]}
            subValue="This week"
          />
          <StatCard
            title="Streak"
            value={stats.streak}
            unit="days"
            icon={Zap}
            gradient={["#3B82F6", "#2563EB"]}
            subValue="Keep going!"
          />
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsCard}>
          <View style={styles.achievementsHeader}>
            <View>
              <Text style={styles.achievementsTitle}>Make yourself stronger</Text>
              <Text style={styles.achievementsSubtitle}>than your excuses</Text>
            </View>
            <Award size={48} color="#8B5CF6" />
          </View>
          <TouchableOpacity style={styles.achievementsButton}>
            <Text style={styles.achievementsButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#8B5CF6",
  },
  periodButtonText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  chartCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  chartCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  chartLegend: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
  },
  goalsGrid: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityProgress: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCardWrapper: {
    width: "48%",
  },
  statCardGradient: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  statCardUnit: {
    fontSize: 16,
    fontWeight: "600",
  },
  statCardSubValue: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginTop: 4,
  },
  achievementsCard: {
    backgroundColor: "#F3E8FF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  achievementsSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  achievementsButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  achievementsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomPadding: {
    height: 40,
  },
});
