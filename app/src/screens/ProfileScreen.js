// app/src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import simpleAuth from '../auth/simpleAuth';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(simpleAuth.getUser());
  }, []);

  const handleLogout = () => {
    simpleAuth.clearAuth();
    setUser(null);
    navigation.navigate('Monitoring'); // go to monitoring
  };

  if (!user) {
    return (
      <View style={{ padding:16 }}>
        <Text>Kamu belum login.</Text>
        <Button title="Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize:18, fontWeight:'bold' }}>Profil Pengguna</Text>
      <Text>Nama: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <View style={{ height:12 }} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
