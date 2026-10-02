import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Stats() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    );
  }

  const activityData = stats?.actividadSemanal || [
    { day: 'Lun', tasks: 0 },
    { day: 'Mar', tasks: 0 },
    { day: 'Mié', tasks: 0 },
    { day: 'Jue', tasks: 0 },
    { day: 'Vie', tasks: 0 },
    { day: 'Sáb', tasks: 0 },
    { day: 'Dom', tasks: 0 },
  ];

  const maxTasks = Math.max(...activityData.map(d => d.tasks), 1);
  const productivity = stats?.porcentajeProductividad || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#a3e635" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estadísticas</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />}
      >
        <View style={styles.productivityCard}>
          <View style={styles.circularContainer}>
            <View style={styles.circularBg}>
              <Text style={styles.circularValue}>{productivity}%</Text>
              <Text style={styles.circularLabel}>Productividad</Text>
            </View>
          </View>
          <View style={styles.productivityInfo}>
            <Text style={styles.infoTitle}>Rendimiento Semanal</Text>
            <Text style={styles.infoSub}>{stats?.totalTareas} tareas totales</Text>
            <Text style={styles.infoSub}>{stats?.tareasCompletadas} completadas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Semanal</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barChart}>
              {activityData.map((data, index) => (
                <View key={index} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${(data.tasks / maxTasks) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.day}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.highlightBox}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <Text style={styles.highlightText}>
              Tu día más productivo es el <Text style={styles.boldText}>{stats?.mejorDia || '...'}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ranking de Hábitos</Text>
          {stats?.habitosDetalles && stats.habitosDetalles.length > 0 ? (
            stats.habitosDetalles.map((habit, index) => (
              <View key={index} style={styles.rankingCard}>
                <View style={styles.rankingIcon}>
                  <Text style={styles.rankingEmoji}>{habit.icono || '✨'}</Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={styles.habitName}>{habit.nombre}</Text>
                  <Text style={styles.habitRacha}>Racha actual: {habit.rachaActual} días</Text>
                </View>
                <View style={styles.rankingBadge}>
                  <Text style={styles.badgeText}>#{index + 1}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay datos suficientes</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a1a1a',
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productivityCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  circularContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#a3e63533',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBg: {
    alignItems: 'center',
  },
  circularValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a3e635',
  },
  circularLabel: {
    fontSize: 8,
    color: '#999',
    textTransform: 'uppercase',
  },
  productivityInfo: {
    flex: 1,
    marginLeft: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    width: (width - 130) / 7,
  },
  barTrack: {
    width: 10,
    height: 100,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#a3e635',
    borderRadius: 5,
  },
  barLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 10,
  },
  highlightBox: {
    flexDirection: 'row',
    backgroundColor: '#f59e0b15',
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b33',
  },
  highlightText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
  },
  boldText: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  rankingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankingEmoji: {
    fontSize: 20,
  },
  rankingInfo: {
    flex: 1,
  },
  habitName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  habitRacha: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  rankingBadge: {
    backgroundColor: '#a3e635',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  }
});
