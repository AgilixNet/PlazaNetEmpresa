import { supabase } from '../supabaseClient';

export const vehiculosService = {
  // Obtener todos los vehículos
  async getAll() {
    const { data, error } = await supabase
      .from('vehiculos')
      .select(`
        *,
        creado_por:perfiles!creado_por (
          id,
          nombre
        )
      `)
      .order('hora_entrada', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener vehículo por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('vehiculos')
      .select(`
        *,
        creado_por:perfiles!creado_por (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener vehículos activos (sin hora_salida)
  async getActivos() {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .is('hora_salida', null)
      .order('hora_entrada', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar vehículo por placa
  async buscarPorPlaca(placa) {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .ilike('placa', `%${placa}%`)
      .order('hora_entrada', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Registrar entrada de vehículo
  async registrarEntrada(vehiculoData) {
    const { data, error } = await supabase
      .from('vehiculos')
      .insert([{
        ...vehiculoData,
        hora_entrada: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Registrar salida de vehículo
  async registrarSalida(id, totalPagar) {
    const { data, error } = await supabase
      .from('vehiculos')
      .update({
        hora_salida: new Date().toISOString(),
        total_pagar: totalPagar
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar vehículo
  async update(id, updates) {
    const { data, error } = await supabase
      .from('vehiculos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar vehículo
  async delete(id) {
    const { error } = await supabase
      .from('vehiculos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Obtener estadísticas del parqueadero
  async getEstadisticas() {
    const { data: activos, error: errorActivos } = await supabase
      .from('vehiculos')
      .select('tipo')
      .is('hora_salida', null);
    
    if (errorActivos) throw errorActivos;

    const { data: hoy, error: errorHoy } = await supabase
      .from('vehiculos')
      .select('total_pagar')
      .gte('hora_entrada', new Date().toISOString().split('T')[0]);
    
    if (errorHoy) throw errorHoy;

    const stats = {
      vehiculosActivos: activos.length,
      carros: activos.filter(v => v.tipo === 'carro').length,
      motos: activos.filter(v => v.tipo === 'moto').length,
      bicicletas: activos.filter(v => v.tipo === 'bicicleta').length,
      ingresos_hoy: hoy.reduce((sum, v) => sum + (v.total_pagar || 0), 0)
    };

    return stats;
  },

  // Calcular tiempo y costo de estacionamiento
  calcularCosto(horaEntrada, tarifaPorHora = 2000) {
    const entrada = new Date(horaEntrada);
    const ahora = new Date();
    const diferenciaMs = ahora - entrada;
    const horas = Math.ceil(diferenciaMs / (1000 * 60 * 60));
    const costo = horas * tarifaPorHora;
    
    return {
      horas,
      costo,
      horaEntrada: entrada,
      horaSalida: ahora
    };
  }
};