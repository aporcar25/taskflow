import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X } from 'lucide-react-native';

export default function CreateTask() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [categoria, setCategoria] = useState('personal');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!titulo) return;

    setLoading(true);
    try {
      await api.post('/tasks', {
        titulo,
        descripcion,
        prioridad,
        categoria,
      });
      router.back();
    } catch (error) {
      console.error('Error creating task', error);
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { label: 'Alta', value: 'alta', color: '#f87171' },
    { label: 'Media', value: 'media', color: '#fbbf24' },
    { label: 'Baja', value: 'baja', color: '#60a5fa' },
  ];

  const categories = ['trabajo', 'personal', 'salud', 'estudios', 'hogar'];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Tarea</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="¿Qué hay que hacer?"
              placeholderTextColor="#666"
              value={titulo}
              onChangeText={setTitulo}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Añade más detalles..."
              placeholderTextColor="#666"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityBtn,
                    prioridad === p.value && { backgroundColor: p.color, borderColor: p.color }
                  ]}
                  onPress={() => setPrioridad(p.value)}
                >
                  <Text style={[
                    styles.priorityBtnText,
                    prioridad === p.value && { color: '#0a0a0a' }
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoryRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.categoryBtn,
                    categoria === c && styles.categoryBtnActive
                  ]}
                  onPress={() => setCategoria(c)}
                >
                  <Text style={[
                    styles.categoryBtnText,
                    categoria === c && styles.categoryBtnTextActive
                  ]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, !titulo && styles.submitButtonDisabled]}
            onPress={handleCreate}
            disabled={loading || !titulo}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.submitButtonText}>Crear Tarea</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    backgroundColor: '#171717',
  },
  priorityBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#171717',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryBtnActive: {
    backgroundColor: 'rgba(163, 230, 53, 0.2)',
    borderColor: '#a3e635',
  },
  categoryBtnText: {
    color: '#9ca3af',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  categoryBtnTextActive: {
    color: '#a3e635',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#a3e635',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
