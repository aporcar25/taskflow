import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CheckCircle2, ListTodo, TrendingUp, Zap, LogOut } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/stats'),
        api.get('/tasks')
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Usuario'}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <LogOut size={20} color="#f87171" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Hoy"
            value={stats?.tareasCompletadasHoy || 0}
            subtitle="Completadas"
            icon={<CheckCircle2 size={24} color="#a3e635" />}
          />
          <StatCard
            title="Semana"
            value={stats?.tareasCompletadasEstaSemana || 0}
            subtitle="Completadas"
            icon={<ListTodo size={24} color="#a3e635" />}
          />
          <StatCard
            title="Productividad"
            value={`${stats?.porcentajeProductividad || 0}%`}
            subtitle="Ratio total"
            icon={<TrendingUp size={24} color="#a3e635" />}
          />
          <StatCard
            title="Racha"
            value={stats?.rachaMaximaHabitos || 0}
            subtitle="Días seguidos"
            icon={<Zap size={24} color="#a3e635" />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tareas recientes</Text>
          {recentTasks.length > 0 ? (
            recentTasks.map(task => (
              <View key={task._id} style={styles.taskCard}>
                <View style={[styles.statusIndicator, { backgroundColor: task.completada ? '#a3e635' : '#404040' }]} />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.completada && styles.completedText]}>{task.titulo}</Text>
                  <Text style={styles.taskCategory}>{task.categoria}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay tareas recientes</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#171717',
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#a3e635',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});
