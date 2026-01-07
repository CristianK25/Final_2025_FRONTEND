/**
 * Devuelve el HTML de una tarjeta de producto.
 * @param {object} product - El objeto del producto.
 * @returns {string} - El string HTML de la tarjeta.
 */
export function getProductCardHTML(product) {
    const image = `https://picsum.photos/seed/${product.id_key}/300/200`;

    return `
        <div class="card">
            <img src="${image}" alt="${product.name}" class="card-img" onclick="window.openProductDetail(${product.id_key})" style="cursor:pointer;">
            <div class="card-body">
                <h3 onclick="window.openProductDetail(${product.id_key})" style="cursor:pointer;">${product.name}</h3>
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
    const path = window.location.pathname;
    const isProducts = path.includes('products.html');
    const isHome = !isProducts; // Default to home if not products (simplification for this use case)

    return `
        <nav class="nav-content">
            <div class="nav-left">
                <a href="index.html" class="logo">
                     <div class="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon-logo" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                     </div>
                     TechStore
                </a>
                <div class="nav-links">
                    <a href="index.html" class="nav-link-item ${isHome ? 'active' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        Inicio
                    </a>
                    <a href="products.html" class="nav-link-item ${isProducts ? 'active' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        Productos
                    </a>
                </div>
            </div>

            <div class="nav-right">
                <button onclick="window.openCart()" class="icon-btn" title="Carrito">
                    <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <span id="cart-count-badge" class="badge hidden">0</span>
                </button>
                <div id="user-actions">
                     <button onclick="window.openAuthModal('login')" class="icon-btn" title="Usuario">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                        <label>Nombre</label>
                        <input type="text" id="login-name" class="form-input" placeholder="Tu Nombre">
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

        <!-- Modal de Confirmación de Checkout (Wizard) -->
        <div id="modal-checkout" class="modal-overlay hidden">
            <div class="modal-card checkout-modal-card">
                <div class="checkout-header">
                    <div class="header-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px; color:#4ade80; margin-right:10px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                        <h2 style="color: var(--text-main); margin:0; font-size:1.2rem;">Checkout Seguro</h2>
                    </div>
                    <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
                </div>

                <!-- Wizard Progress -->
                <div class="checkout-steps">
                    <div class="step active" id="step-indicator-1">
                        <div class="step-circle">
                            <span class="step-text">1</span>
                            <span class="step-check hidden">✓</span>
                        </div>
                        <span>Envío</span>
                    </div>
                    <!-- Line 1-2 -->
                    <div class="step-line" id="line-1"></div>
                    
                    <div class="step" id="step-indicator-2">
                        <div class="step-circle">
                            <span class="step-text">2</span>
                            <span class="step-check hidden">✓</span>
                        </div>
                        <span>Pago</span>
                    </div>
                    <!-- Line 2-3 -->
                    <div class="step-line" id="line-2"></div>

                    <div class="step" id="step-indicator-3">
                         <div class="step-circle">
                            <span class="step-text">3</span>
                            <span class="step-check hidden">✓</span>
                        </div>
                        <span>Confirmación</span>
                    </div>
                </div>

                <div class="checkout-body">
                    <!-- Step 1: Shipping -->
                    <div id="checkout-step-1" class="checkout-step-content">
                        <h3>Información de Envío</h3>
                        <p class="text-sm text-muted">Ingresa los detalles de entrega para tu pedido</p>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="chk-name" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Apellido *</label>
                                <input type="text" id="chk-lastname" class="form-input">
                            </div>
                        </div>
                         <div class="form-row">
                            <div class="form-group">
                                <label>Teléfono *</label>
                                <input type="tel" id="chk-phone" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="chk-email" class="form-input" disabled style="opacity:0.7;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Dirección *</label>
                            <input type="text" id="chk-address" class="form-input" placeholder="Calle, Altura, Piso...">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ciudad *</label>
                                <input type="text" id="chk-city" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Código Postal *</label>
                                <input type="text" id="chk-zip" class="form-input">
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Payment -->
                    <div id="checkout-step-2" class="checkout-step-content hidden">
                        <h3>Método de Pago</h3>
                         <p class="text-sm text-muted">Todos los pagos son seguros y encriptados</p>
                        
                        <div class="form-group">
                            <label>Número de Tarjeta *</label>
                            <div style="position:relative;">
                                 <input type="text" id="chk-card-number" class="form-input" placeholder="0000 0000 0000 0000">
                                 <span style="position:absolute; right:10px; top:10px;">💳</span>
                            </div>
                        </div>
                        <div class="form-group">
                             <label>Nombre en la Tarjeta *</label>
                            <input type="text" id="chk-card-name" class="form-input" placeholder="COMO FIGURA EN LA TARJETA" style="text-transform: uppercase;">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Vencimiento *</label>
                                <input type="text" id="chk-card-expiry" class="form-input" placeholder="MM/AA">
                            </div>
                            <div class="form-group">
                                <label>CVV *</label>
                                <input type="text" id="chk-card-cvv" class="form-input" placeholder="123">
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Confirmation -->
                    <div id="checkout-step-3" class="checkout-step-content hidden">
                        <h3>Revisar Pedido</h3>
                         <p class="text-sm text-muted">Verifica que toda la información sea correcta antes de confirmar</p>
                        
                        <div class="review-box">
                            <h4 style="display:flex; justify-content:space-between;">📍 Envío <a href="#" onclick="window.checkoutNextStep(1); return false;" style="font-size:0.8rem; color:var(--accent);">Editar</a></h4>
                            <p id="review-shipping" class="text-muted text-sm" style="line-height:1.6;">...</p>
                        </div>
                        <div class="review-box">
                             <h4 style="display:flex; justify-content:space-between;">💳 Pago <a href="#" onclick="window.checkoutNextStep(2); return false;" style="font-size:0.8rem; color:var(--accent);">Editar</a></h4>
                            <p id="review-payment" class="text-muted text-sm">...</p>
                        </div>
                        
                        <div class="review-box summary-total">
                            <div class="summary-row"><span>Subtotal (Productos)</span><span id="review-subtotal">$0.00</span></div>
                            <div class="summary-row"><span>Envío</span><span style="color:var(--primary);">GRATIS</span></div>
                            <div class="summary-row total" style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border); font-size:1.2rem;"><span>Total</span><span id="review-total">$0.00</span></div>
                        </div>
                    </div>
                </div>

                <!-- Footer with Navigation Buttons -->
                <div class="checkout-footer">
                    <!-- Footer for Step 1 -->
                    <div id="footer-step-1" class="footer-step-buttons" style="display:flex; justify-content:space-between; width:100%;">
                        <button onclick="window.closeAllModals()" class="btn-ghost">Cancelar</button>
                        <button onclick="window.checkoutNextStep(2)" class="btn-primary">Continuar &rarr;</button>
                    </div>
                    <!-- Footer for Step 2 -->
                    <div id="footer-step-2" class="footer-step-buttons hidden" style="display:flex; justify-content:space-between; width:100%;">
                         <button onclick="window.checkoutNextStep(1)" class="btn-ghost">&larr; Atrás</button>
                         <button onclick="window.checkoutNextStep(3)" class="btn-primary">Continuar &rarr;</button>
                    </div>
                    <!-- Footer for Step 3 -->
                    <div id="footer-step-3" class="footer-step-buttons hidden" style="display:flex; justify-content:space-between; width:100%;">
                         <button onclick="window.checkoutNextStep(2)" class="btn-ghost">&larr; Atrás</button>
                         <button onclick="window.confirmOrder()" class="btn-primary">Confirmar Pedido</button>
                    </div>
                </div>
                
                <div id="checkout-status" class="hidden status-msg"></div>
            </div>
        </div>
        
        <!-- Modal Perfil de Usuario -->
        <div id="modal-profile" class="modal-overlay hidden">
            <div class="modal-card">
                <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
                <h2 style="color: var(--primary);">Mi Perfil</h2>
                <p class="text-sm">Actualiza tus datos personales.</p>
                
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" id="profile-name" class="form-input">
                </div>
                <div class="form-group">
                    <label>Apellido</label>
                    <input type="text" id="profile-lastname" class="form-input">
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" id="profile-phone" class="form-input">
                </div>
                <!-- Email read-only -->
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="profile-email" class="form-input" disabled style="opacity: 0.7; cursor: not-allowed;">
                    <small style="color:var(--text-muted)">El email no se puede cambiar.</small>
                </div>

                <button onclick="window.saveProfile()" class="btn-primary" style="width:100%; margin-top:1rem;">Guardar Cambios</button>
                <div id="profile-status" class="error-msg" style="margin-top:10px;"></div>
            </div>
        </div>

        <!-- Modal Mis Pedidos -->
        <div id="modal-orders" class="modal-overlay hidden">
            <div class="modal-card" style="max-width: 600px; width: 90%;">
                <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
                <h2 style="color: var(--primary);">Mis Pedidos</h2>
                <div id="orders-list" class="orders-list">
                    <p class="text-muted">Cargando pedidos...</p>
                </div>
                <button onclick="window.closeAllModals()" class="btn-secondary" style="width:100%; margin-top:1rem;">Cerrar</button>
            </div>
        </div>

        <!-- Modal Detalle Producto -->
        <div id="modal-product-detail" class="modal-overlay hidden">
            <div class="modal-card" style="max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto;">
                <button class="close-btn" onclick="window.closeAllModals()">&times;</button>
                
                <div class="product-detail-layout" style="display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem;">
                    <div style="flex: 1; min-width: 300px;">
                        <img id="pd-image" src="" alt="Producto" style="width: 100%; border-radius: 8px; object-fit: cover;">
                    </div>
                    <div style="flex: 1; min-width: 300px;">
                        <h2 id="pd-name" style="color: var(--primary); margin-top:0;"></h2>
                        <p class="price" id="pd-price" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></p>
                        <p style="margin-bottom: 1rem;">Stock: <span id="pd-stock" style="font-weight: bold;"></span></p>
                        <p>Categoría: <span id="pd-category"></span></p>
                        
                        <div style="margin-top: 2rem;">
                            <button id="pd-add-btn" class="btn-primary" style="width: 100%;">Agregar al Carrito</button>
                        </div>
                    </div>
                </div>

                <div class="product-reviews-section" style="border-top: 1px solid var(--border); padding-top: 1.5rem;">
                    <h3 style="margin-bottom: 1rem;">Reseñas de Clientes</h3>
                    
                    <div id="pd-reviews-list" style="margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem;">
                        <p class="text-muted">Cargando reseñas...</p>
                    </div>

                    <div class="add-review-form" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
                        <h4 style="margin-top: 0;">Escribe una reseña</h4>
                        <div class="form-group">
                            <label>Calificación</label>
                            <select id="new-review-rating" class="form-input">
                               <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                               <option value="4">⭐⭐⭐⭐ (4/5)</option>
                               <option value="3">⭐⭐⭐ (3/5)</option>
                               <option value="2">⭐⭐ (2/5)</option>
                               <option value="1">⭐ (1/5)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Comentario</label>
                            <textarea id="new-review-comment" class="form-input" rows="3" placeholder="¿Qué te pareció el producto?"></textarea>
                        </div>
                        <button onclick="window.submitReview()" class="btn-primary">Publicar Reseña</button>
                        <div id="review-status" class="status-msg"></div>
                    </div>
                </div>
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