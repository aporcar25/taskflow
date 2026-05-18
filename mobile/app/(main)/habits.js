import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { Sparkles, Flame, CheckCircle2, Circle } from 'lucide-react-native';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHabits();
  };

  const handleCheckHabit = async (id) => {
    try {
      await api.patch(`/habits/${id}/check`);
      fetchHabits();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el hábito');
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
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoBox}>
          <Sparkles color="#a3e635" size={24} />
          <Text style={styles.infoText}>
            Mantén tus rachas activas completando tus hábitos diariamente.
          </Text>
        </View>

        {habits.length > 0 ? (
          habits.map(habit => (
            <View key={habit._id} style={styles.habitCard}>
              <View style={styles.habitIconContainer}>
                <Text style={styles.habitIcon}>{habit.icono}</Text>
              </View>

              <View style={styles.habitInfo}>
                <Text style={styles.habitTitle}>{habit.nombre}</Text>
                <View style={styles.streakContainer}>
                  <Flame size={14} color={habit.racha > 0 ? '#fb923c' : '#666'} />
                  <Text style={[styles.streakText, habit.racha > 0 && styles.streakTextActive]}>
                    {habit.racha} días de racha
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.checkButton,
                  habit.completadoHoy && styles.checkButtonDone
                ]}
                onPress={() => handleCheckHabit(habit._id)}
              >
                {habit.completadoHoy ? (
                  <CheckCircle2 size={24} color="#0a0a0a" />
                ) : (
                  <Circle size={24} color="#a3e635" />
                )}
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Sparkles size={60} color="#1a1a1a" />
            <Text style={styles.emptyText}>No tienes hábitos configurados</Text>
            <Text style={styles.emptySubtext}>Configura tus hábitos en la versión web para verlos aquí.</Text>
          </View>
        )}
      </ScrollView>
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
    padding: 15,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3e63520',
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  habitCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  habitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitIcon: {
    fontSize: 20,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  streakTextActive: {
    color: '#fb923c',
    fontWeight: '600',
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3e635',
  },
  checkButtonDone: {
    backgroundColor: '#a3e635',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
