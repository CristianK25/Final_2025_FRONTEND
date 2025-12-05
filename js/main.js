import { loadNavbar, loadFooter, renderModals, createProductCard } from './components.js';
import { fetchData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Renderizado de componentes estáticos y modales ---
    loadNavbar();
    loadFooter();
    
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'modals-container';
    modalsContainer.innerHTML = renderModals();
    document.body.appendChild(modalsContainer);

    // --- 2. Estado de la aplicación ---
    let cart = []; // Array para almacenar { id, name, price, quantity }

    // --- 3. Selectores del DOM ---
    const overlay = document.getElementById('modal-overlay');
    const loginModal = document.getElementById('modal-login');
    const cartSidebar = document.getElementById('cart-sidebar');
    const checkoutModal = document.getElementById('modal-checkout');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutTotalSpan = document.getElementById('checkout-total');

    // --- 4. Lógica de Modales ---
    window.closeAllModals = () => {
        overlay.classList.add('hidden');
        loginModal.classList.add('hidden');
        checkoutModal.classList.add('hidden');
        cartSidebar.classList.remove('visible');
    };

    window.openLogin = () => {
        closeAllModals();
        overlay.classList.remove('hidden');
        loginModal.classList.remove('hidden');
    };

    window.openCart = () => {
        closeAllModals();
        overlay.classList.remove('hidden');
        cartSidebar.classList.add('visible');
        renderCart();
    };

    window.openCheckout = () => {
        closeAllModals();
        if (cart.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }
        overlay.classList.remove('hidden');
        checkoutModal.classList.remove('hidden');
        
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        checkoutTotalSpan.textContent = `$${total.toFixed(2)}`;
    };

    // --- 5. Lógica del Carrito ---
    window.addToCart = (productId) => {
        // Simplificación: Se extrae la info del producto directamente del DOM de la tarjeta.
        const productCard = document.querySelector(`button[onclick="addToCart(${productId})"]`).closest('.card');
        const name = productCard.querySelector('h3').textContent;
        const priceString = productCard.querySelector('.price').textContent;
        const price = parseFloat(priceString.replace('$', ''));

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name, price, quantity: 1 });
        }

        console.log("Carrito actualizado:", cart);
        updateCartBadge();
        openCart(); // Abrir el carrito para mostrar el producto agregado
    };
    
    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>El carrito está vacío</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" style="display:flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        }
        updateCartBadge();
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountBadge.textContent = `(${totalItems})`;
    }

    // --- 6. Inicialización de productos en la página principal ---
    const productListContainer = document.getElementById('product-list-container');
    if (productListContainer) {
        fetchData('/products?skip=0&limit=20').then(products => {
            if (products && products.length > 0) {
                productListContainer.innerHTML = products.map(createProductCard).join('');
            } else {
                productListContainer.innerHTML = '<p>No se encontraron productos.</p>';
            }
        }).catch(error => {
            console.error("Error al cargar productos en la página principal:", error);
            productListContainer.innerHTML = '<p>Error al cargar los productos. Intente de nuevo más tarde.</p>';
        });
    }
});
