// app/src/screens/MonitoringScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function MonitoringScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const size = 10; // page size
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/readings?page=${p}&size=${size}`);
      if (res && res.data) {
        setData(res.data);
        setTotal(res.total || 0);
        setPage(res.page || p);
      } else if (Array.isArray(res)) {
        // fallback if backend returns array
        setData(res);
        setTotal(res.length);
        setPage(p);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Fetch readings error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const hasNext = page * size < total;
  const hasPrev = page > 1;

  return (
    <View style={{ flex:1, padding: 12 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontSize:18, fontWeight:'bold' }}>Monitoring</Text>
        <View style={{ flexDirection:'row', gap:8 }}>
          <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
          <Button title="Control" onPress={() => navigation.navigate('Control')} />
        </View>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop:12 }} /> : (
        <FlatList
          style={{ marginTop:12 }}
          data={data}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={({ item }) => (
            <View style={{ padding:8, borderBottomWidth:1 }}>
              <Text>id: {item.id} | sensor: {item.sensor} | value: {item.value}</Text>
              <Text style={{ fontSize:11, color:'#555' }}>{item.ts}</Text>
            </View>
          )}
          ListEmptyComponent={() => <Text>{loading ? 'Loading...' : 'Tidak ada data'}</Text>}
        />
      )}

      <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:12 }}>
        <Button title="Sebelumnya" onPress={() => fetchPage(page - 1)} disabled={!hasPrev} />
        <Text style={{ alignSelf:'center' }}>Halaman {page} / {Math.max(1, Math.ceil(total/size))}</Text>
        <Button title="Berikutnya" onPress={() => fetchPage(page + 1)} disabled={!hasNext} />
      </View>
    </View>
  );
}
