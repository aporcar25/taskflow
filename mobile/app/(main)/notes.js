import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const NOTE_COLORS = [
  '#1a1a1a', // Default dark
  '#1a2a1a', // Greenish
  '#1a1a2a', // Bluish
  '#2a1a1a', // Reddish
  '#1a2a2a', // Cyanish
  '#2a2a1a', // Yellowish
];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [fijada, setFijada] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      // Sort pinned notes first
      const sortedNotes = response.data.sort((a, b) => {
        if (a.fijada === b.fijada) return new Date(b.updatedAt) - new Date(a.updatedAt);
        return a.fijada ? -1 : 1;
      });
      setNotes(sortedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'No se pudieron cargar las notas');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor(NOTE_COLORS[0]);
    setFijada(false);
    setModalVisible(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setTitle(note.titulo);
    setContent(note.contenido);
    setColor(note.color || NOTE_COLORS[0]);
    setFijada(note.fijada || false);
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'La nota no puede estar vacía');
      return;
    }

    try {
      const noteData = {
        titulo: title,
        contenido: content,
        color,
        fijada
      };

      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, noteData);
      } else {
        await api.post('/notes', noteData);
      }
      setModalVisible(false);
      fetchNotes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la nota');
    }
  };

  const deleteNote = async (id) => {
    Alert.alert(
      "Eliminar nota",
      "¿Estás seguro de que quieres eliminar esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/notes/${id}`);
              fetchNotes();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la nota');
            }
          }
        }
      ]
    );
  };

  const togglePin = async (id) => {
    try {
      await api.patch(`/notes/${id}/pin`);
      fetchNotes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo destacar la nota');
    }
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={[styles.noteCard, { backgroundColor: item.color || '#1a1a1a' }]}
      onLongPress={() => deleteNote(item._id)}
      onPress={() => openEditModal(item)}
    >
      <View style={styles.noteHeader}>
        {item.fijada && <Ionicons name="pin" size={16} color="#a3e635" style={styles.pinIcon} />}
        <Text style={styles.noteTitle} numberOfLines={1}>{item.titulo || 'Sin título'}</Text>
      </View>
      <Text style={styles.noteContent} numberOfLines={4}>
        {item.contenido}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity onPress={() => togglePin(item._id)}>
          <Ionicons name={item.fijada ? "pin" : "pin-outline"} size={18} color={item.fijada ? "#a3e635" : "#666"} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        data={notes}
        keyExtractor={(item) => item._id}
        renderItem={renderNote}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No tienes notas</Text>
            <Text style={styles.emptySubtext}>Anota tus ideas, planes o recordatorios aquí.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
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
          <View style={[styles.modalContent, { backgroundColor: color }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="chevron-down" size={28} color="#fff" />
              </TouchableOpacity>
              <View style={styles.modalHeaderRight}>
                <TouchableOpacity onPress={() => setFijada(!fijada)} style={styles.headerIcon}>
                  <Ionicons name={fijada ? "pin" : "pin-outline"} size={24} color={fijada ? "#a3e635" : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveNote} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.titleInput}
                placeholder="Título"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={styles.contentInput}
                placeholder="Empieza a escribir..."
                placeholderTextColor="#666"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.colorLabel}>Color de fondo</Text>
              <View style={styles.colorPicker}>
                {NOTE_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorOption,
                      { backgroundColor: c },
                      color === c && styles.colorOptionSelected
                    ]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
              <View style={{ height: 40 }} />
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
    padding: 10,
    paddingBottom: 100,
  },
  noteCard: {
    flex: 1,
    margin: 8,
    padding: 15,
    borderRadius: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinIcon: {
    marginRight: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  noteDate: {
    fontSize: 10,
    color: '#666',
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    height: '90%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 20,
  },
  saveBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  contentInput: {
    fontSize: 16,
    color: '#ccc',
    minHeight: 300,
    lineHeight: 24,
  },
  colorLabel: {
    color: '#999',
    fontSize: 14,
    marginTop: 30,
    marginBottom: 15,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  colorOptionSelected: {
    borderColor: '#fff',
    borderWidth: 2,
  },
});
