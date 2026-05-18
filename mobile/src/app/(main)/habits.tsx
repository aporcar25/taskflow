import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import api from '@/services/api';
import { Flame, CheckCircle2, Circle } from 'lucide-react-native';

export default function HabitsScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  }, []);

  const toggleHabit = async (habit: any) => {
    try {
      const response = await api.patch(`/habits/${habit._id}/check`);
      setHabits(habits.map(h => h._id === habit._id ? response.data : h));
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el hábito');
    }
  };

  const HabitItem = ({ item }: { item: any }) => (
    <View style={styles.habitCard}>
      <View style={styles.habitInfo}>
        <View style={styles.iconContainer}>
          <Text style={styles.habitIcon}>{item.icono || '🌟'}</Text>
        </View>
        <View>
          <Text style={styles.habitName}>{item.nombre}</Text>
          <View style={styles.streakRow}>
            <Flame size={14} color="#f97316" />
            <Text style={styles.streakText}>{item.racha} días de racha</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkButton, item.completadoHoy && styles.checkButtonActive]}
        onPress={() => toggleHabit(item)}
      >
        {item.completadoHoy ? (
          <CheckCircle2 size={28} color="#0a0a0a" />
        ) : (
          <Circle size={28} color="#a3e635" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Hábitos</Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <HabitItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes hábitos configurados</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  habitCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitIcon: {
    fontSize: 24,
  },
  habitName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    color: '#666',
    fontSize: 12,
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#a3e635',
  },
  checkButtonActive: {
    backgroundColor: '#a3e635',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});
