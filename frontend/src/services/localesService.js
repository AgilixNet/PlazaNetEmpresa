import { supabase } from '../supabaseClient';

export const localesService = {
  // Obtener todos los locales
  async getAll() {
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener local por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener locales con información de arrendamiento
  async getWithArrendatario() {
    const { data, error } = await supabase
      .from('locales')
      .select(`
        *,
        arriendos (
          id,
          fecha_inicio,
          fecha_fin,
          estado,
          arrendador_id,
          perfiles:arrendador_id (
            id,
            nombre
          )
        )
      `)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener locales disponibles
  async getDisponibles() {
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .eq('estado', 'disponible')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener locales de un arrendador específico
  async getByArrendador(arrendadorId) {
    const { data, error } = await supabase
      .from('locales')
      .select(`
        *,
        arriendos!inner (
          id,
          fecha_inicio,
          fecha_fin,
          estado,
          valor_mensual
        )
      `)
      .eq('arrendador_id', arrendadorId)
      .eq('arriendos.estado', 'activo');
    
    if (error) throw error;
    return data;
  },

  // Crear local
  async create(localData) {
    const { data, error } = await supabase
      .from('locales')
      .insert([localData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar local
  async update(id, updates) {
    const { data, error } = await supabase
      .from('locales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar local
  async delete(id) {
    const { error } = await supabase
      .from('locales')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Cambiar estado del local
  async cambiarEstado(id, nuevoEstado) {
    return this.update(id, { estado: nuevoEstado });
  },

  // Obtener estadísticas de locales
  async getEstadisticas() {
    const { data: locales, error } = await supabase
      .from('locales')
      .select('estado');
    
    if (error) throw error;

    const stats = {
      total: locales.length,
      disponibles: locales.filter(l => l.estado === 'disponible').length,
      ocupados: locales.filter(l => l.estado === 'ocupado').length,
      mantenimiento: locales.filter(l => l.estado === 'mantenimiento').length,
    };

    return stats;
  }
};