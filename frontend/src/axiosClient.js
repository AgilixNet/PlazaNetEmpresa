import axios from 'axios';

// URL base de tu API
const API_URL = 'https://neriah-burriest-sentiently.ngrok-free.dev';

// Crear una instancia de Axios
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { axiosClient };
