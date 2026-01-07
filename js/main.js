import { getNavbarHTML, getFooterHTML, getModalsHTML, getProductCardHTML } from './components.js';
import { fetchData, findClientByEmail, createClient, createOrder, updateClient, getOrdersByClient, cancelOrder, createReview, getProductReviews, getProducts, createBill, createOrderDetail, getCategories } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Renderizado de la UI Estática ---
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer');
    const modalsContainer = document.getElementById('modals-container');

    if (navbarContainer) navbarContainer.innerHTML = getNavbarHTML();
    if (footerContainer) footerContainer.innerHTML = getFooterHTML();
    if (modalsContainer) modalsContainer.innerHTML = getModalsHTML();

    // --- 2. Estado de la Aplicación ---
    // Cargar carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('cart_v1')) || [];
    // Cargar usuario desde localStorage
    let currentUser = JSON.parse(localStorage.getItem('user_v1')) || null;
    let currentProduct = null;
    let cartCloseTimer = null;

    // --- 3. Selectores del DOM ---
    const authModal = document.getElementById('modal-auth');
    const profileModal = document.getElementById('modal-profile');
    const ordersModal = document.getElementById('modal-orders');
    const productDetailModal = document.getElementById('modal-product-detail');
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

    // Selectors for Products
    const productListContainer = document.getElementById('product-list'); // For products.html
    const homePreviewContainer = document.getElementById('product-list-preview'); // For index.html featured


    // --- 4. Gestión de Modales ---
    const closeAllModals = () => {
        if (authModal) authModal.classList.add('hidden');
        if (profileModal) profileModal.classList.add('hidden');
        if (ordersModal) ordersModal.classList.add('hidden');
        if (productDetailModal) productDetailModal.classList.add('hidden');
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
    };

    // --- 5. Scroll Reveal Logic (New) ---
    const initScrollReveal = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, { threshold: 0.1 });

        // Targets: Info Section cards, About Section parts, Title
        document.querySelectorAll('.info-card, .about-text, .about-image, .section-title, .product-grid').forEach(el => {
            el.classList.add('scroll-hidden');
            observer.observe(el);
        });
    };


    // Reset checkout status
    const statusDiv = document.getElementById('checkout-status');
    const actionsDiv = document.getElementById('checkout-actions');
    if (statusDiv) statusDiv.classList.add('hidden');
    if (actionsDiv) actionsDiv.classList.remove('hidden');


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
        const name = document.getElementById('login-name').value.trim();
        const msg = document.getElementById('msg-login');

        if (!email) {
            msg.textContent = "Ingresa tu email.";
            return;
        }

        // --- Admin Check ---
        if (email === 'admin@admin.com' && name === 'admin') {
            msg.textContent = "Accediendo al Panel...";
            msg.style.color = "blue";
            // Guardar sesión admin simulada
            localStorage.setItem('admin_session', 'true');
            // Redirigir
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 800);
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
        localStorage.setItem('user_v1', JSON.stringify(user)); // Persistir
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
                <div style="display:flex; align-items:center; gap: 1rem;">
                    <a href="#" onclick="window.openProfileModal()" class="nav-link-item">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Hola, ${currentUser.name}
                    </a>
                    <a href="#" onclick="window.openOrdersModal()" class="nav-link-item">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Mis Pedidos
                    </a>
                    <button onclick="window.logout()" class="nav-link-item">
                        <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Salir
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button onclick="window.openAuthModal('login')" class="nav-link-item">
                    <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                    Iniciar Sesión
                </button>
            `;
        }
    }

    window.logout = () => {
        currentUser = null;
        localStorage.removeItem('user_v1');
        updateNavbarUI();
        window.location.reload();
    };

    // --- 5b. Lógica de Perfil ---

    window.openProfileModal = () => {
        if (!currentUser) return;
        closeAllModals();
        if (profileModal) {
            profileModal.classList.remove('hidden');
            // Cargar datos actuales
            document.getElementById('profile-name').value = currentUser.name;
            document.getElementById('profile-lastname').value = currentUser.lastname;
            document.getElementById('profile-phone').value = currentUser.telephone || '';
            document.getElementById('profile-email').value = currentUser.email;
            document.getElementById('profile-status').textContent = '';
        }
    };

    window.saveProfile = async () => {
        const name = document.getElementById('profile-name').value.trim();
        const lastname = document.getElementById('profile-lastname').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const msg = document.getElementById('profile-status');

        if (!name || !lastname) {
            msg.textContent = "Nombre y Apellido son obligatorios.";
            msg.style.color = "red";
            return;
        }

        msg.textContent = "Guardando...";
        msg.style.color = "var(--text-muted)";

        try {
            const updatedData = { name, lastname, telephone: phone };
            const result = await updateClient(currentUser.id_key, updatedData);

            if (result) {
                // Actualizar estado local
                const newUser = { ...currentUser, ...result };
                setCurrentUser(newUser); // Persiste y actualiza UI

                msg.textContent = "Datos actualizados correctamente.";
                msg.style.color = "green";

                setTimeout(() => {
                    closeAllModals();
                    msg.textContent = "";
                }, 1500);
            } else {
                throw new Error("Error al actualizar");
            }
        } catch (err) {
            console.error(err);
            msg.textContent = "No se pudieron guardar los cambios.";
            msg.style.color = "red";
        }
    };

    // --- 5c. Lógica de Carrito ---
    window.openCart = () => {
        closeAllModals(); // Close others
        if (cartSidebar && cartOverlay) {
            cartOverlay.classList.remove('hidden');
            cartSidebar.classList.remove('hidden');
            // Small delay to allow display:block to apply before transition
            requestAnimationFrame(() => {
                cartSidebar.classList.add('visible');
            });
            updateCartUI();
        }
    };

    // --- 5d. Lógica de Pedidos (Mis Pedidos) ---

    window.openOrdersModal = async () => {
        if (!currentUser) return;
        closeAllModals();
        if (ordersModal) {
            ordersModal.classList.remove('hidden');
            const listContainer = document.getElementById('orders-list');
            listContainer.innerHTML = '<p class="text-muted">Cargando pedidos...</p>';

            try {
                const orders = await getOrdersByClient(currentUser.id_key);

                if (orders.length === 0) {
                    listContainer.innerHTML = '<p class="text-muted">No has realizado pedidos aún.</p>';
                } else {
                    // Ordenar por ID descendente (más recientes primero)
                    orders.sort((a, b) => b.id_key - a.id_key);

                    listContainer.innerHTML = orders.map(order => {
                        let statusText = 'Desconocido';
                        let statusClass = 'status-pending';
                        let canCancel = false;

                        /* 
                           Status Ref:
                           1: PENDING
                           2: IN_PROGRESS
                           3: DELIVERED
                           4: CANCELED
                        */
                        switch (order.status) {
                            case 1: statusText = 'Pendiente'; statusClass = 'status-pending'; canCancel = true; break;
                            case 2: statusText = 'En Proceso'; statusClass = 'status-progress'; canCancel = true; break;
                            case 3: statusText = 'Entregado'; statusClass = 'status-delivered'; break;
                            case 4: statusText = 'Cancelado'; statusClass = 'status-canceled'; break;
                        }

                        return `
                            <div class="order-item">
                                <div class="order-info">
                                    <h4>Pedido #${order.id_key}</h4>
                                    <p>Total: <span class="price">$${order.total ? order.total.toFixed(2) : '0.00'}</span></p>
                                    <p>Fecha: ${order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div class="order-actions">
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                    ${canCancel ? `<div style="margin-top:0.5rem;"><button onclick="window.cancelUserOrder(${order.id_key})" class="btn-secondary" style="font-size:0.75rem; padding:0.2rem 0.5rem; background:rgba(255,0,0,0.1); color:red; border:1px solid red;">Cancelar</button></div>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } catch (err) {
                console.error(err);
                listContainer.innerHTML = '<p class="error-msg">Error al cargar pedidos.</p>';
            }
        }
    };

    window.cancelUserOrder = async (orderId) => {
        if (!confirm("¿Estás seguro que deseas cancelar este pedido?")) return;

        try {
            const result = await cancelOrder(orderId);
            if (result) {
                window.showToast("Pedido cancelado correctamente.");
                window.openOrdersModal(); // Recargar lista
            } else {
                alert("No se pudo cancelar el pedido.");
            }
        } catch (err) {
            console.error(err);
            alert("Error al conectar con el servidor.");
        }
    };

    // --- 5d. Lógica de Detalle de Producto y Reseñas ---

    window.openProductDetail = async (id) => {
        closeAllModals();

        // Buscar producto (idealmente fetch individual, aqui reusamos lista o fetcheamos)
        // Como no tenemos lista global expuesta facil, hacemos fetch
        const products = await getProducts(0, 1000);
        const product = products.find(p => p.id_key === id);

        if (!product) {
            window.showToast("Producto no encontrado.");
            return;
        }

        currentProduct = product;

        if (productDetailModal) {
            // Render basic info
            document.getElementById('pd-image').src = `https://picsum.photos/seed/${product.id_key}/500/400`;
            document.getElementById('pd-name').textContent = product.name;
            document.getElementById('pd-price').textContent = `$${product.price}`;
            document.getElementById('pd-stock').textContent = product.stock;
            document.getElementById('pd-category').textContent = product.category_id; // Mapping opcional si tuvieramos categorias

            const btn = document.getElementById('pd-add-btn');
            btn.textContent = product.stock > 0 ? 'Agregar al Carrito' : 'Agotado';
            btn.disabled = product.stock <= 0;
            btn.onclick = () => {
                window.addToCart(product.id_key);
                // No cerramos modal, feedback con toast
            };

            // Load Reviews
            loadProductReviews(id);

            productDetailModal.classList.remove('hidden');
        }
    };

    async function loadProductReviews(productId) {
        const listContainer = document.getElementById('pd-reviews-list');
        listContainer.innerHTML = '<p class="text-muted">Cargando reseñas...</p>';

        try {
            const reviews = await getProductReviews(productId);

            if (reviews.length === 0) {
                listContainer.innerHTML = '<p class="text-muted">No hay reseñas aún. ¡Sé el primero!</p>';
            } else {
                listContainer.innerHTML = reviews.map(r => {
                    const stars = '⭐'.repeat(Math.round(r.rating));
                    return `
                        <div class="review-item">
                            <div style="font-size:0.9rem; color:#fbbf24;">${stars} <span style="color:var(--text-muted); font-size:0.8rem;">(Cliente #${r.client_id || 'Anon'})</span></div>
                            <p style="margin:5px 0 0 0;">${r.comment || ''}</p>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p class="error-msg">Error cargando reseñas.</p>';
        }
    }

    window.submitReview = async () => {
        if (!currentUser) {
            window.showToast("Debes iniciar sesión para dejar una reseña.");
            window.openAuthModal('login');
            return;
        }

        if (!currentProduct) return;

        const rating = parseInt(document.getElementById('new-review-rating').value);
        const comment = document.getElementById('new-review-comment').value.trim();
        const statusMsg = document.getElementById('review-status');

        if (!comment) {
            statusMsg.textContent = "Por favor escribe un comentario.";
            statusMsg.style.color = "red";
            return;
        }

        statusMsg.textContent = "Enviando...";
        statusMsg.style.color = "var(--text-muted)";

        try {
            const reviewData = {
                rating: rating,
                comment: comment,
                product_id: currentProduct.id_key,
                client_id: currentUser.id_key
            };

            const result = await createReview(reviewData);

            if (result) {
                statusMsg.textContent = "¡Reseña publicada!";
                statusMsg.style.color = "green";
                document.getElementById('new-review-comment').value = ''; // Limpiar

                // Recargar lista
                loadProductReviews(currentProduct.id_key);
            } else {
                throw new Error("Falló al crear");
            }
        } catch (err) {
            console.error(err);
            statusMsg.textContent = "Error al publicar reseña.";
            statusMsg.style.color = "red";
        }
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
        let name, price, image;

        // Intentar obtener datos del DOM (Grid de productos)
        const btn = document.querySelector(`button[onclick="window.addToCart(${productId})"]`);
        const productCard = btn ? btn.closest('.card') : null;

        if (productCard) {
            name = productCard.querySelector('h3').textContent;
            price = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
            image = productCard.querySelector('img').src;
        } else if (currentProduct && currentProduct.id_key === productId) {
            // Fallback: Si estamos en el modal de detalle
            name = currentProduct.name;
            price = currentProduct.price;
            image = `https://picsum.photos/seed/${productId}/300/200`; // Reconstruct or get from currProduct
        } else {
            console.error("No se pudo identificar el producto para agregar al carrito.");
            return;
        }

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name, price, quantity: 1, image });
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
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding:1rem;">El carrito está vacío</p>';
            if (cartTotalAmount) cartTotalAmount.textContent = '$0.00';
            // Update summary if present (new design)
            updateCartSummary(0);
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item-card">
                    <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="cart-img">
                    <div class="cart-details">
                        <div class="cart-row-top">
                            <h4>${item.name}</h4>
                            <span class="cart-price">$${item.price}</span>
                        </div>
                        <div class="cart-row-bottom">
                            <div class="qty-control">
                                <button class="btn-qty" onclick="window.updateCartItemQuantity(${item.id}, -1)">−</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="btn-qty" onclick="window.updateCartItemQuantity(${item.id}, 1)">+</button>
                            </div>
                            <button class="btn-delete" onclick="window.removeCartItem(${item.id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Calculate totals
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            updateCartSummary(subtotal);
        }
    }

    function updateCartSummary(subtotal) {
        // Find or Create summary container in footer if not exists in HTML (it will be injected in css step or we assume structure)
        // Adjusting renderCartUI to inject summary as well if needed, or update existing elements.
        // The original HTML had a simple Total row. The new design needs Subtotal, Tax, Total.
        // We will inject a summary block into the footer if it doesn't match our new structure.

        const footer = document.querySelector('.cart-footer');
        if (footer) {
            // El total es simplemente la suma de los productos (subtotal)
            const total = subtotal;

            footer.innerHTML = `
                <div class="cart-summary-details">
                    <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
                </div>
                <button onclick="window.initiateCheckout()" class="btn-primary" style="width: 100%; margin-top:1rem;">Proceder al Pago &rarr;</button>
             `;
        }
    }

    window.updateCartItemQuantity = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            const newQty = item.quantity + delta;
            if (newQty >= 1) {
                item.quantity = newQty;
                saveCart();
                renderCartUI();
            }
        }
    };

    window.removeCartItem = (id) => {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCartUI();
    };

    function updateCartBadgeUI() {
        if (!cartCountBadge) return;
        const distinctItems = cart.length;
        cartCountBadge.textContent = distinctItems;

        if (distinctItems > 0) {
            cartCountBadge.classList.remove('hidden');
        } else {
            cartCountBadge.classList.add('hidden');
        }
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

    // --- Checkout Wizard Logic ---
    let currentCheckoutStep = 1;

    function updateCheckoutSteps() {
        for (let i = 1; i <= 3; i++) {
            const indicator = document.getElementById(`step-indicator-${i}`);
            const content = document.getElementById(`checkout-step-${i}`);

            // Update Indicator State
            if (indicator) {
                const circle = indicator.querySelector('.step-circle');
                const textSpan = indicator.querySelector('.step-text');
                const checkSpan = indicator.querySelector('.step-check');

                // Reset classes
                indicator.classList.remove('active', 'completed');
                if (checkSpan) checkSpan.classList.add('hidden');
                if (textSpan) textSpan.classList.remove('hidden');

                if (i < currentCheckoutStep) {
                    // Paso completado
                    indicator.classList.add('completed');
                    if (textSpan) textSpan.classList.add('hidden');
                    if (checkSpan) checkSpan.classList.remove('hidden');
                } else if (i === currentCheckoutStep) {
                    // Paso actual
                    indicator.classList.add('active');
                }
                // Else: paso futuro (default style)
            }

            // Update Content Visibility
            if (content) {
                if (i === currentCheckoutStep) content.classList.remove('hidden');
                else content.classList.add('hidden');
            }

            // Update Footer Visibility
            const footer = document.getElementById(`footer-step-${i}`);
            if (footer) {
                if (i === currentCheckoutStep) footer.classList.remove('hidden');
                else footer.classList.add('hidden');
            }
        }

        // Update Lines
        const line1 = document.getElementById('line-1');
        const line2 = document.getElementById('line-2');

        if (line1) {
            if (currentCheckoutStep > 1) line1.classList.add('filled');
            else line1.classList.remove('filled');
        }
        if (line2) {
            if (currentCheckoutStep > 2) line2.classList.add('filled');
            else line2.classList.remove('filled');
        }
    }

    window.checkoutNextStep = (step) => {
        // Validation Logic
        if (step > currentCheckoutStep) {
            if (currentCheckoutStep === 1) {
                // Validate Shipping
                const name = document.getElementById('chk-name').value.trim();
                const lastname = document.getElementById('chk-lastname').value.trim();
                const phone = document.getElementById('chk-phone').value.trim();
                const address = document.getElementById('chk-address').value.trim();
                const city = document.getElementById('chk-city').value.trim();
                const zip = document.getElementById('chk-zip').value.trim();

                if (!name || !lastname || !phone || !address || !city || !zip) {
                    alert("Por favor completa todos los campos obligatorios.");
                    return;
                }

                // Update Summary for Step 3
                const reviewShipping = document.getElementById('review-shipping');
                if (reviewShipping) {
                    reviewShipping.innerHTML = `
                        <strong>${name} ${lastname}</strong><br>
                        ${address}<br>
                        ${city}, ${zip}<br>
                        Tel: ${phone}
                     `;
                }
            }
            if (currentCheckoutStep === 2) {
                // Validate Payment
                const cardNum = document.getElementById('chk-card-number').value.trim();
                const cardName = document.getElementById('chk-card-name').value.trim();
                const cardExp = document.getElementById('chk-card-expiry').value.trim();
                const cardCvv = document.getElementById('chk-card-cvv').value.trim();

                if (!cardNum || !cardName || !cardExp || !cardCvv) {
                    alert("Por favor completa los datos de pago.");
                    return;
                }

                // Update Summary for Step 3
                const reviewPayment = document.getElementById('review-payment');
                if (reviewPayment) {
                    reviewPayment.innerHTML = `
                        Tarjeta terminada en **** ${cardNum.slice(-4)}<br>
                        Titular: ${cardName}
                     `;
                }
            }
        }

        currentCheckoutStep = step;
        updateCheckoutSteps();

        // Update Totals if moving to step 3
        if (step === 3) {
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const subElem = document.getElementById('review-subtotal');
            const totElem = document.getElementById('review-total');
            if (subElem) subElem.textContent = `$${total.toFixed(2)}`;
            if (totElem) totElem.textContent = `$${total.toFixed(2)}`;
        }
    };

    // --- Payment Input Formatting ---
    function setupPaymentInputFormatting() {
        const numberInput = document.getElementById('chk-card-number');
        const expiryInput = document.getElementById('chk-card-expiry');
        const cvvInput = document.getElementById('chk-card-cvv');

        // Prevent attaching multiple times if function called repeatedly
        if (numberInput && numberInput.dataset.formatted === 'true') return;

        if (numberInput) {
            numberInput.dataset.formatted = 'true';
            numberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length > 16) value = value.slice(0, 16); // Limit to 16 digits

                // Add space every 4 digits
                let formattedValue = '';
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) formattedValue += ' ';
                    formattedValue += value[i];
                }
                e.target.value = formattedValue;
            });
        }

        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length > 4) value = value.slice(0, 4); // Limit to 4 digits

                if (value.length >= 2) {
                    e.target.value = value.slice(0, 2) + '/' + value.slice(2);
                } else {
                    e.target.value = value;
                }
            });
            expiryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value.endsWith('/')) {
                    e.target.value = e.target.value.slice(0, -1);
                }
            });
        }

        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 3) value = value.slice(0, 3);
                e.target.value = value;
            });
        }
    }

    function openCheckoutConfirmation() {
        if (!currentUser || !checkoutModal) return;

        // Reset Step
        currentCheckoutStep = 1;
        updateCheckoutSteps();

        // Hide Status
        const statusDiv = document.getElementById('checkout-status');
        if (statusDiv) statusDiv.classList.add('hidden');

        // Pre-fill Data
        if (document.getElementById('chk-name')) document.getElementById('chk-name').value = currentUser.name || '';
        if (document.getElementById('chk-lastname')) document.getElementById('chk-lastname').value = currentUser.lastname || '';
        if (document.getElementById('chk-email')) document.getElementById('chk-email').value = currentUser.email || '';
        if (document.getElementById('chk-phone')) document.getElementById('chk-phone').value = currentUser.telephone || '';

        // Clear address fields (or load from somewhere if we had them)
        if (document.getElementById('chk-address')) document.getElementById('chk-address').value = '';
        if (document.getElementById('chk-city')) document.getElementById('chk-city').value = '';
        if (document.getElementById('chk-zip')) document.getElementById('chk-zip').value = '';

        checkoutModal.classList.remove('hidden');

        // Initialize Payment Formatting
        setupPaymentInputFormatting();
    }

    window.confirmOrder = async () => {
        const statusDiv = document.getElementById('checkout-status');
        const step3Div = document.getElementById('checkout-step-3');
        const footer3 = document.getElementById('footer-step-3');

        if (step3Div) step3Div.classList.add('hidden');
        if (footer3) footer3.classList.add('hidden'); // Hide buttons

        if (statusDiv) {
            statusDiv.classList.remove('hidden');
            statusDiv.innerHTML = '<p style="color:var(--primary); text-align:center;">Procesando orden...</p>';
        }

        try {
            // Optional: Update User Phone if changed
            const newPhone = document.getElementById('chk-phone').value.trim();
            if (newPhone && newPhone !== currentUser.telephone) {
                await updateClient(currentUser.id_key, { telephone: newPhone });
                // Update local state lightly
                currentUser.telephone = newPhone;
                localStorage.setItem('user_v1', JSON.stringify(currentUser));
            }

            const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // --- PASO 1: Crear Factura (Bill) ---
            // Se asume backend retorna { id_key: <int>, ... }
            const billData = {
                // 1. REQUERIDO: Un string único. Usamos Date.now() para que no se repita.
                bill_number: `F-${Date.now()}`,

                // 2. REQUERIDO: Solo la fecha YYYY-MM-DD (cortamos la parte de la hora)
                date: new Date().toISOString().split('T')[0],

                // 3. REQUERIDO: El monto total (NO 'amount')
                total: totalAmount,

                // 4. REQUERIDO: Un valor válido del Enum. 
                // Si falla, revisa backend/models/enums.py para ver los valores permitidos (ej: "CASH", "DEBIT").
                payment_type: 4,

                // 5. REQUERIDO: ID del cliente
                client_id: 4
            };

            console.log("Creando Factura...", billData);
            const billResp = await createBill(billData);
            if (!billResp || !billResp.id_key) throw new Error("Fallo al crear la factura (Bill)");
            const billId = billResp.id_key;


            // --- PASO 2: Crear Orden (Order) ---
            const orderData = {
                client_id: currentUser.id_key,
                bill_id: billId,
                total: totalAmount,
                delivery_method: 3, // Hardcodeado según instrucciones
                status: 1, // 1 = PENDING (asumido por Enum)
                date: new Date().toISOString()
            };

            console.log("Creando Orden...", orderData);
            const orderResp = await createOrder(orderData);
            if (!orderResp || !orderResp.id_key) throw new Error("Fallo al crear la orden (Order)");
            const orderId = orderResp.id_key;


            // --- PASO 3: Crear Detalles (Order Details) ---
            console.log("Creando Detalles para Orden #", orderId);
            for (const item of cart) {
                const detailData = {
                    order_id: orderId,
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                };

                // Fallar si un detalle no se crea podría ser catastrófico o no. 
                // Aquí, si falla, lanzamos error y el catch atrapa todo.
                const detailResp = await createOrderDetail(detailData);
                if (!detailResp) throw new Error(`Fallo al crear detalle para producto ${item.id}`);
            }


            // --- FIN: Éxito ---
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="text-align:center; padding:3rem 2rem;">
                        <div style="width: 80px; height: 80px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3 style="color:#ffffff; font-size:1.75rem; font-weight: 700; margin-bottom:0.5rem;">¡Pago Exitoso!</h3>
                        <p style="font-size:1.1rem; color: #9ca3af; margin-bottom: 2rem;">Gracias por tu compra.</p>
                        
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 0.25rem;">Número de Orden</p>
                            <p style="color: #ffffff; font-size: 1.2rem; font-weight: 600;">#${orderId}</p>
                        </div>
                        
                        <button onclick="window.closeAllModals()" class="btn-primary" style="min-width: 200px;">Volver a la Tienda</button>
                    </div>
                `;

                // Vaciar carrito
                cart = [];
                saveCart();
                renderCartUI();
            }

        } catch (err) {
            console.error(err);
            if (statusDiv) {
                statusDiv.innerHTML = `
                    < div style = "text-align:center;" >
                        <h3 style="color:red;">Error</h3>
                        <p>No se pudo procesar la orden.</p>
                        <p style="font-size:0.8rem; color:grey;">Detalle: ${err.message}</p>
                        <button onclick="window.closeAllModals()" class="btn-secondary">Cerrar</button>
                    </div >
                    `;
            }
        }
    };

    // --- 7. Inicialización (Router Simple) ---
    const init = async () => {
        // Auth check
        if (currentUser) {
            updateNavbarUI();
        }

        // Logic split based on page existence
        if (productListContainer) {
            // We are on products.html
            await loadProductsList(productListContainer); // Load all
        } else if (document.getElementById('hero-carousel')) {
            // We are on index.html
            // If we still want featured products in some other container, we could load them, 
            // but for now we just init the carousel and scroll reveal.
            // await loadFeaturedProducts(homePreviewContainer); 
            initCarousel(); // Start Carousel
            initScrollReveal(); // Start Scroll Animation
        }
    };


    // --- 8. Funciones de Carga de Productos ---

    // --- 8. Funciones de Carga de Productos (Refactorizado con Filtros) ---

    // State global para filtros
    let masterProducts = [];       // Inmutable
    let filteredProducts = [];     // Renderizado
    let categoriesMap = {};        // ID -> Nombre
    let priceMinLimit = 0;         // Calculated Min
    let priceMaxLimit = 10000;     // Calculated Max
    let searchDebounceTimer = null;

    // Filtros activos
    let activeFilters = {
        search: '',
        categories: [], // IDs
        minPrice: 0,
        maxPrice: 10000,
        stockOnly: false
    };

    async function loadProductsList(container) {
        container.innerHTML = '<p class="text-center col-12">Cargando inventario...</p>';

        try {
            // 1. Cargar Datos (Paralelo)
            const [products, categories] = await Promise.all([
                getProducts(0, 1000), // Eager load
                getCategories(0, 100)
            ]);

            if (!products || products.length === 0) {
                container.innerHTML = '<p class="text-center col-12">No hay productos disponibles.</p>';
                return;
            }

            // 2. Guardar Master State
            masterProducts = products;

            // 3. Procesar Categorías
            if (categories) {
                categories.forEach(cat => {
                    categoriesMap[cat.id_key] = cat.name;
                });
                renderCategoryFilters(categories);
            }

            // 4. Calcular Rangos de Precio
            const prices = products.map(p => p.price);
            priceMinLimit = Math.floor(Math.min(...prices));
            priceMaxLimit = Math.ceil(Math.max(...prices));

            // Inicializar sliders con los limites reales
            initPriceSliders(priceMinLimit, priceMaxLimit);

            // 5. Setup de Event Listeners
            setupFilterListeners();

            // 6. Render Inicial
            applyFilters();

        } catch (error) {
            console.error("Error cargando productos:", error);
            container.innerHTML = '<p class="text-center text-danger col-12">Error al cargar productos.</p>';
        }
    }

    function renderCategoryFilters(categories) {
        const container = document.getElementById('categories-container');
        if (!container) return;

        container.innerHTML = categories.map(cat => `
            <label class="checkbox-item">
                <input type="checkbox" value="${cat.id_key}" onchange="window.handleCategoryChange(this)">
                ${cat.name}
            </label>
        `).join('');
    }

    function initPriceSliders(min, max) {
        const rangeMin = document.getElementById('price-min');
        const rangeMax = document.getElementById('price-max');
        const inputMin = document.getElementById('input-min');
        const inputMax = document.getElementById('input-max');
        const label = document.getElementById('price-label');

        if (label) label.textContent = `Precio ($${min} - $${max})`;

        // Set attributes
        [rangeMin, rangeMax].forEach(el => {
            if (el) { el.min = min; el.max = max; }
        });

        // Set initial values
        if (rangeMin) rangeMin.value = min;
        if (rangeMax) rangeMax.value = max;
        if (inputMin) inputMin.value = min;
        if (inputMax) inputMax.value = max;

        // Update active state
        activeFilters.minPrice = min;
        activeFilters.maxPrice = max;
    }

    function setupFilterListeners() {
        // Search
        const searchInput = document.getElementById('store-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(() => {
                    activeFilters.search = e.target.value;
                    applyFilters();
                }, 300); // 300ms debounce
            });
        }

        // Price Sliders (Dual Logic)
        const rangeMin = document.getElementById('price-min');
        const rangeMax = document.getElementById('price-max');
        const inputMin = document.getElementById('input-min');
        const inputMax = document.getElementById('input-max');

        const handlePriceChange = () => {
            let min = parseInt(rangeMin.value);
            let max = parseInt(rangeMax.value);

            if (min > max) {
                // Swap visual hook if crossed? Or just clamp.
                // Simple swap logic for inputs
                [min, max] = [max, min];
            }

            // Update Text Inputs
            if (inputMin) inputMin.value = min;
            if (inputMax) inputMax.value = max;

            activeFilters.minPrice = min;
            activeFilters.maxPrice = max;
            applyFilters();
        };

        if (rangeMin) rangeMin.addEventListener('input', handlePriceChange);
        if (rangeMax) rangeMax.addEventListener('input', handlePriceChange);

        // Stock Toggle
        const stockToggle = document.getElementById('stock-toggle');
        if (stockToggle) {
            stockToggle.addEventListener('change', (e) => {
                activeFilters.stockOnly = e.target.checked;
                applyFilters();
            });
        }
    }

    // Window global handlers for inline events
    window.handleCategoryChange = (checkbox) => {
        const val = parseInt(checkbox.value);
        if (checkbox.checked) {
            activeFilters.categories.push(val);
        } else {
            activeFilters.categories = activeFilters.categories.filter(id => id !== val);
        }
        applyFilters();
    };

    window.resetFilters = () => {
        // 1. Reset State
        activeFilters = {
            search: '',
            categories: [],
            minPrice: priceMinLimit,
            maxPrice: priceMaxLimit,
            stockOnly: false
        };

        // 2. Reset UI Elements
        // Search
        const searchInput = document.getElementById('store-search');
        if (searchInput) searchInput.value = '';

        // Categories
        document.querySelectorAll('#categories-container input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Price
        initPriceSliders(priceMinLimit, priceMaxLimit);

        // Stock
        const stockToggle = document.getElementById('stock-toggle');
        if (stockToggle) stockToggle.checked = false;

        // 3. Apply
        applyFilters();
    };

    function applyFilters() {
        // Normalización para case insensitive / accents
        const cleanText = (str) => {
            return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        const searchText = cleanText(activeFilters.search);

        filteredProducts = masterProducts.filter(product => {
            // A. Search
            if (searchText) {
                const prodName = cleanText(product.name);
                if (!prodName.includes(searchText)) return false;
            }

            // B. Categories
            if (activeFilters.categories.length > 0) {
                if (!activeFilters.categories.includes(product.category_id)) return false;
            }

            // C. Price
            if (product.price < activeFilters.minPrice || product.price > activeFilters.maxPrice) return false;

            // D. Stock
            if (activeFilters.stockOnly && product.stock <= 0) return false;

            return true;
        });

        renderProducts(filteredProducts);
    }

    function renderProducts(products) {
        const container = productListContainer; // Scope from init or global
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center" style="grid-column: 1 / -1; padding: 4rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3 class="text-muted">No se encontraron resultados</h3>
                    <p class="text-muted">Intenta con otros filtros o términos de búsqueda.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        products.forEach(product => {
            // Podemos inyectar el nombre de categoría si quisiéramos sobrescribir el HTML
            // pero usamos el por defecto components.js
            container.innerHTML += getProductCardHTML(product);
        });
    }

    async function loadFeaturedProducts(container) {
        container.innerHTML = '<p>Cargando destacados...</p>';
        try {
            // Get all products and pick 4 random or latest
            const products = await getProducts(0, 100);
            if (products && products.length > 0) {
                container.innerHTML = '';
                // Sort by ID descending (newest) and take 4
                const featured = products.sort((a, b) => b.id_key - a.id_key).slice(0, 4);
                featured.forEach(product => {
                    container.innerHTML += getProductCardHTML(product);
                });
            } else {
                container.innerHTML = '<p>No hay destacados.</p>';
            }
        } catch (e) {
            container.innerHTML = '<p>Error cargando destacados.</p>';
        }
    }

    // --- 9. Carousel Logic ---
    function initCarousel() {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;

        if (totalSlides === 0) return;

        window.moveCarousel = (step) => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + step + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
        };

        // Auto move every 5 seconds
        setInterval(() => {
            window.moveCarousel(1);
        }, 5000);
    }

    // --- 10. Inicialización Global ---
    window.closeAllModals = closeAllModals;
    init(); // Call init function on page load
});
