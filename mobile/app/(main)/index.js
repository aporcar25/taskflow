import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/stats'),
        api.get('/tasks')
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />}
    >
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Usuario'}</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#a3e635" />
          <Text style={styles.statValue}>{stats?.completadas || 0}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{stats?.pendientes || 0}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{stats?.maxRacha || 0}</Text>
          <Text style={styles.statLabel}>Racha</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas Recientes</Text>
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
                <Ionicons name="checkmark-done" size={20} color="#a3e635" />
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes tareas recientes</Text>
          </View>
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
  },
  welcome: {
    marginBottom: 25,
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
    marginBottom: 25,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
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
    height: '100%',
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
  }
});
