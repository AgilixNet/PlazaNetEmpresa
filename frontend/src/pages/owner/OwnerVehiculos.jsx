import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { Car, Plus, LogOut as ExitIcon, Search } from "lucide-react";
import { vehiculosService } from "../../services/vehiculosService";
import { useAuth } from "../../context/AuthContext";
import { TIPOS_VEHICULO } from "../../utils/constants";

export default function OwnerVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSalidaModal, setShowSalidaModal] = useState(false);
  const [vehiculoSalida, setVehiculoSalida] = useState(null);
  const [formData, setFormData] = useState({
    placa: "",
    tipo: TIPOS_VEHICULO.CARRO
  });
  const { perfil } = useAuth();

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const data = await vehiculosService.getActivos();
      setVehiculos(data);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
      alert("Error al cargar vehículos");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarEntrada = async (e) => {
    e.preventDefault();
    try {
      await vehiculosService.registrarEntrada({
        placa: formData.placa.toUpperCase(),
        tipo: formData.tipo,
        creado_por: perfil.id
      });
      
      alert("Entrada registrada correctamente");
      setShowModal(false);
      resetForm();
      loadVehiculos();
    } catch (error) {
      console.error("Error registrando entrada:", error);
      alert("Error al registrar entrada: " + error.message);
    }
  };

  const handleRegistrarSalida = async () => {
    if (!vehiculoSalida) return;
    
    try {
      const { costo } = vehiculosService.calcularCosto(vehiculoSalida.hora_entrada, 2000);
      
      await vehiculosService.registrarSalida(vehiculoSalida.id, costo);
      
      alert(`Salida registrada. Total a pagar: ${formatCurrency(costo)}`);
      setShowSalidaModal(false);
      setVehiculoSalida(null);
      loadVehiculos();
    } catch (error) {
      console.error("Error registrando salida:", error);
      alert("Error al registrar salida");
    }
  };

  const resetForm = () => {
    setFormData({
      placa: "",
      tipo: TIPOS_VEHICULO.CARRO
    });
  };

  const prepararSalida = (vehiculo) => {
    setVehiculoSalida(vehiculo);
    setShowSalidaModal(true);
  };

  const filteredVehiculos = vehiculos.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoIcon = (tipo) => {
    return <Car className="h-6 w-6" />;
  };

  const getTipoBadgeColor = (tipo) => {
    const colors = {
      [TIPOS_VEHICULO.CARRO]: "bg-blue-100 text-blue-800 border-blue-200",
      [TIPOS_VEHICULO.MOTO]: "bg-green-100 text-green-800 border-green-200",
      [TIPOS_VEHICULO.BICICLETA]: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[tipo] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calcularTiempoEstadia = (horaEntrada) => {
    const entrada = new Date(horaEntrada);
    const ahora = new Date();
    const diferenciaMs = ahora - entrada;
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  };

  if (loading) {
    return (
      <Layout title="Gestión de Parqueadero">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Parqueadero">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Registrar Entrada
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Vehículos Activos</p>
          <p className="text-4xl font-bold mt-2">{vehiculos.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm font-medium">Carros</p>
          <p className="text-4xl font-bold mt-2">{vehiculos.filter(v => v.tipo === TIPOS_VEHICULO.CARRO).length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm font-medium">Motos</p>
          <p className="text-4xl font-bold mt-2">{vehiculos.filter(v => v.tipo === TIPOS_VEHICULO.MOTO).length}</p>
        </div>
      </div>

      {/* Lista de Vehículos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Placa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Hora Entrada</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tiempo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Costo Estimado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehiculos.map((vehiculo) => {
                const { costo } = vehiculosService.calcularCosto(vehiculo.hora_entrada, 2000);
                return (
                  <tr key={vehiculo.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTipoIcon(vehiculo.tipo)}
                        <span className="ml-3 font-bold text-gray-800">{vehiculo.placa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTipoBadgeColor(vehiculo.tipo)}`}>
                        {vehiculo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(vehiculo.hora_entrada).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {calcularTiempoEstadia(vehiculo.hora_entrada)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(costo)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => prepararSalida(vehiculo)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <ExitIcon className="h-4 w-4" />
                          Registrar Salida
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredVehiculos.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hay vehículos en el parqueadero</p>
          </div>
        )}
      </div>

      {/* Modal Entrada */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Registrar Entrada</h3>
            
            <form onSubmit={handleRegistrarEntrada} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                  required
                  placeholder="ABC123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={TIPOS_VEHICULO.CARRO}>Carro</option>
                  <option value={TIPOS_VEHICULO.MOTO}>Moto</option>
                  <option value={TIPOS_VEHICULO.BICICLETA}>Bicicleta</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tarifa:</strong> $2,000 COP por hora
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Salida */}
      {showSalidaModal && vehiculoSalida && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Registrar Salida</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Placa:</span>
                  <span className="font-bold text-gray-800">{vehiculoSalida.placa}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="capitalize text-gray-800">{vehiculoSalida.tipo}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Tiempo:</span>
                  <span className="font-semibold text-gray-800">{calcularTiempoEstadia(vehiculoSalida.hora_entrada)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(vehiculosService.calcularCosto(vehiculoSalida.hora_entrada, 2000).costo)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSalidaModal(false);
                    setVehiculoSalida(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarSalida}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Confirmar Salida
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}