import React, { useState, useEffect, useMemo } from "react";
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
import { api } from "@/src/services/api";
import { TrendingUp, Award } from "lucide-react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;

const SimpleBarChart = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.simpleChart}>
      {data.map((value, index) => {
        const barHeight = (value / maxValue) * 120;
        const colors = ["#8B5CF6", "#EC4899", "#3B82F6"];

        return (
          <View key={index} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: colors[index % colors.length],
                },
              ]}
            />
            <Text style={styles.barLabel}>{["Mon", "Tue", "Wed"][index]}</Text>
          </View>
        );
      })}
    </View>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <Text style={styles.statCardValue}>{value}</Text>
    <Text style={styles.statCardTitle}>{title}</Text>
  </View>
);

const DaySelector = ({ selectedDay, onSelect }: any) => {
  const days = [12, 13, 14, 15];

  return (
    <View style={styles.daySelector}>
      {days.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            selectedDay === day && styles.dayButtonActive,
          ]}
          onPress={() => onSelect(day)}
        >
          <Text
            style={[
              styles.dayButtonText,
              selectedDay === day && styles.dayButtonTextActive,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(13);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    calories: 880,
    protein: 520,
    carbs: 874,
    weeklyData: [1500, 1800, 1600],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get("/statistics/weekly");
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          calories: data.avgCalories || 880,
          protein: data.totalProtein || 520,
          carbs: data.totalCarbs || 874,
          weeklyData: data.weeklyCalories || [1500, 1800, 1600],
        });
      }
    } catch (error) {
      console.log("Using default stats");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F5F7FA" }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Motivational Card */}
        <LinearGradient
          colors={["#1E3A8A", "#1E40AF", "#3B82F6"]}
          style={styles.motivationalCard}
        >
          <View style={styles.motivationalContent}>
            <Award size={48} color="#fff" style={styles.motivationalIcon} />
            <Text style={styles.motivationalTitle}>Make yourself stronger</Text>
            <Text style={styles.motivationalSubtitle}>than your excuses</Text>
            <TouchableOpacity style={styles.getStartedButton}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Main Activity Card */}
        <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              Your Activities
            </Text>
            <TouchableOpacity>
              <TrendingUp size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <DaySelector selectedDay={selectedDay} onSelect={setSelectedDay} />

          {/* Chart Section */}
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Weekly Stats Chart
            </Text>
            <SimpleBarChart data={stats.weeklyData} />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard title="Calories" value={stats.calories} color="#E9D5FF" />
            <StatCard title="Protein" value={stats.protein} color="#FBCFE8" />
            <StatCard title="Carbs" value={stats.carbs} color="#DBEAFE" />
          </View>
        </View>

        {/* Today's Stats Card */}
        <View style={styles.todayStatsCardWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Activities
          </Text>

          <View style={styles.barsRow}>
            <View style={styles.verticalBarWrapper}>
              <View style={[styles.verticalBar, { height: 100, backgroundColor: "#3B82F6" }]} />
              <Text style={styles.verticalBarLabel}>Mon</Text>
            </View>
            <View style={styles.verticalBarWrapper}>
              <View style={[styles.verticalBar, { height: 120, backgroundColor: "#8B5CF6" }]} />
              <Text style={styles.verticalBarLabel}>Tue</Text>
            </View>
            <View style={styles.verticalBarWrapper}>
              <View style={[styles.verticalBar, { height: 150, backgroundColor: "#EC4899" }]} />
              <Text style={styles.verticalBarLabel}>Wed</Text>
            </View>
          </View>

          <LinearGradient
            colors={["#1E293B", "#0F172A"]}
            style={styles.todayStatsCard}
          >
            <Text style={styles.todayStatsTitle}>Today's Stats Check</Text>
            <View style={styles.todayStatsRow}>
              <View style={styles.todayStatItem}>
                <Text style={styles.todayStatValue}>310</Text>
                <Text style={styles.todayStatLabel}>Min</Text>
              </View>
              <View style={styles.todayStatItem}>
                <Text style={styles.todayStatValue}>570</Text>
                <Text style={styles.todayStatLabel}>Cal</Text>
              </View>
              <View style={styles.todayStatItem}>
                <Text style={styles.todayStatValue}>874</Text>
                <Text style={styles.todayStatLabel}>Kcal</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  motivationalCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    minHeight: 200,
    justifyContent: "center",
  },
  motivationalContent: {
    alignItems: "center",
  },
  motivationalIcon: {
    marginBottom: 16,
  },
  motivationalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  motivationalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  activityCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  dayButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonActive: {
    backgroundColor: "#3B82F6",
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  simpleChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  todayStatsCardWrapper: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
    marginBottom: 24,
  },
  verticalBarWrapper: {
    alignItems: "center",
  },
  verticalBar: {
    width: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  verticalBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  todayStatsCard: {
    borderRadius: 20,
    padding: 20,
  },
  todayStatsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  todayStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  todayStatItem: {
    alignItems: "center",
  },
  todayStatValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  todayStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
});
