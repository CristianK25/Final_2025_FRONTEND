
import { fetchData, createProduct, updateProduct, deleteProduct, getCategories, createCategory, deleteCategory } from './api.js';

// --- Auth Check ---
(function checkAdminSession() {
    const isAdmin = localStorage.getItem('admin_session');
    if (!isAdmin) {
        window.location.href = 'index.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Load Dashboard Data by default
    loadDashboardStats();
});

// --- Navigation ---
window.switchSection = (sectionId) => {
    // 1. Update Sidebar Active State
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    const activeLink = document.getElementById(`nav-${sectionId}`);
    if (activeLink) activeLink.classList.add('active');

    // 2. Show Section
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');

        // Update Title
        const names = {
            'dashboard': 'Dashboard',
            'products': 'Gestión de Productos',
            'categories': 'Gestión de Categorías',
            'orders': 'Gestión de Pedidos',
            'clients': 'Gestión de Clientes',
            'diagnostics': 'Diagnóstico del Sistema'
        };
        document.getElementById('section-title').textContent = names[sectionId] || 'Panel Admin';

        // Load Section Data
        if (sectionId === 'dashboard') loadDashboardStats();
        if (sectionId === 'products') loadProductsTable();
        if (sectionId === 'categories') loadCategoriesTable();
        if (sectionId === 'orders') loadOrdersTable();
    }
};

window.adminLogout = () => {
    localStorage.removeItem('admin_session');
    window.location.href = 'index.html';
};

// --- Dashboard ---

async function loadDashboardStats() {
    document.getElementById('stat-orders').textContent = '...';
    document.getElementById('stat-sales').textContent = '...';
    document.getElementById('stat-clients').textContent = '...';
    document.getElementById('stat-products').textContent = '...';

    const [orders, products, clients] = await Promise.all([
        fetchData('/orders?skip=0&limit=1000'),
        fetchData('/products?skip=0&limit=1000'),
        fetchData('/clients?skip=0&limit=1000')
    ]);

    if (orders) {
        document.getElementById('stat-orders').textContent = orders.length;
        const sales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        document.getElementById('stat-sales').textContent = `$${sales.toFixed(2)}`;

        // Latest Orders
        const latest = orders.sort((a, b) => b.id_key - a.id_key).slice(0, 5);
        document.getElementById('dashboard-orders-list').innerHTML = latest.map(o => `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:0.5rem 0;">
                <span>Pedido #${o.id_key}</span>
                <span>$${o.total.toFixed(2)}</span>
                <span>${getStatusBadge(o.status)}</span>
            </div>
        `).join('');
    }

    if (products) {
        document.getElementById('stat-products').textContent = products.length;
    }

    if (clients) {
        document.getElementById('stat-clients').textContent = clients.length;
    }
}

// --- Products CRUD ---

async function loadProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    const products = await fetchData('/products?skip=0&limit=1000');
    if (products && products.length > 0) {
        products.sort((a, b) => b.id_key - a.id_key); // Newest first
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.id_key}</td>
                <td>${p.name}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="window.openProductModal(${p.id_key})" class="btn-secondary" style="font-size:0.8rem;">Editar</button>
                    <button onclick="window.deleteProduct(${p.id_key})" class="btn-secondary" style="font-size:0.8rem; color:red; border-color:red;">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5">No hay productos.</td></tr>';
    }
}

window.openProductModal = async (id = null) => {
    document.getElementById('admin-modal-overlay').classList.remove('hidden');
    document.getElementById('modal-product').classList.remove('hidden');
    document.getElementById('modal-category').classList.add('hidden');

    const formTitle = document.getElementById('modal-product-title');
    const inputId = document.getElementById('prod-id');
    const inputName = document.getElementById('prod-name');
    const inputPrice = document.getElementById('prod-price');
    const inputStock = document.getElementById('prod-stock');
    const inputCat = document.getElementById('prod-cat');

    if (id) {
        // Edit Mode - Fetch details (using list for now)
        formTitle.textContent = "Editar Producto";
        const products = await fetchData('/products?skip=0&limit=1000');
        const product = products.find(p => p.id_key === id);

        if (product) {
            inputId.value = product.id_key;
            inputName.value = product.name;
            inputPrice.value = product.price;
            inputStock.value = product.stock;
            inputCat.value = product.category_id;
        }
    } else {
        // Create Mode
        formTitle.textContent = "Nuevo Producto";
        inputId.value = '';
        inputName.value = '';
        inputPrice.value = '';
        inputStock.value = '';
        inputCat.value = '';
    }
};

window.saveProduct = async () => {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const category_id = parseInt(document.getElementById('prod-cat').value);

    const payload = { name, price, stock, category_id };

    try {
        if (id) {
            // Update
            await updateProduct(id, payload);
            alert("Producto actualizado");
        } else {
            // Create
            await createProduct(payload);
            alert("Producto creado");
        }
        window.closeAdminModals();
        loadProductsTable();
    } catch (e) {
        console.error(e);
        alert("Error al guardar producto");
    }
};

window.deleteProduct = async (id) => {
    if (!confirm(`¿Eliminar producto ${id}?`)) return;
    try {
        await deleteProduct(id);
        alert("Producto eliminado");
        loadProductsTable();
    } catch (e) {
        console.error(e);
        alert("Error al eliminar (Ver consolse)");
    }
};

// --- Categories CRUD ---

async function loadCategoriesTable() {
    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

    const categories = await getCategories();
    if (categories && categories.length > 0) {
        categories.sort((a, b) => b.id_key - a.id_key);
        tbody.innerHTML = categories.map(c => `
            <tr>
                <td>${c.id_key}</td>
                <td>${c.name}</td>
                <td>
                    <button onclick="window.deleteCategory(${c.id_key})" class="btn-secondary" style="font-size:0.8rem; color:red; border-color:red;">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="3">No hay categorías.</td></tr>';
    }
}

window.openCategoryModal = () => {
    document.getElementById('admin-modal-overlay').classList.remove('hidden');
    document.getElementById('modal-category').classList.remove('hidden');
    document.getElementById('modal-product').classList.add('hidden');

    document.getElementById('cat-id').value = ''; // No edit for now, simple create
    document.getElementById('cat-name').value = '';
};

window.saveCategory = async () => {
    const name = document.getElementById('cat-name').value;
    // Simple Create Logic
    try {
        await createCategory({ name });
        alert("Categoría creada");
        window.closeAdminModals();
        loadCategoriesTable();
    } catch (e) {
        console.error(e);
        alert("Error al crear categoría");
    }
};

window.deleteCategory = async (id) => {
    if (!confirm(`¿Eliminar categoría ${id}?`)) return;
    try {
        await deleteCategory(id);
        alert("Categoría eliminada");
        loadCategoriesTable();
    } catch (e) {
        console.error(e);
        alert("Error al eliminar categoría");
    }
};


// --- Common ---

window.closeAdminModals = () => {
    document.getElementById('admin-modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal-card').forEach(el => el.classList.add('hidden'));
};


// --- Orders View ---

async function loadOrdersTable() {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    const orders = await fetchData('/orders?skip=0&limit=1000');
    if (orders && orders.length > 0) {
        orders.sort((a, b) => b.id_key - a.id_key);
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>${o.id_key}</td>
                <td>Cliente #${o.client_id}</td>
                <td>$${o.total.toFixed(2)}</td>
                <td>${getStatusBadge(o.status)}</td>
                <td>
                    <button class="btn-secondary" style="font-size:0.8rem;">Ver Detalles</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5">No hay pedidos.</td></tr>';
    }
}

// Helpers
function getStatusBadge(status) {
    switch (status) {
        case 1: return '<span style="color:orange;">Pendiente</span>';
        case 2: return '<span style="color:blue;">En Proceso</span>';
        case 3: return '<span style="color:green;">Entregado</span>';
        case 4: return '<span style="color:red;">Cancelado</span>';
        default: return '<span>Desconocido</span>';
    }
}

window.runHealthCheck = async () => {
    document.getElementById('health-result').textContent = "Diagnosticando...";
    try {
        const result = await fetchData('/health_check');
        document.getElementById('health-result').textContent = JSON.stringify(result, null, 2);
    } catch (e) {
        document.getElementById('health-result').textContent = "Error de conexión con el servidor.";
    }
};
