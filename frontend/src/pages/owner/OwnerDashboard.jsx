import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { Store, Car, DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";
import { localesService } from "../../services/localesService";
import { vehiculosService } from "../../services/vehiculosService";
import { pagosService } from "../../services/pagosService";
import { perfilesService } from "../../services/perfilesService";
import { arrendamientosService } from "../../services/arrendamientosService";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    locales: { total: 0, disponibles: 0, ocupados: 0, ingresoMensualPotencial: 0 },
    vehiculos: { vehiculosActivos: 0, carros: 0, motos: 0, ingresos_hoy: 0 },
    pagos: { pagosPendientes: 0, totalPendiente: 0, pagosRealizados: 0, totalRealizado: 0 },
    usuarios: { total: 0, owners: 0, adminPlaza: 0, adminParqueadero: 0, arrendadores: 0, adminSoftware: 0 },
    arrendamientos: { total: 0, activos: 0, ingresosMensuales: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [vehiculosActivos, setVehiculosActivos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Iniciando carga del dashboard...');

      // Cargar datos en paralelo
      const [
        localesStats,
        vehiculosStats,
        pagosStats,
        usuariosStats,
        arrendamientosStats,
        pagosPend,
        vehiculosAct
      ] = await Promise.all([
        localesService.getEstadisticas().catch(e => {
          console.error('Error en localesService:', e);
          return { total: 0, disponibles: 0, ocupados: 0, ingresoMensualPotencial: 0 };
        }),
        vehiculosService.getEstadisticas().catch(e => {
          console.error('Error en vehiculosService:', e);
          return { vehiculosActivos: 0, carros: 0, motos: 0, ingresos_hoy: 0 };
        }),
        pagosService.getEstadisticas().catch(e => {
          console.error('Error en pagosService:', e);
          return { pagosPendientes: 0, totalPendiente: 0, pagosRealizados: 0, totalRealizado: 0 };
        }),
        perfilesService.getEstadisticas().catch(e => {
          console.error('Error en perfilesService:', e);
          return { total: 0, owners: 0, adminPlaza: 0, adminParqueadero: 0, arrendadores: 0, adminSoftware: 0 };
        }),
        arrendamientosService.getEstadisticas().catch(e => {
          console.error('Error en arrendamientosService:', e);
          return { total: 0, activos: 0, ingresosMensuales: 0 };
        }),
        pagosService.getPendientes().catch(e => {
          console.error('Error en getPendientes:', e);
          return [];
        }),
        vehiculosService.getActivos().catch(e => {
          console.error('Error en getActivos:', e);
          return [];
        })
      ]);

      console.log('✅ Datos cargados:', {
        localesStats,
        vehiculosStats,
        pagosStats,
        usuariosStats,
        arrendamientosStats
      });

      setStats({
        locales: localesStats,
        vehiculos: vehiculosStats,
        pagos: pagosStats,
        usuarios: usuariosStats,
        arrendamientos: arrendamientosStats
      });

      setPagosPendientes(pagosPend.slice(0, 5) || []);
      setVehiculosActivos(vehiculosAct.slice(0, 5) || []);
    } catch (err) {
      console.error("❌ Error cargando datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800">Error al cargar el dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard General">
      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Locales */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Locales</p>
              <p className="text-4xl font-bold mt-1">{stats.locales.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <Store className="h-8 w-8" />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>{stats.locales.disponibles} disponibles</span>
            <span>{stats.locales.ocupados} ocupados</span>
          </div>
        </div>

        {/* Parqueadero */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm font-medium">Vehículos Activos</p>
              <p className="text-4xl font-bold mt-1">{stats.vehiculos.vehiculosActivos}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <Car className="h-8 w-8" />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>{stats.vehiculos.carros} carros</span>
            <span>{stats.vehiculos.motos} motos</span>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium">Ingresos Mensuales</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(stats.arrendamientos.ingresosMensuales)}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
          <div className="text-sm">
            <span>{stats.arrendamientos.activos} arriendos activos</span>
          </div>
        </div>

        {/* Usuarios */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Usuarios</p>
              <p className="text-4xl font-bold mt-1">{stats.usuarios.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <div className="text-sm">
            <span>{stats.usuarios.arrendadores} arrendadores</span>
          </div>
        </div>
      </div>

      {/* Alertas de Pagos Pendientes */}
      {stats.pagos.pagosPendientes > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-semibold">
                Tienes {stats.pagos.pagosPendientes} pagos pendientes
              </p>
              <p className="text-yellow-700 text-sm">
                Total pendiente: {formatCurrency(stats.pagos.totalPendiente)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos Pendientes Recientes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <DollarSign className="mr-2 h-6 w-6" />
              Pagos Pendientes
            </h2>
          </div>
          <div className="p-6">
            {pagosPendientes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pagos pendientes</p>
            ) : (
              <div className="space-y-4">
                {pagosPendientes.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Pago - Mes {pago.mes}/{pago.anio}
                      </p>
                      <p className="text-sm text-gray-600">
                        Estado: {pago.estado}
                      </p>
                      {pago.arriendo && (
                        <p className="text-xs text-gray-500">
                          Local: {pago.arriendo?.local?.nombre || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(pago.valor)}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Pendiente
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehículos en Parqueadero */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Car className="mr-2 h-6 w-6" />
              Vehículos en Parqueadero
            </h2>
          </div>
          <div className="p-6">
            {vehiculosActivos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay vehículos actualmente</p>
            ) : (
              <div className="space-y-4">
                {vehiculosActivos.map((vehiculo) => (
                  <div key={vehiculo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Car className="h-6 w-6 text-purple-600 mr-3" />
                      <div>
                        <p className="font-bold text-gray-800">{vehiculo.placa}</p>
                        <p className="text-sm text-gray-600 capitalize">{vehiculo.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(vehiculo.hora_entrada).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}