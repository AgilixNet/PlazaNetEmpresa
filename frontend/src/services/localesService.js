import { supabase } from '../supabaseClient';

export const localesService = {
  // Obtener todos los locales
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error en getAll locales:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Exception en getAll:', error);
      return [];
    }
  },

  // Obtener local por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en getById:', error);
      return null;
    }
  },

  // Obtener locales disponibles (sin arrendador)
  async getDisponibles() {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('*')
        .is('arrendador_id', null)
        .eq('estado', 'disponible')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error en getDisponibles:', error);
      return [];
    }
  },

  // Obtener locales ocupados
  async getOcupados() {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('*')
        .eq('estado', 'ocupado')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error en getOcupados:', error);
      return [];
    }
  },

  // Buscar locales
  async buscar(termino) {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('*')
        .or(`nombre.ilike.%${termino}%,ubicacion.ilike.%${termino}%`)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error en buscar:', error);
      return [];
    }
  },

  // Crear local
  async create(localData) {
    try {
      const { data, error } = await supabase
        .from('locales')
        .insert([{
          ...localData,
          estado: 'disponible',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar local
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('locales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar local
  async delete(id) {
    try {
      const { error } = await supabase
        .from('locales')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Asignar arrendador a un local
  async asignarArrendador(localId, arrendadorId) {
    try {
      const { data, error } = await supabase
        .from('locales')
        .update({
          arrendador_id: arrendadorId,
          estado: 'ocupado'
        })
        .eq('id', localId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en asignarArrendador:', error);
      throw error;
    }
  },

  // Liberar local
  async liberarLocal(localId) {
    try {
      const { data, error } = await supabase
        .from('locales')
        .update({
          arrendador_id: null,
          estado: 'disponible'
        })
        .eq('id', localId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en liberarLocal:', error);
      throw error;
    }
  },

  // Obtener estadísticas - VERSION CORREGIDA
  async getEstadisticas() {
    try {
      console.log('📊 Iniciando getEstadisticas de locales...');
      
      // Query simple sin relaciones
      const { data: todos, error: errorTodos } = await supabase
        .from('locales')
        .select('id, estado, precio_mensu');
      
      if (errorTodos) {
        console.error('❌ Error en query todos:', errorTodos);
        throw errorTodos;
      }

      console.log('✅ Locales obtenidos:', todos);

      if (!todos || todos.length === 0) {
        console.warn('⚠️ No hay locales en la BD');
        return {
          total: 0,
          disponibles: 0,
          ocupados: 0,
          ingresoMensualPotencial: 0
        };
      }

      // Calcular estadísticas
      const disponibles = todos.filter(l => l.estado === 'disponible').length;
      const ocupados = todos.filter(l => l.estado === 'ocupado').length;
      const ingresoMensualPotencial = todos
        .filter(l => l.estado === 'ocupado')
        .reduce((sum, l) => sum + (l.precio_mensu || 0), 0);

      const stats = {
        total: todos.length,
        disponibles: disponibles,
        ocupados: ocupados,
        ingresoMensualPotencial: ingresoMensualPotencial
      };

      console.log('✅ Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error en getEstadisticas:', error);
      // Retornar valores por defecto para no romper la app
      return {
        total: 0,
        disponibles: 0,
        ocupados: 0,
        ingresoMensualPotencial: 0
      };
    }
  }
};