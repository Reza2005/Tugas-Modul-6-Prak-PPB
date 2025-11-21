import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Button,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import simpleAuth from '../auth/simpleAuth';
import api from '../services/api'; 
import { DataTable } from "../components/DataTable.js"; 

export default function ControlScreen({ navigation }) {
  const [user, setUser] = useState(simpleAuth.getUser()); 

  const [thresholdValue, setThresholdValue] = useState(30);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- LOGIC FETCH HISTORY (Dibuat Super Robust) ---

  const fetchHistory = useCallback(async () => {
    const token = simpleAuth.getToken();
    if (!token) {
      setHistory([]);
      return; 
    }

    setLoading(true);
    setError(null);
    try {
      // Menggunakan api.get token-aware
      const data = await api.get("/api/thresholds"); 
      setHistory(data?.data ?? data ?? []); 
    } catch (err) {
      console.error('Fetch thresholds error (Server Crash)', err);

      // Menangani kegagalan koneksi/crash server dengan menampilkan pesan
      setHistory([]);
      setError("Gagal memuat riwayat: Koneksi server terputus atau terjadi kegagalan data."); 

      // Jika error 401, bersihkan auth state
      if (err?.status === 401) {
          simpleAuth.clearAuth();
          setUser(null);
          Alert.alert('Sesi Berakhir', 'Sesi login Anda telah berakhir. Silakan login kembali.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setUser(simpleAuth.getUser());
      fetchHistory();
    }, [fetchHistory])
  );
  // --- END LOGIC ---


  const latestThreshold = useMemo(() => history?.[0]?.value ?? null, [history]);

  const handleSubmit = useCallback(async () => {
    const token = simpleAuth.getToken();
    if (!token) {
      Alert.alert('Akses Ditolak', 'Hanya pengguna yang login dapat mengirim perintah. Silakan login dulu.');
      navigation.navigate('Login');
      return;
    }
    
    const valueNumber = Number(thresholdValue);
    if (Number.isNaN(valueNumber)) {
      setError("Please enter a numeric threshold.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Menggunakan api.post token-aware
      await api.post("/api/thresholds", { value: valueNumber, note });
      Alert.alert('Sukses', `Threshold berhasil disimpan: ${valueNumber}°C`);
      setNote("");
      await fetchHistory();
    } catch (err) {
      console.error('Submit threshold error', err);
      const msg = err?.body?.error || err?.message || JSON.stringify(err);
      setError(String(msg));
      Alert.alert('Error', `Gagal menyimpan Threshold: ${String(msg)}`);
    } finally {
      setSubmitting(false);
    }
  }, [thresholdValue, note, fetchHistory, navigation]); 

  
  // --- CONDITIONAL RENDERING (Proteksi UI) ---
  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Akses Kontrol Ditolak</Text>
        <Text style={styles.metaText}>Anda harus login untuk mengatur Threshold dan melihat History.</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // --- END CONDITIONAL RENDERING ---

  // Tampilan Threshold Setting (UI Lama)
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Configure Threshold</Text>
          {latestThreshold !== null && (
            <Text style={styles.metaText}>
              Current threshold: {Number(latestThreshold).toFixed(2)}°C
            </Text>
          )}
          <Text style={styles.label}>Threshold (°C)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(thresholdValue)}
            onChangeText={setThresholdValue}
          />
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            placeholder="Describe why you are changing the threshold"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Threshold</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Threshold History</Text>
          {loading && <ActivityIndicator />}
        </View>
        <DataTable
          columns={[
            {
              key: "created_at",
              title: "Saved At",
              render: (value) => (value ? new Date(value).toLocaleString() : "--"),
            },
            {
              key: "value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
            {
              key: "note",
              title: "Note",
              render: (value) => value || "-",
            },
          ]}
          data={history}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fb",
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
  label: {
    marginTop: 16,
    fontWeight: "600",
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  // Style Baru untuk Tombol Login
  loginButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: '100%'
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  metaText: {
    color: "#666",
    marginBottom: 16, // Ditambahkan agar ada jarak di conditional screen
  },
  errorText: {
    marginTop: 12,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Style Baru untuk conditional login screen
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8f9fb",
  }
});