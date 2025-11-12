import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/common/Layout";
import Table from "../../components/common/Table";
import { perfilesService } from "../../services/perfilesService";
import { authService } from "../../services/authService";
import { ROLES, PLAZAS } from "../../utils/constants";
import { Users, RefreshCw, KeyRound, Shield, Filter } from "lucide-react";

const ROLES_OPTIONS = [
  ROLES.OWNER,
  ROLES.ADMIN_SOFTWARE,
  ROLES.ADMIN_PLAZA,
  ROLES.ADMIN_PARQUEADERO,
  ROLES.ARRENDADOR
];

export default function AdminSoftwareUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [plazaFiltro, setPlazaFiltro] = useState("todas");
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await perfilesService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("No se pudieron cargar los usuarios. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const plazasList = useMemo(() => {
    const base = [{ value: "todas", label: "Todas las plazas" }];
    const plazas = Object.values(PLAZAS || {}).map(p => ({ value: p.nombre, label: p.nombre }));
    return base.concat(plazas);
  }, []);

  const getPlazaNombre = (perfil) => {
    // Si tiene plaza_id, buscar el nombre en PLAZAS
    const plazaId = perfil?.plaza_id || perfil?.plaza;
    if (plazaId) {
      const plazaEncontrada = Object.values(PLAZAS).find(p => 
        p.nombre.toLowerCase() === plazaId.toLowerCase() ||
        plazaId.toLowerCase().includes(p.nombre.toLowerCase())
      );
      if (plazaEncontrada) return plazaEncontrada.nombre;
      return plazaId; // Si no se encuentra, mostrar el ID tal cual
    }
    // Intentar otros campos por si acaso
    return perfil?.plazaNombre || perfil?.nombrePlaza || "Sin plaza";
  };

  const getCorreo = (perfil) => {
    return perfil?.correo || perfil?.email || perfil?.correo_electronico || "";
  };

  const usuariosFiltrados = useMemo(() => {
    let list = usuarios;
    if (plazaFiltro !== "todas") {
      list = list.filter(u => String(getPlazaNombre(u)).toLowerCase() === String(plazaFiltro).toLowerCase());
    }
    if (busqueda) {
      const term = busqueda.toLowerCase();
      list = list.filter(u => {
        return (
          (u?.nombre || "").toLowerCase().includes(term) ||
          (getCorreo(u) || "").toLowerCase().includes(term) ||
          (u?.rol || "").toLowerCase().includes(term)
        );
      });
    }
    return list;
  }, [usuarios, plazaFiltro, busqueda]);

  const handleCambiarRol = async (usuario, nuevoRol) => {
    if (!nuevoRol || nuevoRol === usuario.rol) return;
    try {
      setWorkingId(usuario.id);
      const actualizado = await perfilesService.cambiarRol(usuario.id, nuevoRol);
      setUsuarios(prev => prev.map(u => (u.id === usuario.id ? { ...u, rol: actualizado.rol } : u)));
    } catch (err) {
      console.error("Error cambiando rol:", err);
      alert("No se pudo cambiar el rol. Verifica permisos o intenta nuevamente.");
    } finally {
      setWorkingId(null);
    }
  };

  const handleResetPassword = async (usuario) => {
    const email = getCorreo(usuario);
    if (!email) {
      alert("No se encontró el correo de este usuario en su perfil.");
      return;
    }
    try {
      setWorkingId(usuario.id);
      await authService.resetPassword(email);
      alert(`Se envió un correo de restablecimiento a ${email}.`);
    } catch (err) {
      console.error("Error enviando restablecimiento:", err);
      alert("No se pudo enviar el correo de restablecimiento. Intenta nuevamente.");
    } finally {
      setWorkingId(null);
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      searchable: true,
      render: (v, row) => (
        <div>
          <div className="font-medium text-gray-900">{row?.nombre || '-'}</div>
          <div className="text-sm text-gray-500">{getCorreo(row) || '—'}</div>
        </div>
      )
    },
    {
      key: 'rol',
      label: 'Rol',
      searchable: true,
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{row?.rol}</span>
          <div className="relative">
            <select
              className="text-sm border rounded px-2 py-1 bg-white"
              value={row?.rol || ''}
              onChange={(e) => handleCambiarRol(row, e.target.value)}
              disabled={workingId === row.id}
              title="Cambiar rol"
            >
              {ROLES_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      )
    },
    {
      key: 'plaza',
      label: 'Plaza',
      render: (v, row) => (
        <span className="text-gray-700">{getPlazaNombre(row)}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Creado',
      type: 'datetime',
      render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—'
    }
  ];

  return (
    <Layout title="Usuarios del Sistema">
      <div className="p-6 space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
          <button
            onClick={cargarUsuarios}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            title="Recargar"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, correo o rol"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-72">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por plaza</label>
            <div className="relative">
              <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <select
                className="w-full border rounded-lg pl-9 pr-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                value={plazaFiltro}
                onChange={(e) => setPlazaFiltro(e.target.value)}
              >
                {plazasList.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">{error}</div>
        )}

        <Table
          columns={columns}
          data={usuariosFiltrados}
          loading={loading}
          searchTerm={busqueda}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleResetPassword(row); }}
                className="px-3 py-1.5 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                disabled={workingId === row.id}
                title="Enviar correo de restablecimiento"
              >
                <KeyRound className="h-4 w-4 inline mr-1" /> Restablecer
              </button>
            </div>
          )}
          emptyMessage="No hay usuarios para mostrar"
          emptyIcon={Users}
        />

        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Para restablecer contraseñas, se envía un correo con el enlace de recuperación al usuario.
        </div>
      </div>
    </Layout>
  );
}
