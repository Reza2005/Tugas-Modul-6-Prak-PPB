// backend/src/models/readingsModel.js (KODE FINAL)

import { supabase } from "../config/supabaseClient.js";

// Ganti TABLE jika nama tabel Anda berbeda
const TABLE = "sensor_readings"; 

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    temperature: row.temperature === null ? null : Number(row.temperature),
    threshold_value: row.threshold_value === null ? null : Number(row.threshold_value),
  };
}

export const ReadingsModel = {
  // Fungsi yang dipanggil oleh simulator (POST /api/readings)
  async create(payload) {
    const { temperature, threshold_value } = payload;
    
    if (typeof temperature !== "number" || typeof threshold_value !== "number") {
      throw new Error("temperature and threshold_value must be numbers");
    }

    const row = {
      temperature,
      threshold_value,
      recorded_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select("id, temperature, threshold_value, recorded_at")
      .single();

    if (error) throw error;
    return normalize(data);
  },

  // FUNGSI BARU untuk Pagination (Dipanggil oleh index.js)
  async listWithPagination(page, size) {
    const start = (page - 1) * size;
    const end = start + size - 1; 

    // Mengambil data dan jumlah total (count) secara bersamaan
    const { data, error, count } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, recorded_at", { count: 'exact' })
      .order("recorded_at", { ascending: false })
      .range(start, end); 

    if (error) throw error;

    return {
      data: data.map(normalize),
      total: count,
    };
  },
};