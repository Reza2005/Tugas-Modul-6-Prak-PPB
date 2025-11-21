import { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// Menggunakan createNativeStackNavigator untuk navigation root
import { createNativeStackNavigator } from "@react-navigation/native-stack"; 
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Imports semua screen yang diperlukan
import MonitoringScreen from "./src/screens/MonitoringScreen.js";
import ControlScreen from "./src/screens/ControlScreen.js";
import LoginScreen from "./src/screens/LoginScreen.js"; 
import ProfileScreen from "./src/screens/ProfileScreen.js"; 

import { assertConfig } from "./src/services/config.js";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); // Mendefinisikan Stack Navigator

enableScreens(true);

// Komponen MainTabs: Sekarang berisi Monitoring, Control, dan Profile
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Menonaktifkan header di Tab Navigator (header ditangani Stack)
        headerShown: false, 
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Monitoring') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Control') {
            iconName = focused ? 'options' : 'options-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Control" component={ControlScreen} />
      {/* BARU: Profile ditambahkan sebagai Tab utama */}
      <Tab.Screen name="Profile" component={ProfileScreen} /> 
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
          {/* MainTabs adalah Tab Navigator (Monitoring, Control, Profile) */}
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }} // Tab Navigator tidak menampilkan header Stack
          />
          {/* Layar Login sebagai Stack Screen terpisah (bisa diakses dari mana saja) */}
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* Catatan: ProfileScreen tidak lagi di sini karena sudah di dalam MainTabs */}
        </Stack.Navigator>
      </NavigationContainer>  
    </SafeAreaProvider>
  );
}