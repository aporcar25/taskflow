import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storageUser = await AsyncStorage.getItem('taskflow_user');
      const storageToken = await AsyncStorage.getItem('taskflow_token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
        api.defaults.headers.Authorization = `Bearer ${storageToken}`;
      }
    } catch (e) {
      console.error('Error loading storage data', e);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      const userToSave = { ...userData, foto: null };

      await AsyncStorage.setItem('taskflow_token', token);
      await AsyncStorage.setItem('taskflow_user', JSON.stringify(userToSave));

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userToSave);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (nombre, email, password) => {
    try {
      const response = await api.post('/auth/register', { nombre, email, password });
      const { token, user: userData } = response.data;

      const userToSave = { ...userData, foto: null };

      await AsyncStorage.setItem('taskflow_token', token);
      await AsyncStorage.setItem('taskflow_user', JSON.stringify(userToSave));

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userToSave);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al registrarse',
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['taskflow_token', 'taskflow_user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);