import { supabase } from '../supabaseClient';
import { ROLES } from '../utils/constants';

export const perfilesService = {
  // Obtener todos los perfiles
  async getAll() {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
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
  async getByRol(rol) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('rol', rol)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener todos excepto owners (para AdminPlaza)
  async getAllExceptOwner() {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .neq('rol', ROLES.OWNER)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener arrendadores
  async getArrendadores() {
    return this.getByRol(ROLES.ARRENDADOR);
  },

  // Crear perfil
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

  // Validar si puede editar un perfil (AdminPlaza no puede editar Owner)
  canEdit(editorRol, targetRol) {
    if (editorRol === ROLES.OWNER) return true;
    if (editorRol === ROLES.ADMIN_PLAZA && targetRol !== ROLES.OWNER) return true;
    return false;
  },

  // Obtener estadísticas de usuarios
  async getEstadisticas() {
    const { data: todos, error } = await supabase
      .from('perfiles')
      .select('rol');
    
    if (error) throw error;

    const stats = {
      total: todos.length,
      owners: todos.filter(p => p.rol === ROLES.OWNER).length,
      adminPlaza: todos.filter(p => p.rol === ROLES.ADMIN_PLAZA).length,
      adminParqueadero: todos.filter(p => p.rol === ROLES.ADMIN_PARQUEADERO).length,
      arrendadores: todos.filter(p => p.rol === ROLES.ARRENDADOR).length
    };

    return stats;
  }
};