import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import simpleAuth from "../auth/simpleAuth";

// Data statis untuk ditampilkan
const STATIC_PROFILE = {
  name: "Reza Al Ghifari", 
  nim: "220101007",
  group: "Kelompok 22",
};

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(simpleAuth.getUser());

  useFocusEffect(
    useCallback(() => {
      setUser(simpleAuth.getUser());
    }, [])
  );

  const handleLogout = () => {
    simpleAuth.clearAuth();
    setUser(null);
    
    Alert.alert("Logout Berhasil", "Anda telah berhasil logout.", [
      {
        text: "OK",
        onPress: () => navigation.navigate('Main', { screen: 'Monitoring' }), 
      },
    ]);
  };

  // -----------------------------------------------------------------
  // PERBAIKAN: Menggunakan loginContainer untuk centering
  // -----------------------------------------------------------------
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Menggunakan loginContainer untuk menengahkan konten */}
        <View style={styles.loginContainer}> 
          <View style={styles.card}>
            <Text style={styles.title}>Akses Ditolak</Text>
            <Text style={styles.metaText}>Silakan login untuk melihat profil.</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  // -----------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* PFP Card Section */}
        <View style={styles.pfpCard}>
          <View style={styles.pfpContainer}>
            <Ionicons name="person-circle-outline" size={100} color="#2563eb" />
          </View>
          <Text style={styles.nameText}>{STATIC_PROFILE.name}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>

        {/* Detail Info Card */}
        <View style={styles.detailCard}>
          <Text style={styles.detailHeader}>Informasi Akun</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="id-card-outline" size={20} color="#666" style={{ width: 30 }} />
            <View>
              <Text style={styles.infoLabel}>NIM</Text>
              <Text style={styles.infoValue}>{STATIC_PROFILE.nim}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color="#666" style={{ width: 30 }} />
            <View>
              <Text style={styles.infoLabel}>Kelompok</Text>
              <Text style={styles.infoValue}>{STATIC_PROFILE.group}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="key-outline" size={20} color="#666" style={{ width: 30 }} />
            <View>
              <Text style={styles.infoLabel}>Token Aktif</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user.token?.slice(0, 15)}...</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },
  scrollContainer: {
    padding: 16,
    alignItems: "center",
  },
  pfpCard: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pfpContainer: {
    marginBottom: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 5,
  },
  emailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailHeader: {
    fontSize: 16,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
    color: "#1f2937",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  infoLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Style untuk non-login state
  // PERBAIKAN UTAMA DI SINI
  loginContainer: { 
    flex: 1,
    justifyContent: 'center', // Center vertikal
    alignItems: 'center',    // Center horizontal
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  metaText: {
    color: "#666",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});