import { Tabs } from "expo-router";
import { ChartColumn, Dumbbell, House, Ruler, Trophy, User } from "lucide-react-native";

import Colors from "@/constants/colors";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          height: 78,
          paddingTop: 10,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Accueil", tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="workout" options={{ title: "Séance", tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: "Stats", tabBarIcon: ({ color, size }) => <ChartColumn color={color} size={size} /> }} />
      <Tabs.Screen name="body-progress" options={{ title: "Corps", tabBarIcon: ({ color, size }) => <Ruler color={color} size={size} /> }} />
      <Tabs.Screen name="ranking" options={{ title: "Classement", tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="program" options={{ href: null }} />
      <Tabs.Screen name="workout-session" options={{ href: null }} />
      <Tabs.Screen name="workout-tools" options={{ href: null }} />
      <Tabs.Screen name="exercise" options={{ href: null }} />
      <Tabs.Screen name="exercise-detail" options={{ href: null }} />
      <Tabs.Screen name="muscle-library" options={{ href: null }} />
      <Tabs.Screen name="community-programs" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
