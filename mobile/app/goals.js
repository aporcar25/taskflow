import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, Animated } from 'react-native';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

const ProgressBar = ({ progress, color }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(progress, 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressBarBg}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }),
            backgroundColor: color
          }
        ]}
      />
    </View>
  );
};

export default function Goals() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [unidad, setUnidad] = useState('');
  const [increment, setIncrement] = useState('1');

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const handleCreateGoal = async () => {
    if (!title.trim() || !meta.trim() || !unidad.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    try {
      await api.post('/goals', {
        titulo: title,
        meta: parseInt(meta),
        unidad,
        color: '#a3e635'
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
      Alert.alert('Error', 'Error al actualizar progreso');
    }
  };

  const deleteGoal = (id) => {
    Alert.alert("Eliminar", "¿Seguro?", [
      { text: "No" },
      { text: "Sí", style: "destructive", onPress: async () => {
        await api.delete(`/goals/${id}`);
        fetchGoals();
      }}
    ]);
  };

  const renderGoal = ({ item }) => {
    const progressPercent = (item.progreso / item.meta) * 100;
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
          <Text style={styles.goalCount}>{item.progreso} / {item.meta} {item.unidad}</Text>
        </View>
        <ProgressBar progress={progressPercent} color={item.color || '#a3e635'} />
        <Text style={styles.percentText}>{Math.round(progressPercent)}% completado</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#a3e635" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Objetivos Semanales</Text>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item._id}
        renderItem={renderGoal}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={fetchGoals}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="target" size={60} color="#333" />
            <Text style={styles.emptyText}>Sin objetivos esta semana</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#0a0a0a" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Objetivo</Text>
            <TextInput
              style={styles.input}
              placeholder="¿Qué quieres lograr?"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Meta (ej: 10)"
                placeholderTextColor="#666"
                value={meta}
                onChangeText={setMeta}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Unidad (ej: km)"
                placeholderTextColor="#666"
                value={unidad}
                onChangeText={setUnidad}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateGoal}>
              <Text style={styles.saveBtnText}>Crear Objetivo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={progressModalVisible}>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.smallModal}>
            <Text style={styles.modalTitle}>Sumar Progreso</Text>
            <Text style={styles.selectedGoalTitle}>{selectedGoal?.titulo}</Text>
            <TextInput
              style={styles.incInput}
              value={increment}
              onChangeText={setIncrement}
              keyboardType="numeric"
              textAlign="center"
              autoFocus
            />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleUpdateProgress}>
                <Text style={styles.saveBtnText}>Sumar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setProgressModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cerrar</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a1a1a',
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  goalCount: {
    color: '#a3e635',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentText: {
    color: '#666',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
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
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    marginTop: 15,
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
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  smallModal: {
    backgroundColor: '#1a1a1a',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  selectedGoalTitle: {
    color: '#a3e635',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#a3e635',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: '#999',
  },
  incInput: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    width: 100,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
  }
});
