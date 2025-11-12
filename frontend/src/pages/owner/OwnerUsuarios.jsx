import { useEffect, useState, useMemo } from "react";
import Layout from "../../components/common/Layout";
import { Users, Plus, Edit, Trash2, Search, KeyRound, X, Mail, Building2, Shield } from "lucide-react";
import { perfilesService } from "../../services/perfilesService";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { ROLES, PLAZAS } from "../../utils/constants";

const ROLES_PERMITIDOS = [
  { value: ROLES.ADMIN_PLAZA, label: 'Admin Plaza' },
  { value: ROLES.ADMIN_PARQUEADERO, label: 'Admin Parqueadero' },
  { value: ROLES.ARRENDADOR, label: 'Arrendador' }
];

export default function OwnerUsuarios() {
  const { perfil, plaza } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [workingId, setWorkingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    telefono: "",
    rol: ROLES.ARRENDADOR,
    plaza_id: ""
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const plazaNombre = useMemo(() => {
    if (!plaza) return "Sin plaza";
    const plazaEncontrada = Object.values(PLAZAS).find(p => 
      p.nombre.toLowerCase() === plaza.toLowerCase() ||
      plaza.toLowerCase().includes(p.nombre.toLowerCase())
    );
    return plazaEncontrada ? plazaEncontrada.nombre : plaza;
  }, [plaza]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await perfilesService.getAll();
      // Filtrar solo usuarios de la plaza del owner
      const usuariosDePlaza = data.filter(u => {
        if (!plaza) return false;
        const userPlaza = u.plaza_id || u.plaza;
        return userPlaza && userPlaza.toLowerCase() === plaza.toLowerCase();
      });
      setUsuarios(usuariosDePlaza);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Actualizar usuario existente
        await perfilesService.update(editingUser.id, {
          nombre: formData.nombre,
          rol: formData.rol
        });
        alert("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        await authService.createUser(formData.email, formData.password, {
          nombre: formData.nombre,
          rol: formData.rol
        });
        alert("Usuario creado correctamente");
      }
      
      setShowModal(false);
      resetForm();
      loadUsuarios();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      alert("Error al guardar usuario: " + error.message);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: "", // No se puede editar email
      password: "",
      rol: usuario.rol
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    
    try {
      await perfilesService.delete(id);
      alert("Usuario eliminado correctamente");
      loadUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("Error al eliminar usuario");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rol: ROLES.ARRENDADOR
    });
    setEditingUser(null);
  };

  const filteredUsuarios = usuarios.filter(user => {
    const matchSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRol = filtroRol === "todos" || user.rol === filtroRol;
    return matchSearch && matchRol;
  });

  const getRolBadgeColor = (rol) => {
    const colors = {
      [ROLES.OWNER]: "bg-purple-100 text-purple-800 border-purple-200",
      [ROLES.ADMIN_PLAZA]: "bg-blue-100 text-blue-800 border-blue-200",
      [ROLES.ADMIN_PARQUEADERO]: "bg-green-100 text-green-800 border-green-200",
      [ROLES.ARRENDADOR]: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[rol] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRolNombre = (rol) => {
    const nombres = {
      [ROLES.OWNER]: "Propietario",
      [ROLES.ADMIN_PLAZA]: "Admin Plaza",
      [ROLES.ADMIN_PARQUEADERO]: "Admin Parqueadero",
      [ROLES.ARRENDADOR]: "Arrendador"
    };
    return nombres[rol] || rol;
  };

  if (loading) {
    return (
      <Layout title="Gestión de Usuarios">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Usuarios">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los roles</option>
              <option value={ROLES.OWNER}>Propietario</option>
              <option value={ROLES.ADMIN_PLAZA}>Admin Plaza</option>
              <option value={ROLES.ADMIN_PARQUEADERO}>Admin Parqueadero</option>
              <option value={ROLES.ARRENDADOR}>Arrendador</option>
            </select>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Fecha Registro</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{usuario.nombre}</p>
                        <p className="text-sm text-gray-500">{usuario.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRolBadgeColor(usuario.rol)}`}>
                      {getRolNombre(usuario.rol)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(usuario.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ROLES.ARRENDADOR}>Arrendador</option>
                  <option value={ROLES.ADMIN_PARQUEADERO}>Admin Parqueadero</option>
                  <option value={ROLES.ADMIN_PLAZA}>Admin Plaza</option>
                  <option value={ROLES.OWNER}>Propietario</option>
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
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}