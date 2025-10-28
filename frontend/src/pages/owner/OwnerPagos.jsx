import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { DollarSign, Plus, Edit, Trash2, Search, CheckCircle, AlertCircle } from "lucide-react";
import { pagosService } from "../../services/pagosService";
import { useForm } from "../../hooks/useForm";
import { useFetch } from "../../hooks/useFetch";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Table from "../../components/common/Table";

export default function OwnerPagos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedPago, setSelectedPago] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch de pagos
  const { data: pagos, loading, refetch } = useFetch(
    () => pagosService.getAll(),
    []
  );

  // Obtener estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await pagosService.getEstadisticas();
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };
    loadStats();
  }, [pagos]);

  // Hook de formulario
  const form = useForm(
    {
      arrendamiento_id: "",
      valor: "",
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      estado: "pendiente"
    },
    async (data) => {
      try {
        if (modalType === "create") {
          await pagosService.create({
            ...data,
            valor: parseFloat(data.valor)
          });
        } else if (modalType === "edit") {
          await pagosService.update(selectedPago.id, {
            ...data,
            valor: parseFloat(data.valor)
          });
        }
        
        alert(
          modalType === "create"
            ? "Pago creado exitosamente"
            : "Pago actualizado exitosamente"
        );
        
        setShowModal(false);
        form.resetForm();
        setSelectedPago(null);
        refetch();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  );

  const handleCreate = () => {
    setModalType("create");
    setSelectedPago(null);
    form.resetForm();
    setShowModal(true);
  };

  const handleEdit = (pago) => {
    setModalType("edit");
    setSelectedPago(pago);
    form.setFormData({
      arrendamiento_id: pago.arrendamiento_id,
      valor: pago.valor,
      mes: pago.mes,
      anio: pago.anio,
      estado: pago.estado
    });
    setShowModal(true);
  };

  const handleMarkAsRealizado = async (pago) => {
    try {
      await pagosService.marcarRealizado(pago.id, "transferencia");
      alert("Pago marcado como realizado");
      refetch();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteClick = (pago) => {
    setSelectedPago(pago);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await pagosService.delete(selectedPago.id);
      alert("Pago eliminado exitosamente");
      setShowDeleteConfirm(false);
      setSelectedPago(null);
      refetch();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    form.resetForm();
    setSelectedPago(null);
  };

  // Filtrar pagos
  let filteredPagos = pagos || [];
  if (filterStatus !== "all") {
    filteredPagos = filteredPagos.filter(p => p.estado === filterStatus);
  }

  // Columnas de la tabla
  const columns = [
    {
      key: "mes",
      label: "Mes/Año",
      render: (value, row) => `${value}/${row.anio}`,
      sortable: true
    },
    {
      key: "valor",
      label: "Valor",
      type: "currency",
      render: (value) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value || 0),
      sortable: true
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === "realizado"
            ? "bg-green-100 text-green-800"
            : "bg-orange-100 text-orange-800"
        }`}>
          {value === "realizado" ? "Realizado" : "Pendiente"}
        </span>
      ),
      sortable: true
    }
  ];

  const renderActions = (pago) => (
    <>
      {pago.estado === "pendiente" && (
        <button
          onClick={() => handleMarkAsRealizado(pago)}
          className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition text-sm"
        >
          <CheckCircle className="h-4 w-4" />
          Marcar Pagado
        </button>
      )}
      <button
        onClick={() => handleEdit(pago)}
        className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm"
      >
        <Edit className="h-4 w-4" />
        Editar
      </button>
      <button
        onClick={() => handleDeleteClick(pago)}
        className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </button>
    </>
  );

  return (
    <Layout title="Gestión de Pagos">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-blue-100 text-xs font-medium">Total Pagos</p>
            <p className="text-3xl font-bold mt-2">{stats.totalPagos}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-green-100 text-xs font-medium">Realizados</p>
            <p className="text-3xl font-bold mt-2">{stats.pagosRealizados}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-orange-100 text-xs font-medium">Pendientes</p>
            <p className="text-3xl font-bold mt-2">{stats.pagosPendientes}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-purple-100 text-xs font-medium">Pendiente</p>
            <p className="text-2xl font-bold mt-2">
              ${(stats.totalPendiente / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar pagos..."
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
              Nuevo Pago
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("pendiente")}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === "pendiente"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus("realizado")}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === "realizado"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Realizados
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={filteredPagos}
        loading={loading}
        emptyMessage="No hay pagos registrados"
        emptyIcon={DollarSign}
        searchTerm={searchTerm}
        actions={renderActions}
      />

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalType === "create" ? "Crear Nuevo Pago" : "Editar Pago"}
        size="md"
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
            label="Valor del Pago"
            name="valor"
            type="number"
            value={form.formData.valor}
            onChange={form.handleChange}
            placeholder="Ej: 500000"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Mes"
              name="mes"
              type="number"
              value={form.formData.mes}
              onChange={form.handleChange}
              min="1"
              max="12"
              required
            />
            <FormField
              label="Año"
              name="anio"
              type="number"
              value={form.formData.anio}
              onChange={form.handleChange}
              required
            />
          </div>

          <FormField
            label="Estado"
            name="estado"
            type="select"
            value={form.formData.estado}
            onChange={form.handleChange}
            options={[
              { value: "pendiente", label: "Pendiente" },
              { value: "realizado", label: "Realizado" }
            ]}
            required
          />
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
                ¿Estás seguro de que quieres eliminar este pago?
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Pago de ${selectedPago?.valor?.toLocaleString()} - {selectedPago?.mes}/{selectedPago?.anio}
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