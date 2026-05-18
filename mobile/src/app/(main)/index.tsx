import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { LogOut, Flame, CheckCircle, Calendar, Percent } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/stats'),
        api.get('/tasks'),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hola, {user?.nombre || 'Usuario'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <LogOut size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Hoy"
          value={stats?.tareasCompletadasHoy || 0}
          icon={CheckCircle}
          color="#a3e635"
        />
        <StatCard
          title="Semana"
          value={stats?.tareasCompletadasEstaSemana || 0}
          icon={Calendar}
          color="#3b82f6"
        />
        <StatCard
          title="Productividad"
          value={`${stats?.porcentajeProductividad || 0}%`}
          icon={Percent}
          color="#8b5cf6"
        />
        <StatCard
          title="Racha"
          value={stats?.rachaMaximaHabitos || 0}
          icon={Flame}
          color="#f97316"
        />
      </View>

      <Text style={styles.sectionTitle}>Tareas Recientes</Text>
      <View style={styles.recentTasks}>
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => (
            <View key={task._id} style={styles.taskItem}>
              <View style={[styles.priorityIndicator, { backgroundColor:
                task.prioridad === 'alta' ? '#ef4444' :
                task.prioridad === 'media' ? '#f59e0b' : '#10b981'
              }]} />
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.completada && styles.taskCompleted]}>{task.titulo}</Text>
                <Text style={styles.taskCategory}>{task.categoria}</Text>
              </View>
              {task.completada && <CheckCircle size={18} color="#a3e635" />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay tareas recientes</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    width: '48%',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  recentTasks: {
    gap: 12,
    paddingBottom: 40,
  },
  taskItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskCategory: {
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
