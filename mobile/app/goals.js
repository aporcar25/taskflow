import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // New Goal form state
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [unidad, setUnidad] = useState('');
  const [color, setColor] = useState('#a3e635');

  // Progress update state
  const [increment, setIncrement] = useState('1');

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      Alert.alert('Error', 'No se pudieron cargar los objetivos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  const handleCreateGoal = async () => {
    if (!title.trim() || !meta.trim() || !unidad.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      await api.post('/goals', {
        titulo: title,
        meta: parseInt(meta),
        unidad,
        color
      });
      setTitle('');
      setMeta('');
      setUnidad('');
      setModalVisible(false);
      fetchGoals();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el objetivo');
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedGoal || !increment.trim()) return;

    try {
      await api.patch(`/goals/${selectedGoal._id}/progress`, {
        incremento: parseInt(increment)
      });
      setProgressModalVisible(false);
      fetchGoals();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el progreso');
    }
  };

  const deleteGoal = (id) => {
    Alert.alert(
      "Eliminar objetivo",
      "¿Estás seguro de que quieres eliminar este objetivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/goals/${id}`);
              fetchGoals();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el objetivo');
            }
          }
        }
      ]
    );
  };

  const renderGoal = ({ item }) => {
    const progress = (item.progreso / item.meta) * 100;
    const completed = item.progreso >= item.meta;

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onPress={() => {
          setSelectedGoal(item);
          setIncrement('1');
          setProgressModalVisible(true);
        }}
        onLongPress={() => deleteGoal(item._id)}
      >
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.titulo}</Text>
          <Text style={[styles.goalProgressText, { color: item.color || '#a3e635' }]}>
            {item.progreso} / {item.meta} {item.unidad}
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: item.color || '#a3e635'
              }
            ]}
          />
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.percentText}>{Math.round(progress)}% completado</Text>
          {completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#a3e635" />
              <Text style={styles.completedText}>Completado</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
        data={goals}
        keyExtractor={(item) => item._id}
        renderItem={renderGoal}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="target-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No tienes objetivos semanales</Text>
            <Text style={styles.emptySubtext}>Establece metas para mantenerte motivado.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#0a0a0a" />
      </TouchableOpacity>

      {/* New Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Objetivo Semanal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>¿Qué quieres lograr?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Leer libros, Correr, Meditar..."
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Meta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 5"
                  placeholderTextColor="#666"
                  value={meta}
                  onChangeText={setMeta}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Unidad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: km, pág, min"
                  placeholderTextColor="#666"
                  value={unidad}
                  onChangeText={setUnidad}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateGoal}
            >
              <Text style={styles.saveButtonText}>Crear Objetivo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={progressModalVisible}
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitleSmall}>Actualizar Progreso</Text>
            <Text style={styles.goalTitleSmall}>{selectedGoal?.titulo}</Text>

            <View style={styles.incrementContainer}>
              <TouchableOpacity
                onPress={() => setIncrement(prev => Math.max(1, parseInt(prev || 0) - 1).toString())}
                style={styles.incBtn}
              >
                <Ionicons name="remove" size={24} color="#fff" />
              </TouchableOpacity>

              <TextInput
                style={styles.incInput}
                value={increment}
                onChangeText={setIncrement}
                keyboardType="numeric"
                textAlign="center"
              />

              <TouchableOpacity
                onPress={() => setIncrement(prev => (parseInt(prev || 0) + 1).toString())}
                style={styles.incBtn}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setProgressModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleUpdateProgress}
              >
                <Text style={styles.confirmBtnText}>Sumar</Text>
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  goalProgressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentText: {
    color: '#999',
    fontSize: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a3e63515',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    color: '#a3e635',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
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
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    marginTop: 80,
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
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  smallModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  modalTitleSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  goalTitleSmall: {
    color: '#a3e635',
    fontSize: 14,
    marginBottom: 25,
  },
  label: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
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
  row: {
    flexDirection: 'row',
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
  incrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  incBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    width: 100,
    marginHorizontal: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: '#2a2a2a',
  },
  confirmBtn: {
    backgroundColor: '#a3e635',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
});
