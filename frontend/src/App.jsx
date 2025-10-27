import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";
import { ROLES, RUTAS_POR_ROL } from "./utils/constants";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerUsuarios from "./pages/owner/OwnerUsuarios";
import OwnerLocales from "./pages/owner/OwnerLocales";
import OwnerArriendos from "./pages/owner/OwnerArriendos";
import OwnerPagos from "./pages/owner/OwnerPagos";
import OwnerVehiculos from "./pages/owner/OwnerVehiculos";
import OwnerReportes from "./pages/owner/OwnerReportes";

// Admin Software Pages
import AdminSoftwareSolicitudes from "./pages/admin-software/AdminSoftwareSolicitudes";

// Componente de carga global
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando aplicación...</p>
      </div>
    </div>
  );
}

// Componente para redirigir a la ruta correcta según el rol
function RoleBasedRedirect() {
  const { perfil, loading, error } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
          <h2 className="text-lg font-bold text-red-800 mb-2">Error de Autenticación</h2>
          <p className="text-red-700">{error}</p>
          <a 
            href="/login" 
            className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Volver al Login
          </a>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return <Navigate to="/login" replace />;
  }

  const dashboardUrl = RUTAS_POR_ROL[perfil.rol] || '/login';
  console.log(`🔀 Redirigiendo al dashboard: ${dashboardUrl}`);
  return <Navigate to={dashboardUrl} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas - la ruta raíz debe ir primero */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      
      {/* Ruta del dashboard - redirige según el rol */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <RoleBasedRedirect />
          </PrivateRoute>
        } 
      />

      {/* Rutas del Admin Software */}
      <Route 
        path="/admin-software/solicitudes" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.ADMIN_SOFTWARE]}>
              <AdminSoftwareSolicitudes />
            </RoleRoute>
          </PrivateRoute>
        } 
      />

      {/* Rutas del Owner */}
      <Route 
        path="/owner/dashboard" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerDashboard />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/owner/usuarios" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerUsuarios />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/owner/locales" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerLocales />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/owner/arriendos" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerArriendos />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/owner/pagos" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerPagos />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/owner/vehiculos" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerVehiculos />
            </RoleRoute>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/owner/reportes" 
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={[ROLES.OWNER]}>
              <OwnerReportes />
            </RoleRoute>
          </PrivateRoute>
        } 
      />

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;