// reza2005/tugas-modul-6-prak-ppb/Tugas-Modul-6-Prak-PPB-55b049ffc55914d79037daa24bf76aaa79ebf5a3/app/App.js

import { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// Menggunakan createNativeStackNavigator untuk navigation root
import { createNativeStackNavigator } from "@react-navigation/native-stack"; 
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";

// MEMPERBAIKI: Mengubah import menjadi default import
import MonitoringScreen from "./src/screens/MonitoringScreen.js";
import ControlScreen from "./src/screens/ControlScreen.js";
import LoginScreen from "./src/screens/LoginScreen.js"; // Import LoginScreen
import ProfileScreen from "./src/screens/ProfileScreen.js"; // Import ProfileScreen

import { assertConfig } from "./src/services/config.js";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); // Mendefinisikan Stack Navigator

enableScreens(true);

// Komponen terpisah untuk Tab Navigator (Monitoring & Control)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Menonaktifkan header di Tab Navigator karena akan ditangani oleh Stack Navigator
        headerShown: false, 
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === "Monitoring" ? "analytics" : "options";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Control" component={ControlScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    assertConfig();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f9fb",
    },
  };

  // Stack Navigator sebagai root
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: true, // Header ditampilkan di Stack
            headerTitle: "IOTWatch",
            headerTitleAlign: "center",
            headerTintColor: "#1f2937",
            headerStyle: { backgroundColor: "#f8f9fb" },
            headerTitleStyle: { fontWeight: "600", fontSize: 18 },
          }}
        >
          {/* MainTabs adalah layar utama yang berisi Monitoring dan Control */}
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }} // Tab Navigator akan mengelola header-nya sendiri
          />
          {/* Layar Login dan Profil sebagai layar terpisah dalam Stack */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>  
    </SafeAreaProvider>
  );
}