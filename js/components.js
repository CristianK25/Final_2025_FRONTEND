/**
 * Devuelve el HTML de una tarjeta de producto.
 * @param {object} product - El objeto del producto.
 * @returns {string} - El string HTML de la tarjeta.
 */
export function getProductCardHTML(product) {
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
                <button onclick="window.addToCart(${product.id_key})" class="btn-primary" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? 'Agregar' : 'Agotado'}
                </button>
            </div>
        </div>
    `;
}

/**
 * Devuelve el HTML del Navbar.
 * @returns {string}
 */
export function getNavbarHTML() {
    return `
        <nav class="nav-content">
            <a href="index.html" class="logo">TechStore <span>🚀</span></a>
            <div style="display: flex; align-items: center;">
                <div class="links">
                    <a href="index.html">Inicio</a>
                    <a href="products.html">Productos</a>
                </div>
                <!-- Action Buttons: Login / User / Cart -->
                <div class="actions" style="margin-left: 2rem; display:flex; align-items:center;">
                    
                    <!-- Contenedor dinámico para usuario -->
                    <div id="user-actions">
                        <button onclick="window.openAuthModal('login')" class="btn-secondary" style="margin-right: 10px;">Iniciar Sesión</button>
                    </div>
                    
                    <button onclick="window.openCart()" class="btn-primary">
                        🛒 <span id="cart-count-badge">(0)</span>
                    </button>
                </div>
            </div>
        </nav>
    `;
}

/**
 * Devuelve el HTML de todos los modales.
 * @returns {string}
 */
export function getModalsHTML() {
    return `
        <!-- Modal Auth (Login / Registro) -->
        <div id="modal-auth" class="modal-overlay hidden">
            <div class="modal-card">
                <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
                
                <!-- Toggle Tabs -->
                <div style="display:flex; justify-content:center; margin-bottom:1.5rem; border-bottom:1px solid var(--border);">
                    <button id="tab-login" onclick="window.switchAuthTab('login')" style="flex:1; background:none; border:none; padding:10px; cursor:pointer; font-weight:bold; color:var(--primary); border-bottom:2px solid var(--primary);">Login</button>
                    <button id="tab-register" onclick="window.switchAuthTab('register')" style="flex:1; background:none; border:none; padding:10px; cursor:pointer; color:var(--text-muted); border-bottom: 2px solid transparent;">Registro</button>
                </div>

                <!-- Formulario Login -->
                <div id="form-login">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="login-email" class="form-input" placeholder="tu@email.com">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="login-pass" class="form-input" placeholder="********">
                    </div>
                    <button onclick="window.performLogin()" class="btn-primary" style="width:100%;">Ingresar</button>
                    <p id="msg-login" class="error-msg"></p>
                </div>

                <!-- Formulario Registro -->
                <div id="form-register" class="hidden">
                    <div style="display:flex; gap:10px;">
                        <div class="form-group" style="flex:1;">
                            <label>Nombre</label>
                            <input type="text" id="reg-name" class="form-input">
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label>Apellido</label>
                            <input type="text" id="reg-lastname" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="reg-email" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" id="reg-phone" class="form-input" placeholder="Solo números">
                    </div>
                     <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="reg-pass" class="form-input" placeholder="Crea una contraseña">
                    </div>
                    <button onclick="window.performRegister()" class="btn-primary" style="width:100%;">Registrarse</button>
                    <p id="msg-register" class="error-msg"></p>
                </div>

            </div>
        </div>

        <!-- Overlay y Sidebar de Carrito -->
        <div id="modal-cart-overlay" class="modal-overlay hidden" onclick="window.closeAllModals()"></div>
        <aside id="modal-cart" class="cart-sidebar hidden">
            <div class="cart-header">
                <h2>Tu Carrito</h2>
                <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
            </div>
            <div id="cart-items" class="cart-items"><p>El carrito está vacío</p></div>
            <div class="cart-footer">
                <div class="total-row">
                    <span>Total:</span>
                    <span id="cart-total-amount">$0.00</span>
                </div>
                <!-- Checkout inicia el proceso, si no está logueado pedirá login -->
                <button onclick="window.initiateCheckout()" class="btn-primary" style="width: 100%;">Iniciar Compra</button>
            </div>
        </aside>

        <!-- Modal de Confirmación de Checkout -->
        <div id="modal-checkout" class="modal-overlay hidden">
            <div class="modal-card">
                <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
                <h2 style="color: var(--primary);">Confirmar Pedido</h2>
                
                <div class="checkout-summary">
                    <p><strong>Cliente:</strong> <span id="checkout-client-name">...</span></p>
                    <p><strong>Email:</strong> <span id="checkout-client-email">...</span></p>
                    <hr style="margin: 1rem 0; border: 0; border-top: 1px solid var(--border);">
                    <p>Total a pagar: <span id="checkout-total" class="price" style="font-size: 1.5rem;">$0</span></p>
                </div>

                <div id="checkout-actions">
                    <button onclick="window.confirmOrder()" class="btn-primary" style="width:100%;">Confirmar y Pagar</button>
                </div>
                <div id="checkout-status" class="hidden status-msg"></div>
            </div>
        </div>
        
        <!-- Toast Notification (Bottom Left) -->
        <div id="toast-container" class="toast-container"></div>
    `;
}

/**
 * Devuelve el HTML del Footer.
 * @returns {string}
 */
export function getFooterHTML() {
    return `
        <div class="site-footer">
            <div class="footer-content">
                <div class="footer-col">
                    <h3>Sobre Nosotros</h3>
                    <p>TechStore es tu mejor opción para componentes y periféricos.</p>
                </div>
                <div class="footer-col">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><a href="index.html">Inicio</a></li>
                        <li><a href="products.html">Productos</a></li>
                        <li><a href="#" onclick="window.openAuthModal('login')">Mi Cuenta</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Contacto</h3>
                    <p>Email: info@techstore.com</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 TechStore. Todos los derechos reservados.</p>
            </div>
        </div>
    `;
}