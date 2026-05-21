import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      useNativeDriver: false,
    }).start();

    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value]);

  return <Text style={styles.statValue}>{displayValue}</Text>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: '¡Buenos días!', emoji: '🌅' };
    if (hour >= 12 && hour < 20) return { text: '¡Buenas tardes!', emoji: '☀️' };
    return { text: '¡Buenas noches!', emoji: '🌙' };
  };

  const getMotivationalMessage = (productivity) => {
    if (productivity === 0) return "¡Hoy es un gran día para empezar algo nuevo! 🚀";
    if (productivity < 50) return "Vas por buen camino, ¡sigue así! 💪";
    if (productivity < 100) return "¡Estás teniendo un día muy productivo! 🔥";
    return "¡Increíble! Has completado todo por hoy. 🏆";
  };

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, habitsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/tasks'),
        api.get('/habits')
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
      setTodayHabits(habitsRes.data);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ]).start();
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
      await api.post(`/habits/${id}/completar`);
      fetchData();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const greeting = getGreeting();

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
      <Animated.View style={[styles.welcome, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.greetingText}>{greeting.text} {greeting.emoji}</Text>
        <Text style={styles.welcomeText}>{user?.nombre || 'Usuario'}</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </Animated.View>

      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#1a2a1a' }]}>
            <Ionicons name="checkmark-done" size={24} color="#a3e635" />
            <AnimatedNumber value={stats?.tareasCompletadasHoy || 0} />
            <Text style={styles.statLabel}>Completadas hoy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#2a221a' }]}>
            <Ionicons name="time" size={24} color="#f59e0b" />
            <AnimatedNumber value={stats?.tareasPendientes || 0} />
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#2a1a1a' }]}>
            <Ionicons name="flame" size={24} color="#ef4444" />
            <AnimatedNumber value={stats?.rachaMaximaHabitos || 0} />
            <Text style={styles.statLabel}>Racha máxima</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#1a1a2a' }]}>
            <Ionicons name="trending-up" size={24} color="#3b82f6" />
            <AnimatedNumber value={stats?.porcentajeProductividad || 0} />
            <Text style={styles.statLabel}>Productividad %</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.motivationBox, { opacity: fadeAnim }]}>
        <Text style={styles.motivationText}>{getMotivationalMessage(stats?.porcentajeProductividad || 0)}</Text>
      </Animated.View>

      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => router.push('/stats')}
      >
        <Text style={styles.statsButtonText}>Ver Estadísticas Detalladas</Text>
        <Ionicons name="chevron-forward" size={20} color="#a3e635" />
      </TouchableOpacity>

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
              <View key={habit._id} style={styles.habitItem}>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{habit.nombre}</Text>
                  <Text style={styles.streakSmall}>🔥 {habit.rachaActual} días</Text>
                </View>
                <TouchableOpacity
                  onPress={() => !completed && completeHabit(habit._id)}
                  disabled={completed}
                  style={styles.checkBtn}
                >
                  <Ionicons
                    name={completed ? "checkmark-circle" : "ellipse-outline"}
                    size={32}
                    color={completed ? "#a3e635" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay hábitos para hoy</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas Recientes</Text>
          <TouchableOpacity onPress={() => router.push('/tasks')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {recentTasks.length > 0 ? (
          recentTasks.map(task => (
            <View key={task._id} style={styles.taskItem}>
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
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tienes tareas recientes</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
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
  greetingText: {
    fontSize: 18,
    color: '#a3e635',
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  motivationBox: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#a3e635',
  },
  motivationText: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  statsButton: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#a3e63533',
  },
  statsButtonText: {
    color: '#a3e635',
    fontWeight: 'bold',
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
  habitItem: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  streakSmall: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 2,
    fontWeight: '600',
  },
  taskItem: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
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
  checkBtn: {
    padding: 5,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  }
});
