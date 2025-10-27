import axiosClient from '../axiosClient';

export const solicitudesService = {
  // GET api/solicitudes - Obtener todas las solicitudes
  getSolicitudes: async () => {
    try {
      const response = await axiosClient.get('/api/Solicitudes');
      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener las solicitudes');
    }
  },

  // GET api/solicitudes/{id} - Obtener una solicitud por ID
  getSolicitudById: async (id) => {
    try {
      const response = await axiosClient.get(`/api/Solicitudes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response?.status === 404) {
        throw new Error('Solicitud no encontrada');
      }
      throw new Error(error.response?.data?.error || 'Error al obtener la solicitud');
    }
  },

  // PUT api/solicitudes/{id} - Actualizar una solicitud, incluyendo su estado
  actualizarSolicitud: async (id, solicitudUpdateDTO) => {
    try {
      const response = await axiosClient.put(`/api/Solicitudes/${id}`, solicitudUpdateDTO);
      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response?.status === 404) {
        throw new Error('Solicitud no encontrada');
      }
      throw new Error(error.response?.data?.error || 'Error al actualizar la solicitud');
    }
  },

  // POST api/solicitudes - Crear una nueva solicitud
  crearSolicitud: async (solicitudCreateDTO) => {
    try {
      const response = await axiosClient.post('/api/Solicitudes', solicitudCreateDTO);
      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      throw new Error(error.response?.data?.error || 'Error al crear la solicitud');
    }
  },

  // DELETE api/solicitudes/{id} - Eliminar una solicitud
  eliminarSolicitud: async (id) => {
    try {
      await axiosClient.delete(`/api/solicitudes/${id}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Solicitud no encontrada');
      }
      throw new Error(error.response?.data?.error || 'Error al eliminar la solicitud');
    }
  }
};