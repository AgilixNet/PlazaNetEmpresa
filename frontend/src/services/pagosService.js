import { supabase } from '../supabaseClient';

export const pagosService = {
  // Obtener todos los pagos
  async getAll() {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        arrendamiento:arrendamientos (
          id,
          local_id,
          arrendador_id,
          local:locales (
            id,
            nombre
          ),
          arrendador:perfiles!arrendador_id (
            id,
            nombre
          )
        )
      `)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener pago por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        arrendamiento:arrendamientos (
          id,
          valor_mensual,
          local:locales (
            id,
            nombre
          ),
          arrendador:perfiles!arrendador_id (
            id,
            nombre
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener pagos por arrendamiento
  async getByArrendamiento(arrendamientoId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('arrendamiento_id', arrendamientoId)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener pagos por arrendador
  async getByArrendador(arrendadorId) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        arrendamiento:arrendamientos!inner (
          id,
          arrendador_id,
          local:locales (
            id,
            nombre
          )
        )
      `)
      .eq('arrendamiento.arrendador_id', arrendadorId)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener pagos pendientes
  async getPendientes() {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        arrendamiento:arrendamientos (
          id,
          local:locales (
            id,
            nombre
          ),
          arrendador:perfiles!arrendador_id (
            id,
            nombre
          )
        )
      `)
      .eq('estado', 'pendiente')
      .order('mes', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener pagos por estado
  async getByEstado(estado) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        arrendamiento:arrendamientos (
          id,
          local:locales (
            id,
            nombre
          ),
          arrendador:perfiles!arrendador_id (
            id,
            nombre
          )
        )
      `)
      .eq('estado', estado)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Crear pago
  async create(pagoData) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([{
        ...pagoData,
        fecha_pago: pagoData.fecha_pago || new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Registrar pago (marcar como pagado)
  async registrarPago(id, fechaPago = null) {
    const { data, error } = await supabase
      .from('pagos')
      .update({ 
        estado: 'pagado',
        fecha_pago: fechaPago || new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar pago
  async update(id, updates) {
    const { data, error } = await supabase
      .from('pagos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar pago
  async delete(id) {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Generar pagos mensuales automáticamente para un arrendamiento
  async generarPagosMensuales(arrendamientoId, valorMensual, mesesAGenerar = 12) {
    const pagos = [];
    const fechaActual = new Date();
    
    for (let i = 0; i < mesesAGenerar; i++) {
      const mes = new Date(fechaActual);
      mes.setMonth(fechaActual.getMonth() + i);
      
      pagos.push({
        arrendamiento_id: arrendamientoId,
        mes: mes.getMonth() + 1,
        anio: mes.getFullYear(),
        valor: valorMensual,
        estado: 'pendiente'
      });
    }

    const { data, error } = await supabase
      .from('pagos')
      .insert(pagos)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Obtener estadísticas de pagos
  async getEstadisticas() {
    const { data: todos, error } = await supabase
      .from('pagos')
      .select('estado, valor');
    
    if (error) throw error;

    const stats = {
      total: todos.length,
      pendientes: todos.filter(p => p.estado === 'pendiente').length,
      pagados: todos.filter(p => p.estado === 'pagado').length,
      vencidos: todos.filter(p => p.estado === 'vencido').length,
      totalPendiente: todos
        .filter(p => p.estado === 'pendiente')
        .reduce((sum, p) => sum + (p.valor || 0), 0),
      totalRecaudado: todos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + (p.valor || 0), 0)
    };

    return stats;
  },

  // Obtener pagos del mes actual
  async getPagosMesActual() {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();

    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        arrendamiento:arrendamientos (
          id,
          local:locales (
            id,
            nombre
          ),
          arrendador:perfiles!arrendador_id (
            id,
            nombre
          )
        )
      `)
      .eq('mes', mes)
      .eq('anio', anio)
      .order('estado', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Marcar pagos vencidos
  async marcarVencidos() {
    const fecha = new Date();
    const mesActual = fecha.getMonth() + 1;
    const anioActual = fecha.getFullYear();

    const { data, error } = await supabase
      .from('pagos')
      .update({ estado: 'vencido' })
      .eq('estado', 'pendiente')
      .or(`anio.lt.${anioActual},and(anio.eq.${anioActual},mes.lt.${mesActual})`)
      .select();
    
    if (error) throw error;
    return data;
  }
};