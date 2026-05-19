import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';
import { Flame, CheckCircle2, Circle, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHabits();
  };

  const toggleHabit = async (id) => {
    try {
      const response = await api.patch(`/habits/${id}/check`);
      setHabits(habits.map(h => h._id === id ? response.data : h));
    } catch (error) {
      console.error('Error toggling habit', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.habitCard}>
      <View style={styles.habitMain}>
        <Text style={styles.habitIcon}>{item.icono || '🌟'}</Text>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{item.nombre}</Text>
          <View style={styles.streakInfo}>
            <Flame size={14} color={item.racha > 0 ? '#a3e635' : '#6b7280'} fill={item.racha > 0 ? '#a3e635' : 'transparent'} />
            <Text style={[styles.streakText, item.racha > 0 && styles.activeStreak]}>
              {item.racha} días de racha
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkButton, item.completadoHoy && styles.checkedButton]}
        onPress={() => toggleHabit(item._id)}
      >
        {item.completadoHoy ? (
          <CheckCircle2 size={24} color="#0a0a0a" />
        ) : (
          <Circle size={24} color="#a3e635" />
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Hábitos</Text>
      </View>

      <FlatList
        data={habits}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No has creado ningún hábito todavía</Text>
        }
      />
    </SafeAreaView>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#171717',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  habitMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  activeStreak: {
    color: '#a3e635',
    fontWeight: '500',
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedButton: {
    backgroundColor: '#a3e635',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
});
