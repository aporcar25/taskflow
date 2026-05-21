import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const CATEGORIES = [
  { label: 'Personal', value: 'personal', emoji: '👤' },
  { label: 'Trabajo', value: 'trabajo', emoji: '💼' },
  { label: 'Salud', value: 'salud', emoji: '❤️' },
  { label: 'Hogar', value: 'hogar', emoji: '🏠' },
  { label: 'Estudios', value: 'estudios', emoji: '📚' },
];

const PRIORITIES = [
  { label: 'Baja', value: 'baja', color: '#3b82f6' },
  { label: 'Media', value: 'media', color: '#f59e0b' },
  { label: 'Alta', value: 'alta', color: '#ef4444' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    try {
      await api.post('/tasks', {
        titulo: title,
        descripcion: description,
        prioridad: priority,
        categoria: category,
        fechaVencimiento: dueDate || null,
        estado: 'pendiente'
      });
      setTitle('');
      setDescription('');
      setPriority('media');
      setCategory('personal');
      setDueDate('');
      setModalVisible(false);
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la tarea');
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const nuevoEstado = currentStatus === 'completada' ? 'pendiente' : 'completada';
      await api.put(`/tasks/${id}`, { estado: nuevoEstado });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
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
              fetchTasks();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          }
        }
      ]
    );
  };

  const getDueDateBadge = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let color = '#a3e635'; // green (ok)
    if (diffDays < 0) color = '#ef4444'; // red (overdue)
    else if (diffDays <= 2) color = '#f97316'; // orange (near)
    else if (diffDays <= 7) color = '#f59e0b'; // yellow (soon)

    return (
      <View style={[styles.dateBadge, { backgroundColor: color + '22' }]}>
        <Ionicons name="calendar-outline" size={12} color={color} />
        <Text style={[styles.dateBadgeText, { color }]}>
          {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </Text>
      </View>
    );
  };

  const renderTask = ({ item }) => {
    const cat = CATEGORIES.find(c => c.value === item.categoria) || CATEGORIES[0];
    const prioColor = PRIORITIES.find(p => p.value === item.prioridad)?.color || '#3b82f6';

    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTask(item._id, item.estado)}
        >
          <Ionicons
            name={item.estado === 'completada' ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={item.estado === 'completada' ? "#a3e635" : "#666"}
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, item.estado === 'completada' && styles.completedText]}>
              {item.titulo}
            </Text>
            <View style={[styles.priorityLine, { backgroundColor: prioColor }]} />
          </View>

          <View style={styles.taskFooter}>
            <Text style={styles.categoryBadge}>{cat.emoji} {cat.label}</Text>
            {getDueDateBadge(item.fechaVencimiento)}
          </View>
        </View>

        <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
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
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No hay tareas pendientes</Text>
            <Text style={styles.emptySubtext}>¡Añade una nueva tarea para empezar!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#0a0a0a" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="¿Qué tienes que hacer?"
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Añade más detalles..."
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.selector}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.option, priority === p.value && { borderColor: p.color, backgroundColor: p.color + '22' }]}
                    onPress={() => setPriority(p.value)}
                  >
                    <Text style={[styles.optionText, priority === p.value && { color: p.color, fontWeight: 'bold' }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categorySelector}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.catOption, category === c.value && styles.catOptionSelected]}
                    onPress={() => setCategory(c.value)}
                  >
                    <Text style={styles.catEmoji}>{c.emoji}</Text>
                    <Text style={[styles.catLabel, category === c.value && styles.catLabelSelected]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Fecha de Vencimiento (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2025-12-31"
                placeholderTextColor="#666"
                value={dueDate}
                onChangeText={setDueDate}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateTask}
              >
                <Text style={styles.saveButtonText}>Crear Tarea</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  checkbox: {
    marginRight: 15,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  priorityLine: {
    width: 30,
    height: 4,
    borderRadius: 2,
    marginLeft: 10,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateBadgeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  deleteBtn: {
    padding: 5,
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#a3e635',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#a3e635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  option: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  optionText: {
    color: '#666',
    fontSize: 14,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  catOptionSelected: {
    borderColor: '#a3e635',
    backgroundColor: '#a3e63511',
  },
  catEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  catLabel: {
    color: '#666',
    fontSize: 13,
  },
  catLabelSelected: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#a3e635',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
