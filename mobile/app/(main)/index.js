import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, habitsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/tasks'),
        api.get('/habitos')
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
      setTodayHabits(habitsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const isCompletedToday = (historial) => {
    if (!historial || historial.length === 0) return false;
    const today = new Date().toDateString();
    return historial.some(fecha => new Date(fecha).toDateString() === today);
  };

  const completeHabit = async (id) => {
    try {
      await api.post(`/habitos/${id}/completar`);
      fetchData();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />}
    >
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Usuario'} 👋</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={24} color="#a3e635" />
          <Text style={styles.statValue}>{stats?.completadasHoy || 0}</Text>
          <Text style={styles.statLabel}>Completadas hoy</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="list-outline" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{stats?.pendientes || 0}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{stats?.maxRacha || 0}</Text>
          <Text style={styles.statLabel}>Racha hábitos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{stats?.productividad || 0}%</Text>
          <Text style={styles.statLabel}>Productividad</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => router.push('/stats')}
      >
        <Text style={styles.statsButtonText}>Ver Estadísticas Detalladas</Text>
        <Ionicons name="chevron-forward" size={20} color="#a3e635" />
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas Recientes</Text>
          <TouchableOpacity onPress={() => router.push('/tasks')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {recentTasks.length > 0 ? (
          recentTasks.map(task => (
            <View key={task._id} style={styles.taskCard}>
              <View style={[styles.priorityIndicator, { backgroundColor: task.prioridad === 'alta' ? '#ef4444' : task.prioridad === 'media' ? '#f59e0b' : '#3b82f6' }]} />
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.titulo}</Text>
                <Text style={styles.taskCategory}>{task.categoria || 'Sin categoría'}</Text>
              </View>
              {task.estado === 'completada' && (
                <Ionicons name="checkmark-circle" size={20} color="#a3e635" />
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color="#333" />
            <Text style={styles.emptyText}>No tienes tareas recientes</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hábitos de Hoy</Text>
          <TouchableOpacity onPress={() => router.push('/habits')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {todayHabits.length > 0 ? (
          todayHabits.map(habit => {
            const completed = isCompletedToday(habit.historial);
            return (
              <View key={habit._id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{habit.nombre}</Text>
                  <Text style={styles.streakSmall}>🔥 {habit.rachaActual} días</Text>
                </View>
                <TouchableOpacity
                  onPress={() => !completed && completeHabit(habit._id)}
                  disabled={completed}
                >
                  <Ionicons
                    name={completed ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={completed ? "#a3e635" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={40} color="#333" />
            <Text style={styles.emptyText}>No hay hábitos para hoy</Text>
          </View>
        )}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    marginBottom: 25,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#999',
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statsButton: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#a3e63533',
  },
  statsButtonText: {
    color: '#a3e635',
    fontWeight: '600',
    marginRight: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    color: '#a3e635',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  priorityIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  taskCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  streakSmall: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 2,
    fontWeight: '600',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
  }
});
