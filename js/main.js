import { getNavbarHTML, getFooterHTML, getModalsHTML, getProductCardHTML } from './components.js';
import { fetchData, findClientByEmail, createClient, createOrder } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Renderizado de la UI Estática ---
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer');
    const modalsContainer = document.getElementById('modals-container');

    if (navbarContainer) navbarContainer.innerHTML = getNavbarHTML();
    if (footerContainer) footerContainer.innerHTML = getFooterHTML();
    if (modalsContainer) modalsContainer.innerHTML = getModalsHTML();

    // --- 2. Estado de la Aplicación ---
    // Cargar carrito desde localStorage o vacío
    let cart = JSON.parse(localStorage.getItem('cart_v1')) || [];
    let currentUser = null; // { id_key, name, email, ... }
    let cartCloseTimer = null;

    // --- 3. Selectores del DOM ---
    const authModal = document.getElementById('modal-auth');
    const checkoutModal = document.getElementById('modal-checkout');

    const cartOverlay = document.getElementById('modal-cart-overlay');
    const cartSidebar = document.getElementById('modal-cart');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutTotalSpan = document.getElementById('checkout-total');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // Auth Form Elements
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    const productListContainer = document.getElementById('product-list') || document.getElementById('product-list-container');

    // --- 4. Gestión de Modales ---
    const closeAllModals = () => {
        if (authModal) authModal.classList.add('hidden');
        if (checkoutModal) checkoutModal.classList.add('hidden');
        if (cartOverlay) cartOverlay.classList.add('hidden');

        if (cartSidebar) {
            cartSidebar.classList.remove('visible');

            if (cartCloseTimer) clearTimeout(cartCloseTimer);
            cartCloseTimer = setTimeout(() => {
                cartSidebar.classList.add('hidden');
                cartCloseTimer = null;
            }, 300);
        }

        // Reset checkout status
        const statusDiv = document.getElementById('checkout-status');
        const actionsDiv = document.getElementById('checkout-actions');
        if (statusDiv) statusDiv.classList.add('hidden');
        if (actionsDiv) actionsDiv.classList.remove('hidden');
    };

    // --- 5. Lógica de Autenticación ---

    window.openAuthModal = (tab = 'login') => {
        closeAllModals();
        if (authModal) {
            authModal.classList.remove('hidden');
            window.switchAuthTab(tab);
        }
    };

    window.switchAuthTab = (tab) => {
        if (!formLogin || !formRegister) return;

        // Reset Inputs & Errors
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

        if (tab === 'login') {
            formLogin.classList.remove('hidden');
            formRegister.classList.add('hidden');

            // Styles
            tabLogin.style.borderBottom = '2px solid var(--primary)';
            tabLogin.style.color = 'var(--primary)';
            tabRegister.style.borderBottom = '2px solid transparent';
            tabRegister.style.color = 'var(--text-muted)';
        } else {
            formLogin.classList.add('hidden');
            formRegister.classList.remove('hidden');

            // Styles
            tabRegister.style.borderBottom = '2px solid var(--primary)';
            tabRegister.style.color = 'var(--primary)';
            tabLogin.style.borderBottom = '2px solid transparent';
            tabLogin.style.color = 'var(--text-muted)';
        }
    };

    window.performLogin = async () => {
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value.trim(); // Simulada
        const msg = document.getElementById('msg-login');

        if (!email) {
            msg.textContent = "Ingresa tu email.";
            return;
        }

        msg.textContent = "Verificando...";
        try {
            const client = await findClientByEmail(email);
            if (client) {
                // Éxito
                setCurrentUser(client);
                closeAllModals();
            } else {
                msg.textContent = "Usuario no encontrado. Intenta registrarte.";
            }
        } catch (err) {
            console.error(err);
            msg.textContent = "Error de conexión.";
        }
    };

    window.performRegister = async () => {
        const name = document.getElementById('reg-name').value.trim();
        const lastname = document.getElementById('reg-lastname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const msg = document.getElementById('msg-register');

        if (!name || !lastname || !email || !phone) {
            msg.textContent = "Completa todos los campos obligatorios.";
            return;
        }

        msg.textContent = "Registrando...";
        try {
            const result = await createClient({ name, lastname, email, telephone: phone });

            if (result && result.id_key) {
                const newUser = { id_key: result.id_key, name, lastname, email, telephone: phone };
                setCurrentUser(newUser);
                closeAllModals();
            } else {
                msg.textContent = "No se pudo registrar. Intenta nuevamente.";
            }
        } catch (err) {
            console.error(err);
            msg.textContent = "Error al registrar.";
        }
    };

    function setCurrentUser(user) {
        currentUser = user;
        updateNavbarUI();

        // Si hay items en el carrito y acabamos de loguearnos, podríamos preguntar si quiere checkout
        if (cart.length > 0) {
            // Opcional: openCart() o mensaje
        }
    }

    function updateNavbarUI() {
        const container = document.getElementById('user-actions');
        if (!container) return;

        if (currentUser) {
            container.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <span style="margin-right:10px; font-weight:600;">Hola, ${currentUser.name}</span>
                    <button onclick="window.logout()" class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size:0.8rem;">Salir</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button onclick="window.openAuthModal('login')" class="btn-secondary" style="margin-right: 10px;">Iniciar Sesión</button>
            `;
        }
    }

    window.logout = () => {
        currentUser = null;
        updateNavbarUI();
        window.location.reload(); // Limpiar estado mas drástico si se prefiere
    };

    // --- 6. Carrito & Checkout ---

    // Función auxiliar para guardar persistencia
    const saveCart = () => {
        localStorage.setItem('cart_v1', JSON.stringify(cart));
        updateCartBadgeUI();
        // Si el carrito está abierto, renderizamos
        if (cartSidebar && cartSidebar.classList.contains('visible')) {
            renderCartUI();
        }
    };

    window.openCart = () => {
        closeAllModals();

        if (cartCloseTimer) {
            clearTimeout(cartCloseTimer);
            cartCloseTimer = null;
        }

        if (cartOverlay) cartOverlay.classList.remove('hidden');
        if (cartSidebar) {
            cartSidebar.classList.remove('hidden');
            setTimeout(() => cartSidebar.classList.add('visible'), 10);
        }
        renderCartUI();
    };

    // Función para mostrar Toast Notification
    window.showToast = (message) => {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>✅</span> ${message}`;

        toastContainer.appendChild(toast);

        // El CSS maneja la animación de entrada (slideInLeft) y fading (fadeOut)
        // Solo necesitamos remover el elemento del DOM después de que termine la animación
        setTimeout(() => {
            toast.remove();
        }, 3500); // 3s delay + 0.3s fadeOut + buffer
    };

    window.addToCart = (productId) => {
        const productCard = document.querySelector(`button[onclick="window.addToCart(${productId})"]`).closest('.card');
        if (!productCard) return;

        const name = productCard.querySelector('h3').textContent;
        const price = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name, price, quantity: 1 });
        }

        saveCart(); // Persistir
        window.showToast(`Agregaste <strong>${name}</strong> al carrito`);
    };

    // Actualizar badges al inicio
    updateCartBadgeUI();

    function renderCartUI() {
        if (!cartItemsContainer) return;

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (cartTotalAmount) cartTotalAmount.textContent = `$${total.toFixed(2)}`;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>El carrito está vacío</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>x${item.quantity}</small>
                    </div>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        }
    }

    function updateCartBadgeUI() {
        if (!cartCountBadge) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountBadge.textContent = `(${totalItems})`;
    }

    window.initiateCheckout = () => {
        if (cart.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        if (!currentUser) {
            // Forzar Login
            window.openAuthModal('login');
            // Podríamos guardar flags para "auto-open checkout after login"
        } else {
            closeAllModals();
            openCheckoutConfirmation();
        }
    };

    function openCheckoutConfirmation() {
        if (!currentUser || !checkoutModal) return;

        document.getElementById('checkout-client-name').textContent = `${currentUser.name} ${currentUser.lastname}`;
        document.getElementById('checkout-client-email').textContent = currentUser.email;

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (checkoutTotalSpan) checkoutTotalSpan.textContent = `$${total.toFixed(2)}`;

        checkoutModal.classList.remove('hidden');
    }

    window.confirmOrder = async () => {
        const statusDiv = document.getElementById('checkout-status');
        const actionsDiv = document.getElementById('checkout-actions');

        actionsDiv.classList.add('hidden');
        statusDiv.classList.remove('hidden');
        statusDiv.innerHTML = '<p style="color:var(--primary);">Procesando orden...</p>';

        try {
            const orderPayload = {
                client_id: currentUser.id_key,
                items: cart.map(i => ({ product_id: i.id, quantity: i.quantity }))
            };

            const resp = await createOrder(orderPayload);

            if (resp && resp.id_key) {
                statusDiv.innerHTML = `
                    <h3 style="color:green;">¡Gracias por tu compra!</h3>
                    <p>ID de Orden: <strong>${resp.id_key}</strong></p>
                    <button onclick="window.closeAllModals()" class="btn-secondary" style="margin-top:1rem;">Cerrar</button>
                `;
                cart = [];
                saveCart(); // Limpiar localStorage también
                renderCartUI();
            } else {
                throw new Error("Respuesta backend inválida");
            }

        } catch (err) {
            console.error(err);
            statusDiv.innerHTML = `
                <p style="color:red;">Error al crear la orden.</p>
                <button onclick="window.closeAllModals()" class="btn-secondary">Cerrar</button>
            `;
        }
    };

    // --- 7. Inicialización Global ---
    window.closeAllModals = closeAllModals;

    // --- 8. Carga de Productos ---
    if (productListContainer) {
        fetchData('/products?skip=0&limit=100')
            .then(products => {
                if (products && products.length > 0) {
                    productListContainer.innerHTML = products.map(getProductCardHTML).join('');
                } else {
                    productListContainer.innerHTML = '<p>No se encontraron productos.</p>';
                }
            })
            .catch(error => {
                console.error("Error cargando productos:", error);
                productListContainer.innerHTML = '<p>Error al cargar catálogo.</p>';
            });
    }
});
