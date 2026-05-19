import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import api from '../../services/api';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Flag } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/tasks/${id}/complete`, { completada: !currentStatus });
      setTasks(tasks.map(t => t._id === id ? response.data : t));
    } catch (error) {
      console.error('Error toggling task', error);
    }
  };

  const deleteTask = async (id) => {
    Alert.alert(
      "Eliminar tarea",
      "¿Estás seguro de que quieres eliminar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/tasks/${id}`);
              setTasks(tasks.filter(t => t._id !== id));
            } catch (error) {
              console.error('Error deleting task', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTask(item._id, item.completada)}
      >
        {item.completada ? (
          <CheckCircle2 size={24} color="#a3e635" />
        ) : (
          <Circle size={24} color="#404040" />
        )}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.completada && styles.completedText]}>
          {item.titulo}
        </Text>

        <View style={styles.taskFooter}>
          {item.fechaLimite && (
            <View style={styles.metaItem}>
              <Calendar size={12} color="#6b7280" />
              <Text style={styles.metaText}>
                {new Date(item.fechaLimite).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Flag size={12} color={getPriorityColor(item.prioridad)} />
            <Text style={[styles.metaText, { color: getPriorityColor(item.prioridad) }]}>
              {item.prioridad}
            </Text>
          </View>

          <Text style={styles.categoryBadge}>{item.categoria}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.deleteButton}>
        <Trash2 size={18} color="#4b5563" />
      </TouchableOpacity>
    </View>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#f87171';
      case 'media': return '#fbbf24';
      case 'baja': return '#60a5fa';
      default: return '#9ca3af';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tareas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-task')}
        >
          <Plus size={24} color="#0a0a0a" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes tareas pendientes</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#a3e635',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  checkbox: {
    marginRight: 15,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  categoryBadge: {
    fontSize: 10,
    color: '#a3e635',
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
});
