import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Store, Car, LogOut, User } from "lucide-react";

export default function Dashboard() {
  const [locales, setLocales] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([getLocales(), getVehiculos()]);
    setLoading(false);
  };

  const getLocales = async () => {
    const { data, error } = await supabase.from("locales").select("*");
    if (!error) setLocales(data);
  };

  const getVehiculos = async () => {
    const { data, error } = await supabase.from("vehiculos").select("*");
    if (!error) setVehiculos(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // Redirigir a la pantalla principal
  };

  const getEstadoColor = (estado) => {
    return estado === "disponible" 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                PlazaNetEmpresa
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Administrador</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Locales</p>
                <p className="text-4xl font-bold mt-2">{locales.length}</p>
                <p className="text-blue-100 text-sm mt-1">
                  {locales.filter(l => l.estado === "disponible").length} disponibles
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <Store className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Vehículos en Parqueadero</p>
                <p className="text-4xl font-bold mt-2">{vehiculos.length}</p>
                <p className="text-purple-100 text-sm mt-1">
                  {vehiculos.filter(v => v.tipo === "carro").length} carros
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <Car className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Locales Section */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Store className="mr-3 h-6 w-6" />
                Locales Arrendados
              </h2>
            </div>
            <div className="p-6">
              {locales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay locales registrados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locales.map((local) => (
                    <div
                      key={local.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200 bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{local.nombre}</h3>
                        <Store className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoColor(local.estado)}`}>
                        {local.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Vehículos Section */}
        <section>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Car className="mr-3 h-6 w-6" />
                Parqueadero
              </h2>
            </div>
            <div className="p-6">
              {vehiculos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay vehículos en el parqueadero</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Placa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vehiculos.map((vehiculo) => (
                        <tr key={vehiculo.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Car className="h-5 w-5 text-purple-600 mr-3" />
                              <span className="text-sm font-bold text-gray-900">{vehiculo.placa}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 capitalize">{vehiculo.tipo}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}