import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PERMISOS } from '../utils/constants';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Limpiar localStorage al montar el componente (en caso de datos viejos)
  useEffect(() => {
    const storedAuthError = localStorage.getItem('auth_error');
    if (storedAuthError) {
      console.warn('⚠️ Limpiando error de auth anterior:', storedAuthError);
      localStorage.removeItem('auth_error');
    }
  }, []);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.email);
        setUser(session.user);
        // No llamar a fetchPerfil aquí, dejar que lo maneje el checkUser
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setPerfil(null);
        setError(null);
      } else if (event === 'USER_UPDATED') {
        console.log('🔄 User updated:', session?.user?.email);
        setUser(session?.user || null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Error getting session:', sessionError);
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('👤 Existing session found:', session.user.email);
        console.log('🔑 User ID:', session.user.id);
        setUser(session.user);
        
        // Esperar a que fetchPerfil termine antes de setLoading(false)
        await fetchPerfil(session.user.id);
      } else {
        console.log('ℹ️ No existing session');
        setUser(null);
        setPerfil(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in checkUser:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchPerfil = async (userId) => {
    if (!userId) {
      console.warn('⚠️ No userId provided to fetchPerfil');
      setPerfil(null);
      setLoading(false);
      return;
    }

    try {
      console.log('📥 Fetching perfil for:', userId);
      
      // Query simple y directa
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 Query response:', { data, error });

      if (error) {
        console.error('❌ Error fetching perfil:', error.code, error.message);
        
        // Si no existe el perfil, hacer logout
        if (error.code === 'PGRST116' || error.code === 'NO_ROWS') {
          console.warn('⚠️ Perfil no encontrado, cerrando sesión');
          await signOut();
          setError('Perfil de usuario no encontrado');
        } else {
          // Otros errores de la BD
          setError(`Error al cargar perfil: ${error.message}`);
          await signOut();
        }
        setLoading(false);
        return;
      }

      if (!data) {
        console.warn('⚠️ No profile found for user');
        setError('Perfil no encontrado');
        await signOut();
        setLoading(false);
        return;
      }
      
      console.log('✅ Perfil obtenido:', data);
      setPerfil(data);
      setError(null);
      setLoading(false);

    } catch (error) {
      console.error('❌ Exception in fetchPerfil:', error);
      setError(error.message);
      setPerfil(null);
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting login:', email);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Login error:', error.message);
        setError(error.message);
        throw error;
      }
      
      console.log('✅ Login successful for:', data.user.email);
      
      if (data.user) {
        setUser(data.user);
        // Aquí fetchPerfil se llamará automáticamente por el onAuthStateChange
        // Pero lo hacemos explícito también para asegurar que funcione
        await fetchPerfil(data.user.id);
      }
      
      return data;
    } catch (error) {
      console.error('❌ SignIn exception:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setPerfil(null);
      setError(null);
      
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      setError(error.message);
    }
  };

  const tienePermiso = (modulo, accion) => {
    if (!perfil?.rol) return false;
    
    const permisos = PERMISOS[perfil.rol];
    if (!permisos || !permisos[modulo]) return false;

    const permisoModulo = permisos[modulo];
    
    if (typeof permisoModulo === 'boolean') return permisoModulo;
    
    if (typeof permisoModulo === 'object') {
      return permisoModulo[accion] || false;
    }

    return false;
  };

  const value = {
    user,
    perfil,
    loading,
    error,
    signIn,
    signOut,
    tienePermiso,
    isOwner: perfil?.rol === 'Owner',
    isAdminPlaza: perfil?.rol === 'AdminPlaza',
    isAdminParqueadero: perfil?.rol === 'ParkingAdmin',
    isArrendador: perfil?.rol === 'Arrendador',
    isAdminSoftware: perfil?.rol === 'AdminSoftware',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};