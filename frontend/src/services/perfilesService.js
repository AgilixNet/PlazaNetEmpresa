import { supabase } from '../supabaseClient';

export const perfilesService = {
  // Obtener todos los perfiles
  async getAll() {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener perfil por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener perfiles por rol
  async getPorRol(rol) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('rol', rol)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener arrendadores
  async getArrendadores() {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('rol', 'Arrendador')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Buscar perfiles
  async buscar(termino) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .or(`nombre.ilike.%${termino}%,correo.ilike.%${termino}%`)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Crear perfil (después de que Supabase Auth cree el usuario)
  async create(perfilData) {
    const { data, error } = await supabase
      .from('perfiles')
      .insert([{
        ...perfilData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar perfil
  async update(id, updates) {
    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar perfil
  async delete(id) {
    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Cambiar rol de un usuario
  async cambiarRol(id, nuevoRol) {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener estadísticas de usuarios
  async getEstadisticas() {
    const { data: todos, error: errorTodos } = await supabase
      .from('perfiles')
      .select('rol');
    
    if (errorTodos) throw errorTodos;

    const stats = {
      total: todos?.length || 0,
      owners: todos?.filter(p => p.rol === 'Owner').length || 0,
      adminPlaza: todos?.filter(p => p.rol === 'AdminPlaza').length || 0,
      adminParqueadero: todos?.filter(p => p.rol === 'ParkingAdmin').length || 0,
      arrendadores: todos?.filter(p => p.rol === 'Arrendador').length || 0,
      adminSoftware: todos?.filter(p => p.rol === 'AdminSoftware').length || 0
    };

    return stats;
  }
};