import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Button, // Ditambahkan untuk tombol navigasi
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// Imports fitur dan service yang diperlukan
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import api from '../services/api'; 
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

// Menggunakan export default dan menerima navigation
export default function MonitoringScreen({ navigation }) {
  // State Realtime MQTT (dari kode lama)
  const { temperature, timestamp, connectionState, error: mqttError } = useMqttSensor();

  // State Pagination & Data (dari kode baru, readings diganti menjadi data)
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const size = 10; // Ukuran halaman
  const [total, setTotal] = useState(0);

  // State Loading & Error (diperbarui dari kode lama)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // --- LOGIC PAGINATION & FETCH ---

  // Fungsi fetch diganti total dengan logika Pagination
  const fetchPage = useCallback(async (p = 1) => {
    // Tentukan apakah ini refresh atau ganti halaman
    const isRefresh = p === page;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setApiError(null);

    try {
      // Menggunakan API wrapper token-aware
      const res = await api.get(`/readings?page=${p}&size=${size}`);
      
      if (res && res.data) {
        setData(res.data);
        setTotal(res.total || 0);
        setPage(res.page || p);
      } else {
        // Fallback jika API tidak mengembalikan struktur pagination yang diharapkan
        setData(res || []);
        setTotal((res || []).length);
        setPage(1);
      }
    } catch (err) {
      console.error('Fetch readings error', err);
      // Asumsi API error body sudah ditangani oleh api.js
      setApiError(err?.error || err?.message || 'Gagal mengambil data dari server.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [page, size]); // Dependensi page dan size

  // --- LOGIC REFRESH & FOCUS ---
  
  // Menggantikan useFocusEffect yang lama
  useFocusEffect(
    useCallback(() => {
      // Reset ke halaman 1 setiap kali layar difokuskan
      fetchPage(1); 
    }, [fetchPage])
  );

  const onRefresh = useCallback(async () => {
    // Memanggil fetchPage di halaman yang sama
    await fetchPage(page);
  }, [fetchPage, page]);

  // Logic Pagination untuk UI
  const hasNext = page * size < total;
  const hasPrev = page > 1;

  // --- UI RENDER ---
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        // RefreshControl dari UI Lama
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Kontrol Navigasi Baru */}
        <View style={styles.navHeader}>
          <Text style={styles.sectionTitle}>Monitoring Overview</Text>
          <View style={styles.navButtons}>
            <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
            <Button title="Control" onPress={() => navigation.navigate('Control')} />
          </View>
        </View>

        {/* Realtime Temperature Card dari UI Lama */}
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
        {apiError && <Text style={styles.errorText}>Failed to load history: {apiError}</Text>}
        
        {/* DataTable (History) */}
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
          data={data} // Menggunakan data (hasil pagination)
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          // Tambahkan komponen jika data kosong
          ListEmptyComponent={() => !loading && !refreshing && <Text style={{ marginTop:10 }}>Tidak ada data.</Text>}
        />
        
        {/* Kontrol Pagination Baru */}
        <View style={styles.paginationControls}>
          <Button title="Sebelumnya" onPress={() => fetchPage(page - 1)} disabled={!hasPrev || loading || refreshing} />
          <Text style={styles.pageInfo}>Halaman {page} / {Math.max(1, Math.ceil(total/size))}</Text>
          <Button title="Berikutnya" onPress={() => fetchPage(page + 1)} disabled={!hasNext || loading || refreshing} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles dari UI Lama
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButtons: {
    flexDirection: 'row',
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
  // Style Baru untuk Pagination
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 80, // Tambahan padding untuk menghindari tab bar
  },
  pageInfo: {
    alignSelf: 'center',
    fontWeight: '600',
    color: '#555',
  }
});