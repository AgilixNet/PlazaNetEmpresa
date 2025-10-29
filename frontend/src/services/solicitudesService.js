import { axiosClient } from '../axiosClient';

export const solicitudesService = {
  // Obtener todas las solicitudes
  async getAll() {
    const { data } = await axiosClient.get('/api/solicitudes');
    return data;
  },

  // Obtener una solicitud por ID
  async getById(id) {
    const { data } = await axiosClient.get(`/api/solicitudes/${id}`);
    return data;
  },

  // Crear una nueva solicitud
  async create(solicitudData) {
    const { data } = await axiosClient.post('/api/solicitudes', solicitudData);
    return data;
  },

  // Actualizar una solicitud (incluyendo cambio de estado)
  async update(id, solicitudData) {
    const { data } = await axiosClient.put(`/api/solicitudes/${id}`, {
      estado: solicitudData.estado,
      comentarioAdmin: solicitudData.comentarioAdmin,
      fechaActualizacion: new Date().toISOString()
    });
    return data;
  },

  // Eliminar una solicitud
  async delete(id) {
    await axiosClient.delete(`/api/solicitudes/${id}`);
  }
};