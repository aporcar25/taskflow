import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('media');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/tasks', {
        titulo: newTitle,
        prioridad: newPriority,
        estado: 'pendiente'
      });
      setNewTitle('');
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

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTask(item._id, item.estado)}
      >
        <Ionicons
          name={item.estado === 'completada' ? "checkbox" : "square-outline"}
          size={24}
          color={item.estado === 'completada' ? "#a3e635" : "#666"}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.estado === 'completada' && styles.completedText]}>
          {item.titulo}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: item.prioridad === 'alta' ? '#ef444422' : item.prioridad === 'media' ? '#f59e0b22' : '#3b82f622' }]}>
          <Text style={[styles.priorityText, { color: item.prioridad === 'alta' ? '#ef4444' : item.prioridad === 'media' ? '#f59e0b' : '#3b82f6' }]}>
            {item.prioridad}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item._id)}>
        <Ionicons name="trash-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={fetchTasks}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay tareas pendientes</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#0a0a0a" />
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
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <View style={styles.prioritySelector}>
              {['baja', 'media', 'alta'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityOption, newPriority === p && styles.priorityOptionSelected]}
                  onPress={() => setNewPriority(p)}
                >
                  <Text style={[styles.priorityOptionText, newPriority === p && styles.priorityOptionTextSelected]}>
                    {p}
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
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateTask}
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
    borderRadius: 12,
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
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
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
    fontSize: 16,
    marginBottom: 20,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  priorityOptionSelected: {
    backgroundColor: '#a3e63522',
    borderColor: '#a3e635',
  },
  priorityOptionText: {
    color: '#999',
    textTransform: 'capitalize',
  },
  priorityOptionTextSelected: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#a3e635',
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
});
