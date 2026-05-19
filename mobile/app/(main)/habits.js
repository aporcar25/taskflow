import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habitos');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  const completeHabit = async (id) => {
    try {
      await api.post(`/habitos/${id}/completar`);
      fetchHabits();
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el hábito');
    }
  };

  const isCompletedToday = (historial) => {
    if (!historial || historial.length === 0) return false;
    const today = new Date().toDateString();
    return historial.some(fecha => new Date(fecha).toDateString() === today);
  };

  const renderHabit = ({ item }) => {
    const completed = isCompletedToday(item.historial);

    return (
      <View style={styles.habitCard}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{item.nombre}</Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={16} color="#f59e0b" />
            <Text style={styles.streakText}>{item.rachaActual} días</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, completed && styles.completedButton]}
          onPress={() => !completed && completeHabit(item._id)}
          disabled={completed}
        >
          <Ionicons
            name={completed ? "checkmark-circle" : "ellipse-outline"}
            size={32}
            color={completed ? "#a3e635" : "#666"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={renderHabit}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={fetchHabits}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes hábitos configurados</Text>
            <Text style={styles.emptySubtext}>Configúralos en la versión web</Text>
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
  listContent: {
    padding: 20,
  },
  habitCard: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#f59e0b',
    marginLeft: 5,
    fontWeight: '600',
  },
  completeButton: {
    padding: 5,
  },
  completedButton: {
    opacity: 1,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  }
});
