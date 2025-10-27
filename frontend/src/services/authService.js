import { supabase } from '../supabaseClient';

export const authService = {
  // Iniciar sesión
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener sesión actual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Obtener perfil del usuario
  async getPerfil(userId) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nuevo usuario (solo Owner y AdminPlaza)
  async createUser(email, password, perfilData) {
    // Primero crear el usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Luego crear el perfil
    const { data: perfilCreado, error: perfilError } = await supabase
      .from('perfiles')
      .insert([
        {
          id: authData.user.id,
          nombre: perfilData.nombre,
          rol: perfilData.rol,
        }
      ])
      .select()
      .single();

    if (perfilError) throw perfilError;
    return perfilCreado;
  },

  // Actualizar perfil
  async updatePerfil(userId, updates) {
    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar usuario
  async deleteUser(userId) {
    // Primero eliminar el perfil
    const { error: perfilError } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', userId);

    if (perfilError) throw perfilError;

    // Nota: Eliminar usuario de auth requiere permisos especiales
    // Normalmente se hace desde el dashboard de Supabase o con service_role key
    return true;
  }
};