import { getNavbarHTML, getFooterHTML, getModalsHTML, getProductCardHTML } from './components.js';
import { fetchData, findClientByEmail, createClient, createOrder, updateClient, getOrdersByClient, cancelOrder, createReview, getProductReviews } from './api.js';

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
        const pass = document.getElementById('login-pass').value.trim(); // Simulada
        const msg = document.getElementById('msg-login');

        if (!email) {
            msg.textContent = "Ingresa tu email.";
            return;
        }

        // --- Admin Check ---
        if (email === 'admin@admin.com' && pass === 'admin123') {
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
                <div style="display:flex; align-items:center;">
                    <a href="#" onclick="window.openProfileModal()" style="margin-right:15px; font-weight:600; text-decoration:none; color:var(--text-main);">
                        Hola, ${currentUser.name}
                    </a>
                    <a href="#" onclick="window.openOrdersModal()" style="margin-right:15px; font-size:0.9rem; text-decoration:none; color:var(--primary);">
                        Mis Pedidos
                    </a>
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
        const products = await fetchData('/products?skip=0&limit=1000');
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
        let name, price;

        // Intentar obtener datos del DOM (Grid de productos)
        const btn = document.querySelector(`button[onclick="window.addToCart(${productId})"]`);
        const productCard = btn ? btn.closest('.card') : null;

        if (productCard) {
            name = productCard.querySelector('h3').textContent;
            price = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
        } else if (currentProduct && currentProduct.id_key === productId) {
            // Fallback: Si estamos en el modal de detalle
            name = currentProduct.name;
            price = currentProduct.price;
        } else {
            console.error("No se pudo identificar el producto para agregar al carrito.");
            return;
        }

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
                <h3 style="color:red;">Error</h3>
                <p>No se pudo procesar la orden.</p>
                <button onclick="window.closeAllModals()" class="btn-secondary">Cerrar</button>
            `;
        }
    };

    // --- 7. Inicialización (Router Simple) ---
    const init = async () => {
        // Auth check
        if (currentUser) {
            updateNavbarUser();
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

    async function loadProductsList(container) {
        container.innerHTML = '<p class="text-center col-12">Cargando productos...</p>';

        try {
            const products = await fetchData('/products?skip=0&limit=100');

            if (!products || products.length === 0) {
                container.innerHTML = '<p class="text-center col-12">No hay productos disponibles.</p>';
                return;
            }

            container.innerHTML = '';
            products.forEach(product => {
                container.innerHTML += getProductCardHTML(product);
            });

        } catch (error) {
            console.error("Error cargando productos:", error);
            container.innerHTML = '<p class="text-center text-danger col-12">Error al cargar productos.</p>';
        }
    }

    async function loadFeaturedProducts(container) {
        container.innerHTML = '<p>Cargando destacados...</p>';
        try {
            // Get all products and pick 4 random or latest
            const products = await fetchData('/products?skip=0&limit=100');
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
