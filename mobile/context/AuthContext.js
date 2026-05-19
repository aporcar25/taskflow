import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useRouter, useSegments } from 'expo-router';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login' || segments[0] === 'register';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  async function loadStorageData() {
    try {
      const authDataSerialized = await AsyncStorage.getItem('taskflow_user');
      if (authDataSerialized) {
        const _authData = JSON.parse(authDataSerialized);
        setUser(_authData);
      }
    } catch (error) {
      console.error('Error loading auth data', error);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      await AsyncStorage.setItem('taskflow_token', token);
      await AsyncStorage.setItem('taskflow_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return {
        success: false,
        message: error.response?.data?.mensaje || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (nombre, email, password) => {
    try {
      const response = await api.post('/auth/register', { nombre, email, password });
      const { token, user: userData } = response.data;

      await AsyncStorage.setItem('taskflow_token', token);
      await AsyncStorage.setItem('taskflow_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Register error', error);
      return {
        success: false,
        message: error.response?.data?.mensaje || 'Error al registrarse'
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('taskflow_token');
    await AsyncStorage.removeItem('taskflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
