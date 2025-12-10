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

// Función genérica para actualizar datos (PUT)
async function putData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error("Error actualizando datos:", error);
        throw error;
    }
}

// Función genérica para eliminar datos (DELETE)

async function deleteData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        // Algunas APIs retornan 204 No Content
        if (response.status === 204) return true;
        return await response.json();
    } catch (error) {
        console.error("Error eliminando datos:", error);
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

// 3. Clientes: Actualizar cliente
async function updateClient(clientId, clientData) {
    return await putData(`/clients/${clientId}`, clientData);
}

// 4. Órdenes: Crear orden
async function createOrder(orderData) {
    return await postData('/orders', orderData);
}

// 5. Órdenes: Obtener órdenes por cliente (Filtrado manual por ahora)
async function getOrdersByClient(clientId) {
    const orders = await fetchData('/orders?skip=0&limit=1000');
    if (!orders) return [];
    return orders.filter(o => o.client_id === clientId);
}

// 6. Órdenes: Cancelar orden (PUT status = 4)
async function cancelOrder(orderId) {
    // Status 4 = CANCELED
    return await putData(`/orders/${orderId}`, { status: 4 });
}

// 7. Reseñas: Crear reseña
async function createReview(reviewData) {
    // reviewData: { rating, comment, product_id, client_id (opt) }
    return await postData('/reviews', reviewData);
}

// 8. Reseñas: Obtener reseñas por producto
async function getProductReviews(productId) {
    const reviews = await fetchData('/reviews?skip=0&limit=1000');
    if (!reviews) return [];
    return reviews.filter(r => r.product_id === productId);
}

// 9. Productos: CRUD
async function createProduct(productData) {
    return await postData('/products', productData);
}

async function updateProduct(id, productData) {
    return await putData(`/products/${id}`, productData);
}

async function deleteProduct(id) {
    return await deleteData(`/products/${id}`);
}

// 10. Categorías: CRUD
async function getCategories() {
    return await fetchData('/categories');
}

async function createCategory(categoryData) {
    return await postData('/categories', categoryData);
}

async function updateCategory(id, categoryData) {
    return await putData(`/categories/${id}`, categoryData);
}

async function deleteCategory(id) {
    return await deleteData(`/categories/${id}`);
}

export {
    fetchData, postData, putData, deleteData,
    findClientByEmail, createClient, updateClient,
    createOrder, getOrdersByClient, cancelOrder,
    createReview, getProductReviews,
    createProduct, updateProduct, deleteProduct,
    getCategories, createCategory, updateCategory, deleteCategory
};