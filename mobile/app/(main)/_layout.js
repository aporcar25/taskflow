import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function MainLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#333',
        paddingBottom: 5,
        height: 60,
      },
      tabBarActiveTintColor: '#a3e635',
      tabBarInactiveTintColor: '#999',
      headerStyle: {
        backgroundColor: '#0a0a0a',
      },
      headerTitleStyle: {
        color: '#fff',
        fontWeight: 'bold',
      },
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Hábitos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
