import React, { useCallback, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMqttSensor } from "../hooks/useMqttSensor.js";
import api from "../services/api";
import { DataTable } from "../components/DataTable.js";

export default function MonitoringScreen({ navigation }) {
  // State realtime MQTT
  const { temperature, timestamp, connectionState, error: mqttError } = useMqttSensor();

  // Pagination states
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const size = 10;
  const [total, setTotal] = useState(0);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch page (tanpa auto-refresh)
  const fetchPage = useCallback(async (p = 1) => {
    const isRefresh = p === page;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setApiError(null);

    try {
      const res = await api.get(`/readings?page=${p}&size=${size}`);

      if (res?.data) {
        setData(res.data);
        setTotal(res.total || 0);
        setPage(res.page || p);
      } else {
        setData(res || []);
        setTotal((res || []).length);
        setPage(1);
      }
    } catch (err) {
      console.error("Fetch readings error", err);
      setApiError(err?.error || err?.message || "Gagal mengambil data");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [page, size]);

  // Fetch hanya sekali waktu screen pertama kali muncul
  useEffect(() => {
    fetchPage(1);
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const hasNext = page * size < total;
  const hasPrev = page > 1;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Navigation Header */}
        <View style={styles.navHeader}>
          <Text style={styles.sectionTitle}>Monitoring Overview</Text>
          <View style={styles.navButtons}>
            <Button title="Profile" onPress={() => navigation.navigate("Profile")} />
            <Button title="Control" onPress={() => navigation.navigate("Control")} />
          </View>
        </View>

        {/* Realtime Temperature */}
        <View style={styles.card}>
          <Text style={styles.title}>Realtime Temperature</Text>
          <View style={styles.valueRow}>
            <Text style={styles.temperatureText}>
              {typeof temperature === "number" ? `${temperature.toFixed(2)}°C` : "--"}
            </Text>
          </View>
          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>
              Last update: {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {mqttError && <Text style={styles.errorText}>MQTT error: {mqttError}</Text>}
        </View>

        {/* History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Triggered Readings History</Text>
          {(loading || refreshing) && <ActivityIndicator />}
        </View>

        {apiError && (
          <Text style={styles.errorText}>Failed to load history: {apiError}</Text>
        )}

        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) => (value ? new Date(value).toLocaleString() : "--"),
            },
            {
              key: "temperature",
              title: "Temperature (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
            {
              key: "threshold_value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
          ]}
          data={data}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          ListEmptyComponent={() =>
            !loading && !refreshing && <Text style={{ marginTop: 10 }}>Tidak ada data.</Text>
          }
        />

        {/* Pagination */}
        <View style={styles.paginationControls}>
          <Button
            title="Sebelumnya"
            onPress={() => fetchPage(page - 1)}
            disabled={!hasPrev || loading || refreshing}
          />
          <Text style={styles.pageInfo}>
            Halaman {page} / {Math.max(1, Math.ceil(total / size))}
          </Text>
          <Button
            title="Berikutnya"
            onPress={() => fetchPage(page + 1)}
            disabled={!hasNext || loading || refreshing}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButtons: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ff7a59",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 80,
  },
  pageInfo: {
    alignSelf: "center",
    fontWeight: "600",
    color: "#555",
  },
});
