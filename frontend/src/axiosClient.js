import axios from 'axios';

// URL base de tu API (leer de env con respaldo al valor actual)
const API_URL = (import.meta?.env?.VITE_API_URL) || 'https://neriah-burriest-sentiently.ngrok-free.dev';

// Crear una instancia de Axios
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Header especial para ngrok
  },
  withCredentials: false, // Importante para CORS
});

// Interceptor para manejar respuestas
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en axiosClient:', error);
    
    // Si hay error CORS o de red, devolver array vacío
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.warn('Error de red detectado, devolviendo datos vacíos');
      return Promise.reject({
        ...error,
        response: { data: [] }
      });
    }
    
    return Promise.reject(error);
  }
);

export { axiosClient };
