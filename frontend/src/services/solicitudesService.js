import { axiosClient } from '../axiosClient';

export const solicitudesService = {
  // Obtener todas las solicitudes
  async getAll() {
    const { data } = await axiosClient.get('/solicitudes');
    return data;
  },

  // Obtener una solicitud por ID
  async getById(id) {
    const { data } = await axiosClient.get(`/solicitudes/${id}`);
    return data;
  },

  // Crear una nueva solicitud
  async create(solicitudData) {
    const { data } = await axiosClient.post('/solicitudes', solicitudData);
    return data;
  },

  // Actualizar una solicitud (incluyendo cambio de estado)
  async update(id, solicitudData) {
    const { data } = await axiosClient.put(`/api/solicitudes/${id}`, solicitudData);
    return data;
  },

  // Eliminar una solicitud
  async delete(id) {
    await axiosClient.delete(`/api/solicitudes/${id}`);
  }
};