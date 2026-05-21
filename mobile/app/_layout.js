import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(main)';

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      router.replace('/(main)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="stats" options={{
        headerShown: true,
        title: 'Estadísticas',
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTitleStyle: { color: '#fff' },
        headerTintColor: '#a3e635'
      }} />
      <Stack.Screen name="goals" options={{
        headerShown: true,
        title: 'Objetivos',
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTitleStyle: { color: '#fff' },
        headerTintColor: '#a3e635'
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
