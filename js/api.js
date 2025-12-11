// Importar la configuración centralizada
import { API_BASE_URL } from './config.js';

// --- Funciones Genéricas ---

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

async function deleteData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        // 204 No Content es común en DELETE exitosos
        if (response.status === 204) return true;
        return await response.json();
    } catch (error) {
        console.error("Error eliminando datos:", error);
        throw error;
    }
}

// --- Health Check ---
async function checkHealth() {
    return await fetchData('/health_check/');
}

// --- 1. Clientes (/clients) ---

async function getClients(skip = 0, limit = 10) {
    return await fetchData(`/clients/?skip=${skip}&limit=${limit}`);
}

async function getClientById(id) {
    return await fetchData(`/clients/${id}`);
}

// Buscar por email (usando filtro en frontend por ahora si la API no soporta query param)
async function findClientByEmail(email) {
    const clients = await fetchData('/clients/?skip=0&limit=1000');
    if (!clients) return null;
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase());
}

async function createClient(clientData) {
    return await postData('/clients/', clientData);
}

async function updateClient(id, clientData) {
    return await putData(`/clients/${id}`, clientData);
}

async function deleteClient(id) {
    return await deleteData(`/clients/${id}`);
}

// --- 2. Órdenes (/orders) ---

async function getOrders(skip = 0, limit = 10) {
    return await fetchData(`/orders/?skip=${skip}&limit=${limit}`);
}

async function getOrderById(id) {
    return await fetchData(`/orders/${id}`);
}

async function getOrdersByClient(clientId) {
    // Idealmente sería /orders/?client_id=... pero mantenemos lógica previa de filtro
    const orders = await fetchData('/orders/?skip=0&limit=1000');
    if (!orders) return [];
    return orders.filter(o => o.client_id === clientId);
}

async function createOrder(orderData) {
    return await postData('/orders/', orderData);
}

async function updateOrder(id, orderData) {
    return await putData(`/orders/${id}`, orderData);
}

async function cancelOrder(id) {
    return await putData(`/orders/${id}`, { status: 4 });
}

async function deleteOrder(id) {
    return await deleteData(`/orders/${id}`);
}

// --- 3. Productos (/products) ---

async function getProducts(skip = 0, limit = 10) {
    return await fetchData(`/products/?skip=${skip}&limit=${limit}`);
}

async function getProductById(id) {
    return await fetchData(`/products/${id}`);
}

async function createProduct(productData) {
    return await postData('/products/', productData);
}

async function updateProduct(id, productData) {
    return await putData(`/products/${id}`, productData);
}

async function deleteProduct(id) {
    return await deleteData(`/products/${id}`);
}

// --- 4. Direcciones (/addresses) ---

async function getAddresses(skip = 0, limit = 10) {
    return await fetchData(`/addresses/?skip=${skip}&limit=${limit}`);
}

async function getAddressById(id) {
    return await fetchData(`/addresses/${id}`);
}

async function createAddress(addressData) {
    return await postData('/addresses/', addressData);
}

async function updateAddress(id, addressData) {
    return await putData(`/addresses/${id}`, addressData);
}

async function deleteAddress(id) {
    return await deleteData(`/addresses/${id}`);
}

// --- 5. Facturas (/bills) ---

async function getBills(skip = 0, limit = 10) {
    return await fetchData(`/bills/?skip=${skip}&limit=${limit}`);
}

async function getBillById(id) {
    return await fetchData(`/bills/${id}`);
}

async function createBill(billData) {
    return await postData('/bills/', billData);
}

async function updateBill(id, billData) {
    return await putData(`/bills/${id}`, billData);
}

async function deleteBill(id) {
    return await deleteData(`/bills/${id}`);
}

// --- 6. Detalles de Orden (/order_details) ---

async function getOrderDetails(skip = 0, limit = 10) {
    return await fetchData(`/order_details/?skip=${skip}&limit=${limit}`);
}

async function getOrderDetailById(id) {
    return await fetchData(`/order_details/${id}`);
}

async function createOrderDetail(detailData) {
    // Nota: El backend tiene rate limiting (10 req/min). 
    // Si falla con 429, postData lanzará error.
    return await postData('/order_details/', detailData);
}

async function updateOrderDetail(id, detailData) {
    return await putData(`/order_details/${id}`, detailData);
}

async function deleteOrderDetail(id) {
    return await deleteData(`/order_details/${id}`);
}

// --- 7. Reseñas (/reviews) ---

async function getReviews(skip = 0, limit = 10) {
    return await fetchData(`/reviews/?skip=${skip}&limit=${limit}`);
}

async function getReviewById(id) {
    return await fetchData(`/reviews/${id}`);
}

async function getProductReviews(productId) {
    const reviews = await fetchData('/reviews/?skip=0&limit=1000');
    if (!reviews) return [];
    return reviews.filter(r => r.product_id === productId);
}

async function createReview(reviewData) {
    return await postData('/reviews/', reviewData);
}

async function updateReview(id, reviewData) {
    return await putData(`/reviews/${id}`, reviewData);
}

async function deleteReview(id) {
    return await deleteData(`/reviews/${id}`);
}

// --- 8. Categorías (/categories) ---

async function getCategories(skip = 0, limit = 10) {
    // A menudo se quieren todas las categorías, así que el default podría ser alto o manejado por UI
    return await fetchData(`/categories/?skip=${skip}&limit=${limit}`);
}

async function getCategoryById(id) {
    return await fetchData(`/categories/${id}`);
}

async function createCategory(categoryData) {
    return await postData('/categories/', categoryData);
}

async function updateCategory(id, categoryData) {
    return await putData(`/categories/${id}`, categoryData);
}

async function deleteCategory(id) {
    return await deleteData(`/categories/${id}`);
}

export {
    // Generics
    fetchData, postData, putData, deleteData,

    // Health Check
    checkHealth,

    // Clients
    getClients, getClientById, findClientByEmail, createClient, updateClient, deleteClient,

    // Orders
    getOrders, getOrderById, getOrdersByClient, createOrder, updateOrder, cancelOrder, deleteOrder,

    // Products
    getProducts, getProductById, createProduct, updateProduct, deleteProduct,

    // Addresses
    getAddresses, getAddressById, createAddress, updateAddress, deleteAddress,

    // Bills
    getBills, getBillById, createBill, updateBill, deleteBill,

    // Order Details
    getOrderDetails, getOrderDetailById, createOrderDetail, updateOrderDetail, deleteOrderDetail,

    // Reviews
    getReviews, getReviewById, getProductReviews, createReview, updateReview, deleteReview,

    // Categories
    getCategories, getCategoryById, createCategory, updateCategory, deleteCategory
};