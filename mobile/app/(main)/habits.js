import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habitos');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      Alert.alert('Error', 'No se pudieron cargar los hábitos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  };

  const completeHabit = async (id) => {
    try {
      await api.post(`/habitos/${id}/completar`);
      fetchHabits();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el hábito');
    }
  };

  const isCompletedToday = (historial) => {
    if (!historial || historial.length === 0) return false;
    const today = new Date().toDateString();
    return historial.some(fecha => new Date(fecha).toDateString() === today);
  };

  const getDayStatus = (historial, dayOffset) => {
    // dayOffset 0 = today, 1 = yesterday, etc.
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toDateString();
    return historial.some(fecha => new Date(fecha).toDateString() === dateStr);
  };

  const renderWeekCalendar = (historial) => {
    const today = new Date();
    let dayOfWeek = today.getDay(); // 0 is Sunday
    if (dayOfWeek === 0) dayOfWeek = 7; // Make Sunday 7

    return (
      <View style={styles.calendar}>
        {DAYS.map((day, index) => {
          const dayNum = index + 1;
          const isToday = dayNum === dayOfWeek;

          // Calculate if this day in the current week was completed
          const diff = dayOfWeek - dayNum;
          const completed = diff >= 0 ? getDayStatus(historial, diff) : false;

          return (
            <View key={index} style={styles.dayCol}>
              <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
              <View style={[
                styles.dayDot,
                completed && styles.dayDotCompleted,
                isToday && !completed && styles.dayDotToday
              ]}>
                {completed && <Ionicons name="checkmark" size={10} color="#0a0a0a" />}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderHabit = ({ item }) => {
    const completed = isCompletedToday(item.historial);

    return (
      <View style={styles.habitCard}>
        <View style={styles.habitHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={24} color="#a3e635" />
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{item.nombre}</Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#f97316" />
              <Text style={styles.streakText}>{item.rachaActual} días</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.checkButton, completed && styles.checkButtonCompleted]}
            onPress={() => completeHabit(item._id)}
          >
            <Ionicons
              name={completed ? "checkmark-circle" : "ellipse-outline"}
              size={36}
              color={completed ? "#a3e635" : "#333"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {renderWeekCalendar(item.historial)}
      </View>
    );
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
      <FlatList
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={renderHabit}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No tienes hábitos configurados</Text>
            <Text style={styles.emptySubtext}>Los hábitos te ayudan a crear rutinas positivas.</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 20,
  },
  habitCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#a3e63515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#f97316',
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 14,
  },
  checkButton: {
    marginLeft: 10,
  },
  checkButtonCompleted: {
    // Optional styles for completed state
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  todayText: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  dayDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotCompleted: {
    backgroundColor: '#a3e635',
  },
  dayDotToday: {
    borderWidth: 1,
    borderColor: '#a3e635',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  }
});
