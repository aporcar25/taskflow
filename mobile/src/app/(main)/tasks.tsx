import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, ScrollView
} from 'react-native';
import api from '@/services/api';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Tag } from 'lucide-react-native';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New task form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [categoria, setCategoria] = useState('personal');

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, []);

  const toggleComplete = async (task: any) => {
    try {
      const response = await api.patch(`/tasks/${task._id}/complete`, {
        completada: !task.completada
      });
      setTasks(tasks.map(t => t._id === task._id ? response.data : t));
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  const deleteTask = async (id: string) => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tasks/${id}`);
              setTasks(tasks.filter(t => t._id !== id));
            } catch (error: any) {
              console.error(error);
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          }
        }
      ]
    );
  };

  const createTask = async () => {
    if (!titulo) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      const response = await api.post('/tasks', {
        titulo,
        descripcion,
        prioridad,
        categoria
      });
      setTasks([response.data, ...tasks]);
      setModalVisible(false);
      setTitulo('');
      setDescripcion('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear la tarea');
    }
  };

  const TaskItem = ({ item }: { item: any }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.checkButton}>
        {item.completada ? (
          <CheckCircle size={24} color="#a3e635" />
        ) : (
          <Circle size={24} color="#666" />
        )}
      </TouchableOpacity>

      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, item.completada && styles.taskCompleted]}>
          {item.titulo}
        </Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: '#1a1a1a' }]}>
            <Tag size={12} color="#666" />
            <Text style={styles.badgeText}>{item.categoria}</Text>
          </View>
          <View style={[styles.badge, {
            backgroundColor: item.prioridad === 'alta' ? '#450a0a' :
                             item.prioridad === 'media' ? '#451a03' : '#064e3b'
          }]}>
            <Text style={[styles.badgeText, {
              color: item.prioridad === 'alta' ? '#f87171' :
                     item.prioridad === 'media' ? '#fbbf24' : '#34d399'
            }]}>
              {item.prioridad}
            </Text>
          </View>
          {item.fechaLimite && (
            <View style={styles.badge}>
              <Calendar size={12} color="#666" />
              <Text style={styles.badgeText}>{new Date(item.fechaLimite).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.deleteButton}>
        <Trash2 size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tareas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus color="#0a0a0a" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TaskItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3e635" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes tareas pendientes</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="¿Qué hay que hacer?"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Añade una descripción (opcional)"
                placeholderTextColor="#666"
                multiline
              />

              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.pickerRow}>
                {['baja', 'media', 'alta'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.pickerItem, prioridad === p && styles.pickerItemSelected]}
                    onPress={() => setPrioridad(p)}
                  >
                    <Text style={[styles.pickerText, prioridad === p && styles.pickerTextSelected]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.pickerRow}>
                {['trabajo', 'personal', 'salud', 'hogar'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pickerItem, categoria === c && styles.pickerItemSelected]}
                    onPress={() => setCategoria(c)}
                  >
                    <Text style={[styles.pickerText, categoria === c && styles.pickerTextSelected]}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={createTask}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  taskCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkButton: {
    padding: 4,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    backgroundColor: '#262626',
  },
  badgeText: {
    fontSize: 10,
    color: '#aaa',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#262626',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerItemSelected: {
    backgroundColor: '#a3e63520',
    borderColor: '#a3e635',
  },
  pickerText: {
    color: '#666',
    fontSize: 14,
  },
  pickerTextSelected: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#262626',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#a3e635',
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
