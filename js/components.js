// Genera el HTML de una tarjeta de producto
export function createProductCard(product) {
    // Imagen aleatoria basada en ID
    const image = `https://picsum.photos/seed/${product.id_key}/300/200`;
    
    return `
        <div class="card">
            <img src="${image}" alt="${product.name}" class="card-img">
            <div class="card-body">
                <h3>${product.name}</h3>
                <p class="category">ID: ${product.id_key}</p>
                <div class="price-row">
                    <span class="price">$${product.price}</span>
                    <span class="stock">Stock: ${product.stock}</span>
                </div>
                <button onclick="addToCart(${product.id_key})" class="btn-primary" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? 'Agregar' : 'Agotado'}
                </button>
            </div>
        </div>
    `;
}

// Inyecta el Navbar en cualquier página
export function loadNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return; // Salir si el contenedor no existe

    navContainer.innerHTML = `
        <nav class="nav-content" style="align-items: center;">
            <a href="index.html" class="logo">TechStore 🚀</a>
            
            <div style="display: flex; align-items: center;">
                <div class="links">
                    <a href="index.html">Inicio</a>
                    <a href="products.html">Productos</a>
                </div>

                <div class="actions" style="margin-left: 2rem;">
                    <button onclick="openLogin()" class="btn-primary" style="background: none; color: var(--dark); border: 1px solid #ccc; margin-right: 10px;">Login</button>
                    <button onclick="openCart()" class="btn-primary">
                        🛒 Carrito <span id="cart-count-badge">(0)</span>
                    </button>
                </div>
            </div>
        </nav>
    `;
}

// Devuelve el HTML de todos los modales para ser inyectado
export function renderModals() {
    return `
        <div id="modal-overlay" class="modal-overlay hidden" onclick="closeAllModals()"></div>

        <!-- Modal de Login -->
        <div id="modal-login" class="modal-content hidden">
            <button class="close-btn" onclick="closeAllModals()">&times;</button>
            <h2 style="margin-top:0;">Iniciar Sesión</h2>
            <input type="email" placeholder="Email" class="form-input">
            <button onclick="alert('Login simulado')" class="btn-primary" style="width: 100%;">Entrar</button>
        </div>

        <!-- Sidebar de Carrito -->
        <div id="cart-sidebar" class="cart-sidebar hidden">
            <div class="cart-header">
                <h2>Tu Carrito</h2>
                <button class="close-btn" onclick="closeAllModals()">&times;</button>
            </div>
            <div id="cart-items" class="cart-items">
                <p>El carrito está vacío</p>
            </div>
            <div class="cart-footer">
                <button onclick="openCheckout()" class="btn-primary" style="width: 100%;">Ir a Pagar</button>
            </div>
        </div>

        <!-- Modal de Checkout -->
        <div id="modal-checkout" class="modal-content hidden">
            <button class="close-btn" onclick="closeAllModals()">&times;</button>
            <h2 style="color:green;">Checkout</h2>
            <p>Total a pagar: <span id="checkout-total">$0</span></p>
            <p>¿Confirmar compra?</p>
            <button onclick="alert('¡Compra realizada!')" class="btn-primary" style="width:100%;">Confirmar</button>
        </div>
    `;
}

// Inyecta el Footer en cualquier página
export function loadFooter() {
    const footerContainer = document.getElementById('footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <div style="background-color: #1f2937; color: #f3f4f6; padding: 2rem 1rem; margin-top: auto; text-align: center;">
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem; max-width: 1200px; margin: 0 auto; text-align: left; padding-bottom: 1rem;">
                
                <!-- Columna 1: Sobre Nosotros -->
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: white; border-bottom: 1px solid #2563eb; padding-bottom: 0.5rem;">Sobre Nosotros</h3>
                    <p style="color: #d1d5db;">TechStore es tu mejor opción para encontrar componentes y periféricos de última generación. Calidad y servicio garantizados.</p>
                </div>

                <!-- Columna 2: Enlaces Rápidos -->
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: white; border-bottom: 1px solid #2563eb; padding-bottom: 0.5rem;">Enlaces Rápidos</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><a href="index.html" style="color: #d1d5db; text-decoration: none; line-height: 1.8;">Inicio</a></li>
                        <li><a href="products.html" style="color: #d1d5db; text-decoration: none; line-height: 1.8;">Productos</a></li>
                        <li><a href="#" onclick="openLogin()" style="color: #d1d5db; text-decoration: none; line-height: 1.8;">Login</a></li>
                    </ul>
                </div>

                <!-- Columna 3: Contacto -->
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: white; border-bottom: 1px solid #2563eb; padding-bottom: 0.5rem;">Contacto</h3>
                    <p style="color: #d1d5db;">Email: info@techstore.com</p>
                    <p style="color: #d1d5db;">Redes: 🐦 📸 💼</p>
                </div>

            </div>
            <div style="border-top: 1px solid #374151; margin-top: 1rem; padding-top: 1.5rem; color: #9ca3af;">
                <p>&copy; 2025 TechStore. Todos los derechos reservados.</p>
            </div>
        </div>
    `;
}