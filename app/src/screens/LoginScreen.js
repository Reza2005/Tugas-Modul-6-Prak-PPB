// app/src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../services/api';
import simpleAuth from '../auth/simpleAuth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      // expected { token, user }
      if (res && res.token) {
        simpleAuth.setAuth(res.token, res.user);
        Alert.alert('Sukses', `Logged in sebagai ${res.user.name}`);
        // go back or to profile
        navigation.goBack();
        return;
      }
      Alert.alert('Login gagal', 'Respons server tidak valid');
    } catch (err) {
      console.error(err);
      const msg = err?.body?.error || err?.message || JSON.stringify(err);
      Alert.alert('Login error', String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Login</Text>

      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none"
        style={{ borderWidth:1, padding:8, marginBottom:12 }} />

      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry
        style={{ borderWidth:1, padding:8, marginBottom:16 }} />

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={doLogin} disabled={loading} />

      <View style={{ height: 12 }} />
      <Button title="Batal" onPress={() => navigation.goBack()} />
    </View>
  );
}