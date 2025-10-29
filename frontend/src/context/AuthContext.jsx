import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { PERMISOS, RUTAS_POR_ROL } from '../utils/constants';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [plaza, setPlaza] = useState(null); // ✅ NUEVO: Almacenar plaza
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
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setPerfil(null);
        setPlaza(null); // ✅ NUEVO
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
        setPlaza(null); // ✅ NUEVO
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
      setPlaza(null); // ✅ NUEVO
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
      setPlaza(data.plaza_id); // ✅ NUEVO: Guardar plaza del perfil
      setError(null);
      setLoading(false);

    } catch (error) {
      console.error('❌ Exception in fetchPerfil:', error);
      setError(error.message);
      setPerfil(null);
      setPlaza(null); // ✅ NUEVO
      setLoading(false);
    }
  };

  // ✅ NUEVO: signIn mejorado con validación de plaza
  const signIn = async (email, password, plazaSeleccionada) => {
    try {
      console.log('🔐 Attempting login:', email, 'Plaza:', plazaSeleccionada);
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
        // Fetch perfil
        await fetchPerfilYValidarPlaza(data.user.id, plazaSeleccionada);
      }
      
      return data;
    } catch (error) {
      console.error('❌ SignIn exception:', error);
      throw error;
    }
  };

  // ✅ NUEVO: Función para validar que la plaza coincida
  const fetchPerfilYValidarPlaza = async (userId, plazaSeleccionada) => {
    try {
      console.log('🔍 Validando plaza del usuario...');
      
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching perfil:', error);
        await signOut();
        throw new Error('Perfil de usuario no encontrado');
      }

      if (!data) {
        await signOut();
        throw new Error('Perfil no encontrado');
      }

      // ✅ VERIFICAR QUE LA PLAZA COINCIDA
      if (data.plaza_id !== plazaSeleccionada) {
        console.error(
          `❌ Plaza no coincide. Perfil: ${data.plaza_id}, Seleccionada: ${plazaSeleccionada}`
        );
        await signOut();
        throw new Error(
          'La plaza seleccionada no coincide con tu usuario. Por favor verifica.'
        );
      }

      console.log('✅ Plaza verificada correctamente');
      
      setPerfil(data);
      setPlaza(data.plaza_id);
      setError(null);

      // ✅ Redirigir al dashboard correcto
      const dashboardUrl = RUTAS_POR_ROL[data.rol];
      console.log(`🔀 Redirigiendo a: ${dashboardUrl}`);
      
      setTimeout(() => {
        navigate(dashboardUrl, { replace: true });
      }, 500);

    } catch (error) {
      console.error('❌ Error en validación de plaza:', error);
      setError(error.message);
      setPerfil(null);
      setPlaza(null);
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
      setPlaza(null); // ✅ NUEVO
      setError(null);
      
      navigate('/login', { replace: true });
      
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
    plaza, // ✅ NUEVO: Exportar plaza
    loading,
    error,
    signIn,
    signOut,
    tienePermiso,
    isOwner: perfil?.rol === 'Owner',
    isAdminPlaza: perfil?.rol === 'AdminPlaza',
    isAdminParqueadero: perfil?.rol === 'ParkingAdmin',
    isAdminSoftware: perfil?.rol === 'AdminSoftware',
    isArrendador: perfil?.rol === 'Arrendador',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};