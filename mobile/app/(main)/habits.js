import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const HabitItem = ({ item, onComplete, onDelete }) => {
  const completed = isCompletedToday(item.historial);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (completed) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start(() => onComplete(item._id));
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });
    return (
      <TouchableOpacity onPress={() => onDelete(item._id)} style={styles.deleteAction}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.habitCard}>
        <View style={styles.habitHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.habitEmoji}>{item.icono || '✨'}</Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{item.nombre}</Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#f97316" />
              <Text style={styles.streakText}>{item.rachaActual} días</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handlePress}
            disabled={completed}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={completed ? "checkmark-circle" : "ellipse-outline"}
                size={36}
                color={completed ? "#a3e635" : "#333"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        {renderWeekCalendar(item.historial)}
      </View>
    </Swipeable>
  );
};

const isCompletedToday = (historial) => {
  if (!historial || historial.length === 0) return false;
  const today = new Date().toDateString();
  return historial.some(fecha => new Date(fecha).toDateString() === today);
};

const getDayStatus = (historial, dayOffset) => {
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  const dateStr = date.toDateString();
  return historial.some(fecha => new Date(fecha).toDateString() === dateStr);
};

const renderWeekCalendar = (historial) => {
  const today = new Date();
  let dayOfWeek = today.getDay(); // 0 is Sunday
  if (dayOfWeek === 0) dayOfWeek = 7;

  return (
    <View style={styles.calendar}>
      {DAYS.map((day, index) => {
        const dayNum = index + 1;
        const isToday = dayNum === dayOfWeek;
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

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits');
      const data = response.data;
      setHabits(data);

      if (data.length > 0) {
        const completedCount = data.filter(h => isCompletedToday(h.historial)).length;
        setProgress((completedCount / data.length) * 100);
      } else {
        setProgress(0);
      }
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
      await api.post(`/habits/${id}/completar`);
      fetchHabits();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el hábito');
    }
  };

  const deleteHabit = async (id) => {
    Alert.alert("Eliminar hábito", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await api.delete(`/habits/${id}`);
          fetchHabits();
        } catch (error) {
          Alert.alert('Error', 'No se pudo eliminar');
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso de hoy</Text>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <HabitItem
            item={item}
            onComplete={completeHabit}
            onDelete={deleteHabit}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No tienes hábitos</Text>
            <Text style={styles.emptySubtext}>Crea hábitos para mejorar tu rutina.</Text>
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
  topProgress: {
    padding: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: '#a3e635',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#a3e635',
    borderRadius: 4,
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
  habitEmoji: {
    fontSize: 24,
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
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
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
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 20,
    marginBottom: 20,
    marginLeft: -10,
  }
});
