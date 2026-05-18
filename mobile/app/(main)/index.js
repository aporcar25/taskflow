import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { CheckCircle2, Circle, Flame, TrendingUp, Layout } from 'lucide-react-native';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/stats'),
        api.get('/tasks')
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const StatCard = ({ title, value, icon: Icon, color = '#a3e635' }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hola, {user?.nombre || 'Usuario'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Hoy"
          value={stats?.tareasCompletadasHoy || 0}
          icon={CheckCircle2}
        />
        <StatCard
          title="Semana"
          value={stats?.tareasCompletadasEstaSemana || 0}
          icon={TrendingUp}
        />
        <StatCard
          title="Productividad"
          value={`${stats?.porcentajeProductividad || 0}%`}
          icon={Layout}
        />
        <StatCard
          title="Racha"
          value={stats?.rachaMaximaHabitos || 0}
          icon={Flame}
          color="#fb923c"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tareas recientes</Text>
        {recentTasks.length > 0 ? (
          recentTasks.map(task => (
            <View key={task._id} style={styles.taskItem}>
              {task.completada ? (
                <CheckCircle2 size={20} color="#a3e635" />
              ) : (
                <Circle size={20} color="#666" />
              )}
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.completada && styles.taskTitleDone]}>
                  {task.titulo}
                </Text>
                <Text style={styles.taskMeta}>
                  {task.categoria} • {task.prioridad}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay tareas recientes</Text>
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
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    width: '47%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  taskInfo: {
    marginLeft: 12,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});
