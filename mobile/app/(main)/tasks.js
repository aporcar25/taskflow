import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Tag } from 'lucide-react-native';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New task form state
  const [titulo, setTitulo] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [categoria, setCategoria] = useState('personal');

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleToggleTask = async (id, currentStatus) => {
    try {
      await api.patch(`/tasks/${id}/complete`, { completada: !currentStatus });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  const handleDeleteTask = async (id) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tasks/${id}`);
              fetchTasks();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          }
        }
      ]
    );
  };

  const handleCreateTask = async () => {
    if (!titulo) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      await api.post('/tasks', {
        titulo,
        prioridad,
        categoria,
        estado: 'pendiente'
      });
      setModalVisible(false);
      setTitulo('');
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la tarea');
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#666';
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
        {tasks.length > 0 ? (
          tasks.map(task => (
            <View key={task._id} style={styles.taskCard}>
              <TouchableOpacity
                style={styles.checkArea}
                onPress={() => handleToggleTask(task._id, task.completada)}
              >
                {task.completada ? (
                  <CheckCircle2 size={24} color="#a3e635" />
                ) : (
                  <Circle size={24} color="#666" />
                )}
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.completada && styles.taskTitleDone]}>
                  {task.titulo}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.prioridad) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(task.prioridad) }]}>
                      {task.prioridad}
                    </Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Tag size={10} color="#666" />
                    <Text style={styles.categoryText}>{task.categoria}</Text>
                  </View>
                  {task.fechaLimite && (
                    <View style={styles.dateBadge}>
                      <Calendar size={10} color="#666" />
                      <Text style={styles.dateText}>
                        {new Date(task.fechaLimite).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTask(task._id)}
              >
                <Trash2 size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CheckCircle2 size={60} color="#1a1a1a" />
            <Text style={styles.emptyText}>No tienes tareas pendientes</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Plus color="#0a0a0a" size={30} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>

            <TextInput
              style={styles.input}
              placeholder="¿Qué tienes que hacer?"
              placeholderTextColor="#666"
              value={titulo}
              onChangeText={setTitulo}
              autoFocus
            />

            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.pickerRow}>
              {['baja', 'media', 'alta'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.pickerItem, prioridad === p && styles.pickerItemActive]}
                  onPress={() => setPrioridad(p)}
                >
                  <Text style={[styles.pickerText, prioridad === p && styles.pickerTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerRow}>
              {['personal', 'trabajo', 'estudios', 'hogar'].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pickerItem, categoria === c && styles.pickerItemActive]}
                  onPress={() => setCategoria(c)}
                >
                  <Text style={[styles.pickerText, categoria === c && styles.pickerTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateTask}
              >
                <Text style={styles.createButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  checkArea: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 5,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#a3e635',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  pickerItemActive: {
    borderColor: '#a3e635',
    backgroundColor: '#a3e63510',
  },
  pickerText: {
    color: '#666',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  pickerTextActive: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#a3e635',
  },
  createButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
});
