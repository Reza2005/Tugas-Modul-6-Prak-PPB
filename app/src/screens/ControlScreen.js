// app/src/screens/ControlScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import simpleAuth from '../auth/simpleAuth';
import api from '../services/api';

export default function ControlScreen({ navigation }) {
  const [user, setUser] = useState(null);

  // Perbaikan: Menggunakan listener 'focus' untuk me-refresh status login
  useEffect(() => {
    // Dijalankan pertama kali untuk inisialisasi user
    setUser(simpleAuth.getUser()); //

    // Listener ini akan dijalankan setiap kali layar ControlScreen 
    // kembali menjadi fokus (misalnya setelah kembali dari LoginScreen)
    const unsubscribe = navigation.addListener('focus', () => {
      setUser(simpleAuth.getUser());
    });

    // Cleanup: hapus listener saat komponen dilepas
    return unsubscribe;
  }, [navigation]); // Dependensi [navigation] diperlukan

  const doControl = async () => {
    const token = simpleAuth.getToken(); //
    if (!token) {
      Alert.alert('Akses Ditolak', 'Hanya pengguna yang login dapat mengirim perintah. Silakan login dulu.');
      return;
    }

    try {
      const res = await api.post('/control/do', { action: 'toggle', ts: new Date().toISOString() }); //
      Alert.alert('Perintah Terkirim', JSON.stringify(res));
    } catch (err) {
      console.error('control error', err);
      Alert.alert('Error', err?.body?.error || JSON.stringify(err));
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize:18, fontWeight:'bold' }}>Control</Text>
      <Text>Hanya pengguna yang login dapat mengirim perintah kontrol.</Text>
      <View style={{ height:12 }} />
      <Button title={user ? `Kirim Perintah (sebagai ${user.name})` : 'Login untuk Mengontrol'} onPress={() => {
        if (!user) return navigation.navigate('Login');
        doControl();
      }} />
    </View>
  );
}