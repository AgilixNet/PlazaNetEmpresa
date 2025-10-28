import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { Home, Plus, Edit, Trash2, Search, AlertCircle } from "lucide-react";
import { localesService } from "../../services/localesService";
import { perfilesService } from "../../services/perfilesService";
import { useForm } from "../../hooks/useForm";
import { useFetch } from "../../hooks/useFetch";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Table from "../../components/common/Table";

export default function OwnerLocales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // create, edit, delete
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch de locales
  const { data: locales, loading: loadingLocales, refetch: refetchLocales } = useFetch(
    () => localesService.getAll(),
    []
  );

  // Fetch de arrendadores para el select
  const { data: arrendadores } = useFetch(
    () => perfilesService.getArrendadores(),
    []
  );

  // Obtener estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await localesService.getEstadisticas();
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };
    loadStats();
  }, [locales]);

  // Hook de formulario
  const form = useForm(
    {
      nombre: "",
      ubicacion: "",
      estado: "disponible",
      precio_mensu: "",
      arrendador_id: ""
    },
    async (data) => {
      try {
        if (modalType === "create") {
          await localesService.create({
            ...data,
            precio_mensu: parseFloat(data.precio_mensu)
          });
        } else if (modalType === "edit") {
          await localesService.update(selectedLocal.id, {
            ...data,
            precio_mensu: parseFloat(data.precio_mensu)
          });
        }
        
        alert(
          modalType === "create"
            ? "Local creado exitosamente"
            : "Local actualizado exitosamente"
        );
        
        setShowModal(false);
        form.resetForm();
        setSelectedLocal(null);
        refetchLocales();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  );

  const handleCreate = () => {
    setModalType("create");
    setSelectedLocal(null);
    form.resetForm();
    setShowModal(true);
  };

  const handleEdit = (local) => {
    setModalType("edit");
    setSelectedLocal(local);
    form.setFormData({
      nombre: local.nombre,
      ubicacion: local.ubicacion,
      estado: local.estado,
      precio_mensu: local.precio_mensu,
      arrendador_id: local.arrendador_id || ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (local) => {
    setSelectedLocal(local);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await localesService.delete(selectedLocal.id);
      alert("Local eliminado exitosamente");
      setShowDeleteConfirm(false);
      setSelectedLocal(null);
      refetchLocales();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    form.resetForm();
    setSelectedLocal(null);
  };

  // Columnas de la tabla
  const columns = [
    {
      key: "nombre",
      label: "Nombre",
      sortable: true,
      searchable: true
    },
    {
      key: "ubicacion",
      label: "Ubicación",
      sortable: true,
      searchable: true
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === "disponible"
            ? "bg-green-100 text-green-800"
            : "bg-blue-100 text-blue-800"
        }`}>
          {value === "disponible" ? "Disponible" : "Ocupado"}
        </span>
      )
    },
    {
      key: "precio_mensu",
      label: "Precio Mensual",
      type: "currency",
      sortable: true,
      render: (value) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value || 0)
    }
  ];

  const renderActions = (local) => (
    <>
      <button
        onClick={() => handleEdit(local)}
        className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm"
      >
        <Edit className="h-4 w-4" />
        Editar
      </button>
      <button
        onClick={() => handleDeleteClick(local)}
        className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </button>
    </>
  );

  return (
    <Layout title="Gestión de Locales">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-blue-100 text-sm font-medium">Total Locales</p>
            <p className="text-4xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-green-100 text-sm font-medium">Disponibles</p>
            <p className="text-4xl font-bold mt-2">{stats.disponibles}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-purple-100 text-sm font-medium">Ocupados</p>
            <p className="text-4xl font-bold mt-2">{stats.ocupados}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-orange-100 text-sm font-medium">Ingreso Mensual</p>
            <p className="text-2xl font-bold mt-2">
              ${(stats.ingresoMensualPotencial / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      )}

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

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Nuevo Local
          </button>
        </div>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={locales || []}
        loading={loadingLocales}
        emptyMessage="No hay locales registrados"
        emptyIcon={Home}
        searchTerm={searchTerm}
        actions={renderActions}
      />

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalType === "create" ? "Crear Nuevo Local" : "Editar Local"}
        size="lg"
        footer={
          <>
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={form.handleSubmit}
              disabled={form.loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {form.loading ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <FormField
            label="Nombre del Local"
            name="nombre"
            value={form.formData.nombre}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.nombre}
            touched={form.touched.nombre}
            placeholder="Ej: Local 101"
            required
          />

          <FormField
            label="Ubicación"
            name="ubicacion"
            value={form.formData.ubicacion}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.ubicacion}
            touched={form.touched.ubicacion}
            placeholder="Ej: Piso 1, Puerta A"
            required
          />

          <FormField
            label="Precio Mensual"
            name="precio_mensu"
            type="number"
            value={form.formData.precio_mensu}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.precio_mensu}
            touched={form.touched.precio_mensu}
            placeholder="Ej: 500000"
            required
          />

          <FormField
            label="Estado"
            name="estado"
            type="select"
            value={form.formData.estado}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            options={[
              { value: "disponible", label: "Disponible" },
              { value: "ocupado", label: "Ocupado" }
            ]}
            required
          />

          {form.formData.estado === "ocupado" && (
            <FormField
              label="Asignar Arrendador"
              name="arrendador_id"
              type="select"
              value={form.formData.arrendador_id}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              options={[
                { value: "", label: "Sin asignar" },
                ...(arrendadores || []).map(a => ({
                  value: a.id,
                  label: a.nombre
                }))
              ]}
            />
          )}
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Eliminación"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Eliminar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">
                ¿Estás seguro de que quieres eliminar este local?
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Local: <strong>{selectedLocal?.nombre}</strong>
              </p>
              <p className="text-gray-600 text-sm">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}