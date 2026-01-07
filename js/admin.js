
import {
    fetchData,
    createProduct, updateProduct, deleteProduct,
    getCategories, createCategory, deleteCategory,
    createClient, updateClient, deleteClient,
    getOrders, updateOrder, deleteOrder,
    checkHealth
} from './api.js';

// --- Auth Check ---
(function checkAdminSession() {
    const isAdmin = localStorage.getItem('admin_session');
    if (!isAdmin) {
        window.location.href = 'index.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModalsOverlay();

    // Load Dashboard Data by default
    loadDashboardStats();
});

// --- Navigation ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section-content');
    const headerTitle = document.getElementById('headerTitle');

    const sectionTitles = {
        dashboard: 'Dashboard',
        products: 'Gestión de Productos',
        categories: 'Gestión de Categorías',
        orders: 'Seguimiento de Pedidos',
        customers: 'Clientes Registrados',
        diagnostic: 'Diagnóstico del Sistema'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            if (!sectionId) return;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            const target = document.getElementById(sectionId);
            if (target) target.classList.add('active');

            // Update header title
            if (headerTitle) headerTitle.textContent = sectionTitles[sectionId] || 'Panel';

            // Load Data for Section
            if (sectionId === 'dashboard') loadDashboardStats();
            if (sectionId === 'products') loadProductsTable();
            if (sectionId === 'categories') loadCategoriesTable();
            if (sectionId === 'orders') loadOrdersTable();
            if (sectionId === 'customers') loadCustomersTable();
        });
    });
}

// --- Dashboard ---

async function loadDashboardStats() {
    // Set loading state
    setStatLoading('orders', 'sales', 'clients', 'products');

    try {
        const [orders, products, clients] = await Promise.all([
            fetchData('/orders/?skip=0&limit=1000'),
            fetchData('/products/?skip=0&limit=1000'),
            fetchData('/clients/?skip=0&limit=1000')
        ]);

        // 1. Update Cards
        if (orders) {
            document.getElementById('stat-orders-total').textContent = orders.length;
            document.getElementById('stat-orders-trend').textContent = 'Actualizado ahora';

            const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
            document.getElementById('stat-sales-total').textContent = `$${totalSales.toFixed(2)}`;
            document.getElementById('stat-sales-trend').textContent = 'Actualizado ahora';

            // Render Recent Orders (Top 5)
            renderRecentOrders(orders.sort((a, b) => b.id_key - a.id_key).slice(0, 5));
        }

        if (clients) {
            document.getElementById('stat-clients-total').textContent = clients.length;
            document.getElementById('stat-clients-trend').textContent = 'Actualizado ahora';
        }

        if (products) {
            document.getElementById('stat-products-total').textContent = products.length;
            document.getElementById('stat-products-trend').textContent = 'Actualizado ahora';
        }

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    }
}

function setStatLoading(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(`stat-${id}-total`);
        if (el) el.textContent = '...';
    });
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('dashboard-orders-body');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay pedidos recientes.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#ORD-${o.id_key}</td>
            <td>Cliente #${o.client_id}</td>
            <td>${o.date ? new Date(o.date).toLocaleDateString() : 'N/A'}</td>
            <td>$${o.total.toFixed(2)}</td>
            <td>${getStatusBadge(o.status)}</td>
        </tr>
    `).join('');
}

// --- Products CRUD ---

async function loadProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando productos...</td></tr>';

    try {
        const products = await fetchData('/products/?skip=0&limit=1000');

        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay productos registrados.</td></tr>';
            return;
        }

        // Sort by ID DESC
        products.sort((a, b) => b.id_key - a.id_key);

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>#PRD-${p.id_key}</td>
                <td>${p.name}</td>
                <td>Cat ID: ${p.category_id}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="window.prepareEditProduct(${p.id_key})">Editar</button>
                        <button class="btn-icon danger" onclick="window.deleteProductItem(${p.id_key})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" style="color:red;">Error cargando productos.</td></tr>';
    }
}

// --- Product Modals & Actions ---

window.openProductModal = () => {
    document.getElementById('productModalTitle').textContent = 'Nuevo Producto';
    document.getElementById('productForm').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('productModal').classList.add('active');
};

window.closeProductModal = () => {
    document.getElementById('productModal').classList.remove('active');
};

window.prepareEditProduct = async (id) => {
    try {
        const product = await fetchData(`/products/${id}`);
        if (product) {
            document.getElementById('productModalTitle').textContent = 'Editar Producto';
            document.getElementById('prod-id').value = product.id_key;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category_id;

            document.getElementById('productModal').classList.add('active');
        }
    } catch (e) { console.error(e); }
};

window.saveProduct = async () => {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category_id = parseInt(document.getElementById('productCategory').value);

    const payload = { name, price, stock, category_id };

    try {
        if (id) {
            await updateProduct(id, payload);
            alert("Producto actualizado correctamente");
        } else {
            await createProduct(payload);
            alert("Producto creado correctamente");
        }
        window.closeProductModal();
        loadProductsTable();
    } catch (e) {
        alert("Error al guardar producto");
        console.error(e);
    }
};

window.deleteProductItem = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
        await deleteProduct(id);
        loadProductsTable();
    } catch (e) {
        alert("Error al eliminar producto");
    }
};


// --- Categories CRUD ---

async function loadCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando...</td></tr>';

    try {
        const categories = await getCategories(); // assuming returns list
        if (!categories || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay categorías.</td></tr>';
            return;
        }

        tbody.innerHTML = categories.map(c => `
            <tr>
                <td>#CAT-${c.id_key}</td>
                <td>${c.name}</td>
                <td>Unknown</td> <!-- Backend doesnt give count yet -->
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon danger" onclick="window.deleteCategoryItem(${c.id_key})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Error.</td></tr>';
    }
}

window.openCategoryModal = () => {
    document.getElementById('categoryModal').classList.add('active');
};
window.closeCategoryModal = () => {
    document.getElementById('categoryModal').classList.remove('active');
};
window.saveCategory = async () => {
    const name = document.getElementById('categoryName').value;
    try {
        await createCategory({ name });
        alert("Categoría creada");
        window.closeCategoryModal();
        loadCategoriesTable();
    } catch (e) { alert("Error al crear categoría"); }
};
window.deleteCategoryItem = async (id) => {
    if (!confirm("¿Eliminar categoría?")) return;
    try {
        await deleteCategory(id);
        loadCategoriesTable();
    } catch (e) { alert("Error al eliminar"); }
};


// --- Orders Management ---

async function loadOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando pedidos...</td></tr>';

    try {
        const orders = await getOrders(0, 1000);
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay pedidos.</td></tr>';
            return;
        }

        orders.sort((a, b) => b.id_key - a.id_key);

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#ORD-${o.id_key}</td>
                <td>Client #${o.client_id}</td>
                <td>${o.date ? new Date(o.date).toLocaleDateString() : '-'}</td>
                <td>-</td> <!-- Needs Details Fetch -->
                <td>$${o.total.toFixed(2)}</td>
                <td>${getStatusBadge(o.status)}</td>
                <td>
                    <div class="action-buttons">
                        <!-- Simple Update Status Mock -->
                        <select onchange="window.updateOrderStatus(${o.id_key}, this.value)" style="padding:4px; border:1px solid #ccc; border-radius:4px;">
                            <option value="1" ${o.status == 1 ? 'selected' : ''}>Pendiente</option>
                            <option value="2" ${o.status == 2 ? 'selected' : ''}>En Proceso</option>
                            <option value="3" ${o.status == 3 ? 'selected' : ''}>Entregado</option>
                            <option value="4" ${o.status == 4 ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" style="color:red;">Error cargando pedidos.</td></tr>';
    }
}

window.updateOrderStatus = async (id, newStatus) => {
    try {
        await updateOrder(id, { status: parseInt(newStatus) });
        // Optional: show toast
    } catch (e) {
        alert("Error al actualizar estado");
    }
};


// --- Customers Management ---
async function loadCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando clientes...</td></tr>';

    try {
        // Fetch clients AND orders to calc total spent
        const [clients, orders] = await Promise.all([
            fetchData('/clients/?skip=0&limit=1000'),
            fetchData('/orders/?skip=0&limit=1000')
        ]);

        if (!clients || clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay clientes.</td></tr>';
            return;
        }

        // Map spending
        const spendingMap = {};
        const orderCountMap = {};

        if (orders) {
            orders.forEach(o => {
                const cid = o.client_id;
                spendingMap[cid] = (spendingMap[cid] || 0) + (o.total || 0);
                orderCountMap[cid] = (orderCountMap[cid] || 0) + 1;
            });
        }

        tbody.innerHTML = clients.map(c => `
            <tr>
                <td>#CUS-${c.id_key}</td>
                <td>${c.email}</td>
                <td>${c.name} ${c.lastname}</td>
                <td>${c.telephone || '-'}</td>
                <td>${orderCountMap[c.id_key] || 0} pedidos</td>
                <td>$${(spendingMap[c.id_key] || 0).toFixed(2)}</td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" style="color:red;">Error cargando clientes.</td></tr>';
    }
}


// --- System Utilities ---

function getStatusBadge(status) {
    switch (status) {
        case 1: return '<span class="badge badge-warning">Pendiente</span>';
        case 2: return '<span class="badge badge-info">En Proceso</span>';
        case 3: return '<span class="badge badge-success">Entregado</span>';
        case 4: return '<span class="badge badge-danger">Cancelado</span>';
        default: return '<span class="badge">Desconocido</span>';
    }
}

window.runHealthCheck = async () => {
    const consoleDiv = document.getElementById('diagnosticConsole');
    consoleDiv.textContent = 'Iniciando diagnóstico del sistema...\n';

    try {
        consoleDiv.textContent += '[INFO] Contactando API Backend...\n';
        const result = await checkHealth();

        if (result && result.status === 'ok') {
            consoleDiv.textContent += '[OK] API Status: ONLINE\n';
            consoleDiv.textContent += `[OK] Server Time: ${new Date().toISOString()}\n`;
            consoleDiv.textContent += `[INFO] DB Check: ${result.database !== undefined ? 'OK' : 'Unknown'}\n`;
            consoleDiv.textContent += '\n✓ DIAGNÓSTICO COMPLETADO EXITOSAMENTE\n';
        } else {
            consoleDiv.textContent += '[ERROR] Respuesta inválida del servidor.\n';
        }
    } catch (e) {
        consoleDiv.textContent += `[CRITICAL] Error de conexión: ${e.message}\n`;
    }
};

window.handleLogout = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.removeItem('admin_session');
        window.location.href = 'index.html';
    }
};

// Utils for modal closing
function initModalsOverlay() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}
