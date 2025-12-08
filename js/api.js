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

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error("Error enviando datos:", error);
        throw error;
    }
}

// --- Funciones Específicas de Negocio ---

// 1. Clientes: Buscar por email
async function findClientByEmail(email) {
    // Nota: Traemos todos para filtrar en cliente porque la API no soporta filtro directo aun
    const clients = await fetchData('/clients?skip=0&limit=1000');
    if (!clients) return null;
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase());
}

// 2. Clientes: Crear nuevo cliente
async function createClient(clientData) {
    // clientData: name, lastname, email, telephone
    return await postData('/clients', clientData);
}

// 3. Órdenes: Crear orden
async function createOrder(orderData) {
    return await postData('/orders', orderData);
}

export { fetchData, postData, findClientByEmail, createClient, createOrder };