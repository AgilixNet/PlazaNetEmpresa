import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/common/Layout";
import { solicitudesService } from "../../services/solicitudesService";
import { axiosClient } from "../../axiosClient";
import { 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  FileText, 
  FileCheck, 
  Calendar,
  Mail,
  Phone,
  Building2
} from "lucide-react";

const TIPO_SUSCRIPCION_LABELS = {
  basico: 'Básico',
  pro: 'Pro',
  full: 'Full'
};

const ESTADO_BADGES = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobada: 'bg-green-100 text-green-800',
  rechazada: 'bg-red-100 text-red-800'
};

const ESTADOS = {
  TODOS: 'todos',
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada'
};

export default function AdminSoftwareSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(ESTADOS.TODOS);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    if (filtroEstado === ESTADOS.TODOS) return solicitudes;
    return solicitudes.filter(s => s.estado === filtroEstado);
  }, [solicitudes, filtroEstado]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await solicitudesService.getAll();
      setSolicitudes(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      setError("No se pudieron cargar las solicitudes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const detalle = await solicitudesService.getById(id);
      setSolicitudDetalle(detalle);
      setShowDetalleModal(true);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      // Mostrar error en un toast o alert
    }
  };

  const handleActualizarEstado = async (id, nuevoEstado, comentario = '') => {
    try {
      await solicitudesService.update(id, { 
        estado: nuevoEstado,
        comentarioAdmin: comentario || getComentarioPorEstado(nuevoEstado)
      });
      // Actualizar la lista de solicitudes
      await cargarSolicitudes();
      // Si el modal está abierto, actualizar también el detalle
      if (solicitudDetalle?.id === id) {
        const detalleActualizado = await solicitudesService.getById(id);
        setSolicitudDetalle(detalleActualizado);
      }
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Error al actualizar el estado de la solicitud. Por favor, intenta de nuevo.");
    }
  };

  const getComentarioPorEstado = (estado) => {
    switch (estado) {
      case 'aprobada':
        return 'Solicitud aprobada. Se enviará un correo con los detalles de acceso.';
      case 'rechazada':
        return 'Solicitud rechazada. Para más información, contacte con soporte.';
      default:
        return '';
    }
  };

  const handleDownloadFile = async (fileUrl, defaultFilename) => {
    try {
      // Si la URL ya es completa (comienza con http:// o https://), usarla directamente
      const url = fileUrl.startsWith('http') ? fileUrl : `${axiosClient.defaults.baseURL}/api/files/${fileUrl}`;
      
      const response = await axiosClient.get(url, {
        responseType: 'blob',
      });
      
      // Crear un objeto URL para el blob
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Obtener el nombre del archivo de las cabeceras o usar el predeterminado
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
        : defaultFilename;
      
      // Crear un elemento <a> temporal para la descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el objeto URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert('Error al descargar el archivo. Por favor, intenta de nuevo.');
    }
  };

  const DetalleModal = ({ solicitud, onClose }) => {
    if (!solicitud) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Detalle de Solicitud</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>Creada el: {new Date(solicitud.createdAt).toLocaleDateString('es-CO')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Representante Legal</p>
                  <p className="font-semibold">{solicitud.nombreRepresentante}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ESTADO_BADGES[solicitud.estado] || 'bg-gray-100 text-gray-800'}`}>
                    {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Correo Electrónico</p>
                  </div>
                  <p className="font-semibold">{solicitud.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Teléfono</p>
                  </div>
                  <p className="font-semibold">{solicitud.telefono || 'No especificado'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Nombre de la Plaza</p>
                  </div>
                  <p className="font-semibold">{solicitud.nombrePlaza}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Tipo de Suscripción</p>
                  <p className="font-semibold">{TIPO_SUSCRIPCION_LABELS[solicitud.tipoSuscripcion] || solicitud.tipoSuscripcion}</p>
                </div>
              </div>

              {/* Documentos */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Documentos Adjuntos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solicitud.cedulaUrl && (
                    <button
                      onClick={() => handleDownloadFile(solicitud.cedulaUrl, 'cedula.pdf')}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span>Ver/Descargar Cédula</span>
                    </button>
                  )}
                  {solicitud.rutUrl && (
                    <button
                      onClick={() => handleDownloadFile(solicitud.rutUrl, 'rut.pdf')}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                      <span>Ver/Descargar RUT</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => handleActualizarEstado(solicitud.id, 'pendiente')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
                  ${solicitud.estado === 'pendiente' 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}
                disabled={solicitud.estado === 'pendiente'}
              >
                <span className="w-3 h-3 rounded-full bg-yellow-300"></span>
                Marcar Pendiente
              </button>
              <button
                onClick={() => handleActualizarEstado(solicitud.id, 'aprobada')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
                  ${solicitud.estado === 'aprobada'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'}`}
                disabled={solicitud.estado === 'aprobada'}
              >
                <Check className="h-5 w-5" />
                Aprobar
              </button>
              <button
                onClick={() => handleActualizarEstado(solicitud.id, 'rechazada')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
                  ${solicitud.estado === 'rechazada'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'}`}
                disabled={solicitud.estado === 'rechazada'}
              >
                <X className="h-5 w-5" />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout title="Solicitudes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Solicitudes">
      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Resumen de Solicitudes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div 
            onClick={() => setFiltroEstado(ESTADOS.TODOS)}
            className={`cursor-pointer rounded-xl shadow-sm p-4 ${
              filtroEstado === ESTADOS.TODOS ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-500">Total Solicitudes</p>
            <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
          </div>
          
          <div 
            onClick={() => setFiltroEstado(ESTADOS.PENDIENTE)}
            className={`cursor-pointer rounded-xl shadow-sm p-4 ${
              filtroEstado === ESTADOS.PENDIENTE ? 'bg-yellow-50 border-2 border-yellow-500' : 'bg-white border border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {solicitudes.filter(s => s.estado === 'pendiente').length}
            </p>
          </div>
          
          <div 
            onClick={() => setFiltroEstado(ESTADOS.APROBADA)}
            className={`cursor-pointer rounded-xl shadow-sm p-4 ${
              filtroEstado === ESTADOS.APROBADA ? 'bg-green-50 border-2 border-green-500' : 'bg-white border border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-500">Aprobadas</p>
            <p className="text-2xl font-bold text-green-600">
              {solicitudes.filter(s => s.estado === 'aprobada').length}
            </p>
          </div>
          
          <div 
            onClick={() => setFiltroEstado(ESTADOS.RECHAZADA)}
            className={`cursor-pointer rounded-xl shadow-sm p-4 ${
              filtroEstado === ESTADOS.RECHAZADA ? 'bg-red-50 border-2 border-red-500' : 'bg-white border border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-500">Rechazadas</p>
            <p className="text-2xl font-bold text-red-600">
              {solicitudes.filter(s => s.estado === 'rechazada').length}
            </p>
          </div>
        </div>

        {/* Tabla de Solicitudes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Representante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plaza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suscripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(solicitud.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {solicitud.nombreRepresentante}
                      </div>
                      <div className="text-sm text-gray-500">{solicitud.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {solicitud.nombrePlaza}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {TIPO_SUSCRIPCION_LABELS[solicitud.tipoSuscripcion] || solicitud.tipoSuscripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGES[solicitud.estado] || 'bg-gray-100 text-gray-800'}`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <button
                            onClick={() => handleVerDetalle(solicitud.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="Ver detalle"
                          >
                            <Eye className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleActualizarEstado(solicitud.id, 'aprobada')}
                            className={`p-1 rounded-full transition-colors ${
                              solicitud.estado === 'aprobada' 
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title="Aprobar"
                            disabled={solicitud.estado === 'aprobada'}
                          >
                            <Check className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleActualizarEstado(solicitud.id, 'rechazada')}
                            className={`p-1 rounded-full transition-colors ${
                              solicitud.estado === 'rechazada'
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                            }`}
                            title="Rechazar"
                            disabled={solicitud.estado === 'rechazada'}
                          >
                            <X className="h-5 w-5" />
                          </button>

                          {solicitud.estado !== 'pendiente' && (
                            <button
                              onClick={() => handleActualizarEstado(solicitud.id, 'pendiente')}
                              className="p-1 rounded-full text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 transition-colors"
                              title="Marcar como pendiente"
                            >
                              <div className="h-5 w-5 flex items-center justify-center">
                                <span className="block w-3 h-3 rounded-full bg-yellow-400"></span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {showDetalleModal && (
        <DetalleModal
          solicitud={solicitudDetalle}
          onClose={() => {
            setShowDetalleModal(false);
            setSolicitudDetalle(null);
          }}
        />
      )}
    </Layout>
  );
}