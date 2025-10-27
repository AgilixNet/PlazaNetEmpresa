import { supabase } from '../supabaseClient';

export const arrendamientosService = {
  // Obtener todos los arrendamientos
  async getAll() {
    const { data, error } = await supabase
      .from('arrendamientos')
      .select(`
        *,
        local:locales (
          id,
          nombre,
          ubicacion,
          estado
        ),
        arrendador:perfiles!arrendador_id (
          id,
          nombre
        )
      `)
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener arrendamiento por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('arrendamientos')
      .select(`
        *,
        local:locales (
          id,
          nombre,
          ubicacion,
          estado,
          precio_mensual
        ),
        arrendador:perfiles!arrendador_id (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener arrendamientos activos
  async getActivos() {
    const { data, error } = await supabase
      .from('arrendamientos')
      .select(`
        *,
        local:locales (
          id,
          nombre,
          ubicacion
        ),
        arrendador:perfiles!arrendador_id (
          id,
          nombre
        )
      `)
      .eq('estado', 'activo')
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener arrendamientos por arrendador
  async getByArrendador(arrendadorId) {
    const { data, error } = await supabase
      .from('arrendamientos')
      .select(`
        *,
        local:locales (
          id,
          nombre,
          ubicacion,
          estado
        )
      `)
      .eq('arrendador_id', arrendadorId)
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener arrendamientos por local
  async getByLocal(localId) {
    const { data, error } = await supabase
      .from('arrendamientos')
      .select(`
        *,
        arrendador:perfiles!arrendador_id (
          id,
          nombre
        )
      `)
      .eq('local_id', localId)
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Crear arrendamiento
  async create(arrendamientoData) {
    // Iniciar transacción: crear arrendamiento y actualizar estado del local
    const { data: arrendamiento, error: arrendamientoError } = await supabase
      .from('arrendamientos')
      .insert([{
        ...arrendamientoData,
        estado: 'activo'
      }])
      .select()
      .single();
    
    if (arrendamientoError) throw arrendamientoError;

    // Actualizar estado del local a ocupado
    const { error: localError } = await supabase
      .from('locales')
      .update({ 
        estado: 'ocupado',
        arrendador_id: arrendamientoData.arrendador_id 
      })
      .eq('id', arrendamientoData.local_id);

    if (localError) throw localError;

    return arrendamiento;
  },

  // Actualizar arrendamiento
  async update(id, updates) {
    const { data, error } = await supabase
      .from('arrendamientos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Finalizar arrendamiento
  async finalizar(id) {
    // Obtener el arrendamiento para saber qué local liberar
    const { data: arrendamiento, error: getError } = await supabase
      .from('arrendamientos')
      .select('local_id')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Actualizar estado del arrendamiento
    const { data, error: updateError } = await supabase
      .from('arrendamientos')
      .update({ 
        estado: 'cancelado',
        fecha_fin: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;

    // Liberar el local
    const { error: localError } = await supabase
      .from('locales')
      .update({ 
        estado: 'disponible',
        arrendador_id: null 
      })
      .eq('id', arrendamiento.local_id);

    if (localError) throw localError;

    return data;
  },

  // Eliminar arrendamiento
  async delete(id) {
    const { error } = await supabase
      .from('arrendamientos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Obtener estadísticas de arrendamientos
  async getEstadisticas() {
    const { data: todos, error } = await supabase
      .from('arrendamientos')
      .select('estado, valor_mensual');
    
    if (error) throw error;

    const stats = {
      total: todos.length,
      activos: todos.filter(a => a.estado === 'activo').length,
      vencidos: todos.filter(a => a.estado === 'vencido').length,
      cancelados: todos.filter(a => a.estado === 'cancelado').length,
      ingresosMensuales: todos
        .filter(a => a.estado === 'activo')
        .reduce((sum, a) => sum + (a.valor_mensual || 0), 0)
    };

    return stats;
  },

  // Verificar arrendamientos vencidos
  async verificarVencidos() {
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('arrendamientos')
      .update({ estado: 'vencido' })
      .eq('estado', 'activo')
      .lt('fecha_fin', hoy)
      .select();
    
    if (error) throw error;
    return data;
  }
};