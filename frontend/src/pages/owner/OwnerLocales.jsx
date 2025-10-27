import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { Store, Plus, Edit, Trash2, Search } from "lucide-react";
import { localesService } from "../../services/localesService";
import { ESTADOS_LOCAL } from "../../utils/constants";

export default function OwnerLocales() {
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingLocal, setEditingLocal] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    precio_mensual: "",
    estado: ESTADOS_LOCAL.DISPONIBLE
  });

  useEffect(() => {
    loadLocales();
  }, []);

  const loadLocales = async () => {
    try {
      setLoading(true);
      const data = await localesService.getWithArrendatario();
      setLocales(data);
    } catch (error) {
      console.error("Error cargando locales:", error);
      alert("Error al cargar locales");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocal) {
        await localesService.update(editingLocal.id, formData);
        alert("Local actualizado correctamente");
      } else {
        await localesService.create(formData);
        alert("Local creado correctamente");
      }
      
      setShowModal(false);
      resetForm();
      loadLocales();
    } catch (error) {
      console.error("Error guardando local:", error);
      alert("Error al guardar local: " + error.message);
    }
  };

  const handleEdit = (local) => {
    setEditingLocal(local);
    setFormData({
      nombre: local.nombre,
      ubicacion: local.ubicacion,
      precio_mensual: local.precio_mensual,
      estado: local.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este local?")) return;
    
    try {
      await localesService.delete(id);
      alert("Local eliminado correctamente");
      loadLocales();
    } catch (error) {
      console.error("Error eliminando local:", error);
      alert("Error al eliminar local");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      ubicacion: "",
      precio_mensual: "",
      estado: ESTADOS_LOCAL.DISPONIBLE
    });
    setEditingLocal(null);
  };

  const filteredLocales = locales.filter(local => {
    const matchSearch = local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       local.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === "todos" || local.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      [ESTADOS_LOCAL.DISPONIBLE]: "bg-green-100 text-green-800 border-green-200",
      [ESTADOS_LOCAL.OCUPADO]: "bg-red-100 text-red-800 border-red-200",
      [ESTADOS_LOCAL.MANTENIMIENTO]: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[estado] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Layout title="Gestión de Locales">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Locales">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value={ESTADOS_LOCAL.DISPONIBLE}>Disponible</option>
              <option value={ESTADOS_LOCAL.OCUPADO}>Ocupado</option>
              <option value={ESTADOS_LOCAL.MANTENIMIENTO}>Mantenimiento</option>
            </select>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              Nuevo Local
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Locales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocales.map((local) => (
          <div key={local.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className={`h-2 ${local.estado === ESTADOS_LOCAL.DISPONIBLE ? 'bg-green-500' : local.estado === ESTADOS_LOCAL.OCUPADO ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-3">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{local.nombre}</h3>
                    <p className="text-sm text-gray-600">{local.ubicacion}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precio mensual:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(local.precio_mensual)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadgeColor(local.estado)}`}>
                    {local.estado}
                  </span>
                </div>

                {local.arriendos && local.arriendos.length > 0 && local.arriendos[0].perfiles && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Arrendado por:</p>
                    <p className="text-sm font-semibold text-gray-800">{local.arriendos[0].perfiles.nombre}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(local)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(local.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLocales.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron locales</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingLocal ? "Editar Local" : "Nuevo Local"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ej: Local 101"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  required
                  placeholder="Ej: Piso 1, Sector A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Mensual</label>
                <input
                  type="number"
                  value={formData.precio_mensual}
                  onChange={(e) => setFormData({...formData, precio_mensual: e.target.value})}
                  required
                  min="0"
                  placeholder="500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ESTADOS_LOCAL.DISPONIBLE}>Disponible</option>
                  <option value={ESTADOS_LOCAL.OCUPADO}>Ocupado</option>
                  <option value={ESTADOS_LOCAL.MANTENIMIENTO}>Mantenimiento</option>
                </select>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingLocal ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}