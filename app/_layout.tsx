import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";

import ProgressPlusLaunch from "@/components/ui/ProgressPlusLaunch";
import GlobalRestTimer from "@/components/workout/GlobalRestTimer";
import { AuthProvider } from "@/contexts/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [showLaunch, setShowLaunch] = useState(true);
  const finishLaunch = useCallback(() => setShowLaunch(false), []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data?.type === "rest-timer") {
        console.log("REST TIMER NOTIFICATION OPENED");
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <GlobalRestTimer />
      {showLaunch && <ProgressPlusLaunch onFinished={finishLaunch} />}
    </AuthProvider>
  );
}
