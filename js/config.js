// =================================================================
// ARCHIVO DE CONFIGURACIÓN CENTRALIZADA
// -----------------------------------------------------------------
// Este archivo contiene variables de entorno simuladas para facilitar
// el cambio entre entornos de desarrollo y producción.
// =================================================================

// --- Configuración del Backend ---

// Opción 1: Desarrollo Local (usando el proxy de server.py)
// Para desarrollo, usamos una ruta que el proxy pueda interceptar.
// Todas las peticiones a '/api/...' serán redirigidas al backend en localhost:8000.
const API_BASE_URL_DEV = 'http://localhost:8000'; 

// Opción 2: Producción (ej: API desplegada en Render, Vercel, etc.)
// Reemplaza esta URL con la URL de tu backend en producción.
// En un entorno de producción real, esto podría incluir también '/api' si el proxy de producción está configurado así.
const API_BASE_URL_PROD = 'https://tu-backend-en-produccion.onrender.com/api';

// Selecciona la configuración a utilizar.
// Cambia a 'PROD' cuando vayas a desplegar la aplicación.
const ENVIRONMENT = 'DEV'; 

// Exporta la URL base de la API según el entorno seleccionado.
export const API_BASE_URL = ENVIRONMENT === 'PROD' ? API_BASE_URL_PROD : API_BASE_URL_DEV;