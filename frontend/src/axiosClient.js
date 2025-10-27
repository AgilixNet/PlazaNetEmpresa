import axios from 'axios';

// URL base de tu API
const API_URL = 'http://localhost:5000/api/solicitudes';

// Crear una instancia de Axios
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
