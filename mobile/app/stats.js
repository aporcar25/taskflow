import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Stats() {
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

  const taskCompletionData = stats?.tareasPorDia || [
    { dia: 'Lun', completadas: 0 },
    { dia: 'Mar', completadas: 0 },
    { dia: 'Mié', completadas: 0 },
    { dia: 'Jue', completadas: 0 },
    { dia: 'Vie', completadas: 0 },
    { dia: 'Sáb', completadas: 0 },
    { dia: 'Dom', completadas: 0 },
  ];

  const maxCompletadas = Math.max(...taskCompletionData.map(d => d.completadas), 1);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />}
    >
      <View style={styles.summaryCard}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.totalCompletadas || 0}</Text>
          <Text style={styles.statLabel}>Total Completadas</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={styles.statValue}>{stats?.productividad || 0}%</Text>
          <Text style={styles.statLabel}>Productividad</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.mejorDia || '-'}</Text>
          <Text style={styles.statLabel}>Mejor Día</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad Semanal</Text>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {taskCompletionData.map((data, index) => (
              <View key={index} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(data.completadas / maxCompletadas) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.dia}</Text>
                <Text style={styles.barValue}>{data.completadas}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ranking de Hábitos</Text>
        {stats?.habitosRanking && stats.habitosRanking.length > 0 ? (
          stats.habitosRanking.map((habit, index) => (
            <View key={habit._id || index} style={styles.rankingCard}>
              <View style={styles.rankingPosition}>
                <Text style={styles.positionText}>{index + 1}</Text>
              </View>
              <View style={styles.rankingInfo}>
                <Text style={styles.habitName}>{habit.nombre}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(habit.porcentaje, 100)}%` }]} />
                </View>
              </View>
              <View style={styles.rankingValue}>
                <Text style={styles.streakText}>🔥 {habit.rachaActual}</Text>
                <Text style={styles.percentText}>{habit.porcentaje}%</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay datos de hábitos suficientes</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="bulb-outline" size={24} color="#a3e635" />
        <Text style={styles.infoText}>
          Mantén tus rachas para aumentar tu productividad. ¡Tu mejor día suele ser el {stats?.mejorDia || '...'}!
        </Text>
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a3e635',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
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
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  barCol: {
    alignItems: 'center',
    width: (width - 120) / 7,
  },
  barTrack: {
    width: 8,
    height: 100,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#a3e635',
    borderRadius: 4,
  },
  barLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 8,
  },
  barValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
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
  rankingPosition: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  positionText: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  rankingInfo: {
    flex: 1,
  },
  habitName: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    width: '90%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a3e635',
    borderRadius: 2,
  },
  rankingValue: {
    alignItems: 'flex-end',
  },
  streakText: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 12,
  },
  percentText: {
    color: '#999',
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#a3e63510',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3e63533',
  },
  infoText: {
    flex: 1,
    color: '#ccc',
    fontSize: 13,
    marginLeft: 12,
    lineHeight: 18,
  }
});
