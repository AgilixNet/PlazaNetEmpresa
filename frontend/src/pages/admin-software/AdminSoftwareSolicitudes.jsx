import React, { useState, useEffect } from 'react';
import { solicitudesService } from '../../services/solicitudesService';
import { ESTADOS_SOLICITUD } from '../../utils/constants';
import { FileText, CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';

export default function AdminSoftwareSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const data = await solicitudesService.getSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setError(error.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      const solicitudActualizada = await solicitudesService.actualizarSolicitud(id, {
        estado: nuevoEstado
      });
      
      // Actualizar la lista de solicitudes
      setSolicitudes(prev => 
        prev.map(sol => 
          sol.id === id ? solicitudActualizada : sol
        )
      );

      // Cerrar el modal si está abierto
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar solicitud:', error);
      setError(error.message || 'No se pudo actualizar el estado de la solicitud');
    }
  };

  const verDetalleSolicitud = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Solicitudes</h1>
          <p className="mt-2 text-gray-600">Administra las solicitudes de registro de plazas comerciales</p>
        </div>

        {/* Lista de Solicitudes */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plaza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Representante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {solicitud.nombre_plaza}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{solicitud.nombre_representante}</div>
                      <div className="text-sm text-gray-500">{solicitud.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {solicitud.tipo_suscripcion.charAt(0).toUpperCase() + 
                         solicitud.tipo_suscripcion.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${solicitud.estado === ESTADOS_SOLICITUD.PENDIENTE && 'bg-yellow-100 text-yellow-800'}
                        ${solicitud.estado === ESTADOS_SOLICITUD.APROBADA && 'bg-green-100 text-green-800'}
                        ${solicitud.estado === ESTADOS_SOLICITUD.RECHAZADA && 'bg-red-100 text-red-800'}
                      `}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(solicitud.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => verDetalleSolicitud(solicitud)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {solicitud.estado === ESTADOS_SOLICITUD.PENDIENTE && (
                        <>
                          <button
                            onClick={() => actualizarEstadoSolicitud(solicitud.id, ESTADOS_SOLICITUD.APROBADA)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => actualizarEstadoSolicitud(solicitud.id, ESTADOS_SOLICITUD.RECHAZADA)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {showModal && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-2xl font-semibold text-gray-900">Detalle de Solicitud</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Información de la Plaza</h4>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Nombre:</span> {solicitudSeleccionada.nombre_plaza}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Plan Seleccionado:</span> {
                    solicitudSeleccionada.tipo_suscripcion.charAt(0).toUpperCase() + 
                    solicitudSeleccionada.tipo_suscripcion.slice(1)
                  }
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">Información del Representante</h4>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Nombre:</span> {solicitudSeleccionada.nombre_representante}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Email:</span> {solicitudSeleccionada.email}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Teléfono:</span> {solicitudSeleccionada.telefono}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">Documentos</h4>
                <div className="mt-2 space-y-2">
                  <a
                    href={solicitudSeleccionada.cedula_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Cédula
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <a
                    href={solicitudSeleccionada.rut_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver RUT
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">Estado de la Solicitud</h4>
                <div className="mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full
                    ${solicitudSeleccionada.estado === ESTADOS_SOLICITUD.PENDIENTE && 'bg-yellow-100 text-yellow-800'}
                    ${solicitudSeleccionada.estado === ESTADOS_SOLICITUD.APROBADA && 'bg-green-100 text-green-800'}
                    ${solicitudSeleccionada.estado === ESTADOS_SOLICITUD.RECHAZADA && 'bg-red-100 text-red-800'}
                  `}>
                    {solicitudSeleccionada.estado.charAt(0).toUpperCase() + solicitudSeleccionada.estado.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {solicitudSeleccionada.estado === ESTADOS_SOLICITUD.PENDIENTE && (
              <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                <button
                  onClick={() => actualizarEstadoSolicitud(solicitudSeleccionada.id, ESTADOS_SOLICITUD.RECHAZADA)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => actualizarEstadoSolicitud(solicitudSeleccionada.id, ESTADOS_SOLICITUD.APROBADA)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Aprobar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}