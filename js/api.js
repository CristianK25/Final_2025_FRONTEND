// Importar la configuración centralizada
import { API_BASE_URL } from './config.js';

// Función genérica para pedir datos
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en API:", error);
        return null;
    }
}

// Función genérica para enviar datos (POST)
async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Error enviando datos:", error);
        return null;
    }
}

// Exportamos las funciones para usarlas en otros archivos
export { fetchData, postData };